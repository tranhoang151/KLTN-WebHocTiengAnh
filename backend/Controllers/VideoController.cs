using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VideoController : ControllerBase
{
    private readonly IFirebaseService _firebaseService;
    private readonly IBadgeService _badgeService;
    private readonly ILogger<VideoController> _logger;

    public VideoController(IFirebaseService firebaseService, IBadgeService badgeService, ILogger<VideoController> logger)
    {
        _firebaseService = firebaseService;
        _badgeService = badgeService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> GetAllVideos()
    {
        try
        {
            var videos = await _firebaseService.GetAllVideosAsync();
            return Ok(videos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all videos");
            return StatusCode(500, new { message = "Error retrieving videos", error = ex.Message });
        }
    }

    [HttpPost("{videoId}/assign")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AssignVideo(string videoId, [FromBody] List<string> classIds)
    {
        try
        {
            await _firebaseService.AssignVideoToClassesAsync(videoId, classIds);
            _logger.LogInformation("Video {VideoId} assigned to classes {ClassIds}", videoId, string.Join(",", classIds));
            return Ok(new { message = "Video assigned successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Assign failed: Video not found: {VideoId}", videoId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning video {VideoId}", videoId);
            return StatusCode(500, new { message = "Error assigning video", error = ex.Message });
        }
    }

    [HttpPost("watch-complete")]
    public async Task<IActionResult> WatchVideoComplete([FromBody] VideoWatchDto watchDto)
    {
        try
        {
            await _firebaseService.UpdateVideoProgressAsync(watchDto.UserId, watchDto.VideoId, true);

            // Record learning activity
            var activity = new LearningActivity
            {
                Type = "video",
                VideoId = watchDto.VideoId,
                CompletedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp()
            };
            await _firebaseService.UpdateLearningHistoryAsync(watchDto.UserId, activity);

            // Update learning streak
            var user = await _firebaseService.GetUserByIdAsync(watchDto.UserId);
            if (user != null)
            {
                var today = DateTime.UtcNow.Date;
                var lastLearningDate = user.LastLearningDate == null ? (DateTime?)null : DateTime.Parse(user.LastLearningDate).Date;

                if (lastLearningDate.HasValue)
                {
                    if (lastLearningDate.Value == today) // Already learned today
                    {
                        // No change to streak
                    }
                    else if (lastLearningDate.Value == today.AddDays(-1)) // Learned yesterday, continue streak
                    {
                        user.LearningStreakCount++;
                    }
                    else // Missed a day, reset streak
                    {
                        user.LearningStreakCount = 1;
                    }
                }
                else // First learning activity
                {
                    user.LearningStreakCount = 1;
                }

                user.LastLearningDate = today.ToString("yyyy-MM-dd");
                await _firebaseService.UpdateUserAsync(user.Id, user);

                // Check and award learning streak badge
                await _badgeService.CheckAndAwardBadgeAsync(user.Id, "learning_streak_3");
            }

            // Check for video watch badge
            await _badgeService.CheckAndAwardBadgeAsync(watchDto.UserId, "video_watch");

            return Ok(new { message = "Video watch progress updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating video watch progress for user {UserId}, video {VideoId}", watchDto.UserId, watchDto.VideoId);
            return StatusCode(500, new { message = "Error updating video watch progress", error = ex.Message });
        }
    }

    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetVideoHistory(string userId)
    {
        try
        {
            var activities = await _firebaseService.GetVideoLearningHistoryAsync(userId);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving video learning history for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving learning history", error = ex.Message });
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetVideosByCourse(string courseId)
    {
        try
        {
            var videos = await _firebaseService.GetVideosByCourseAsync(courseId);
            return Ok(videos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving videos for course {CourseId}", courseId);
            return StatusCode(500, new { message = "Error retrieving videos", error = ex.Message });
        }
    }

    [HttpGet("{videoId}")]
    public async Task<IActionResult> GetVideo(string videoId)
    {
        try
        {
            var video = await _firebaseService.GetVideoByIdAsync(videoId);
            if (video == null)
            {
                return NotFound(new { message = "Video not found" });
            }
            return Ok(video);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving video {VideoId}", videoId);
            return StatusCode(500, new { message = "Error retrieving video", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> AddVideo([FromBody] Video video)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            video.Id = Guid.NewGuid().ToString();
            video.CreatedAt = Google.Cloud.Firestore.Timestamp.GetCurrentTimestamp();
            var createdVideo = await _firebaseService.AddVideoAsync(video);
            _logger.LogInformation("Video added: {VideoId}", createdVideo.Id);
            return CreatedAtAction(nameof(GetVideo), new { videoId = createdVideo.Id }, createdVideo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding video");
            return StatusCode(500, new { message = "Error adding video", error = ex.Message });
        }
    }

    [HttpPut("{videoId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateVideo(string videoId, [FromBody] Video video)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var updatedVideo = await _firebaseService.UpdateVideoAsync(videoId, video);
            if (updatedVideo == null)
            {
                return NotFound(new { message = "Video not found" });
            }
            _logger.LogInformation("Video updated: {VideoId}", videoId);
            return Ok(updatedVideo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating video");
            return StatusCode(500, new { message = "Error updating video", error = ex.Message });
        }
    }

    [HttpDelete("{videoId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteVideo(string videoId)
    {
        try
        {
            await _firebaseService.DeleteVideoAsync(videoId);
            _logger.LogInformation("Video deleted: {VideoId}", videoId);
            return Ok(new { message = "Video deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting video");
            return StatusCode(500, new { message = "Error deleting video", error = ex.Message });
        }
    }
}