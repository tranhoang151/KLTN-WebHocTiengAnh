using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BingGoWebAPI.Services;
using BingGoWebAPI.Models;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ICustomAuthService _authService;
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ICustomAuthService authService, FirestoreDb firestoreDb, ILogger<DashboardController> logger)
        {
            _authService = authService;
            _firestoreDb = firestoreDb;
            _logger = logger;
        }

        [HttpGet("student")]
        public async Task<IActionResult> GetStudentDashboard()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null || user.Role.ToLower() != "student")
                {
                    return Forbid("Access denied for non-student users");
                }

                // Get user's classes
                var classes = new List<Class>();
                if (user.ClassIds.Any())
                {
                    foreach (var classId in user.ClassIds)
                    {
                        var classDoc = await _firestoreDb.Collection("classes").Document(classId).GetSnapshotAsync();
                        if (classDoc.Exists)
                        {
                            var classData = classDoc.ConvertTo<Class>();
                            classData.Id = classDoc.Id;
                            classes.Add(classData);
                        }
                    }
                }

                // Get recent exercises
                var exercisesQuery = _firestoreDb.Collection("exercises")
                    .WhereArrayContains("course_id", classes.Select(c => c.CourseId).FirstOrDefault() ?? "")
                    .Limit(5);
                var exercisesSnapshot = await exercisesQuery.GetSnapshotAsync();
                var recentExercises = exercisesSnapshot.Documents
                    .Select(doc => { var ex = doc.ConvertTo<Exercise>(); ex.Id = doc.Id; return ex; })
                    .ToList();

                // Get recent videos
                var videosQuery = _firestoreDb.Collection("video_lectures")
                    .WhereArrayContains("course_id", classes.Select(c => c.CourseId).FirstOrDefault() ?? "")
                    .Limit(5);
                var videosSnapshot = await videosQuery.GetSnapshotAsync();
                var recentVideos = videosSnapshot.Documents
                    .Select(doc => { var vid = doc.ConvertTo<Video>(); vid.Id = doc.Id; return vid; })
                    .ToList();

                // Get user's badges
                var badgesQuery = _firestoreDb.Collection("badges");
                var badgesSnapshot = await badgesQuery.GetSnapshotAsync();
                var allBadges = badgesSnapshot.Documents
                    .Select(doc => { var badge = doc.ConvertTo<Badge>(); badge.Id = doc.Id; return badge; })
                    .ToList();

                var dashboard = new
                {
                    user = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        streakCount = user.StreakCount,
                        lastLearningDate = user.LastLearningDate,
                        avatarUrl = user.AvatarUrl
                    },
                    classes = classes.Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,
                        description = c.Description,
                        courseId = c.CourseId
                    }),
                    recentExercises = recentExercises.Select(ex => new
                    {
                        id = ex.Id,
                        title = ex.Title,
                        type = ex.Type,
                        difficulty = ex.Difficulty,
                        totalPoints = ex.TotalPoints
                    }),
                    recentVideos = recentVideos.Select(vid => new
                    {
                        id = vid.Id,
                        title = vid.Title,
                        description = vid.Description,
                        duration = vid.Duration,
                        thumbnailUrl = vid.ThumbnailUrl
                    }),
                    badges = allBadges.Select(badge => new
                    {
                        id = badge.Id,
                        name = badge.Name,
                        description = badge.Description,
                        imageUrl = badge.ImageUrl,
                        isActive = badge.IsActive
                    }),
                    stats = new
                    {
                        totalClasses = classes.Count,
                        totalExercises = recentExercises.Count,
                        totalVideos = recentVideos.Count,
                        currentStreak = user.StreakCount
                    }
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student dashboard");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("teacher")]
        public async Task<IActionResult> GetTeacherDashboard()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null || user.Role.ToLower() != "teacher")
                {
                    return Forbid("Access denied for non-teacher users");
                }

                // Get teacher's classes
                var classesQuery = _firestoreDb.Collection("classes").WhereEqualTo("teacher_id", userId);
                var classesSnapshot = await classesQuery.GetSnapshotAsync();
                var classes = classesSnapshot.Documents
                    .Select(doc => { var c = doc.ConvertTo<Class>(); c.Id = doc.Id; return c; })
                    .ToList();

                // Get courses for teacher's classes
                var courseIds = classes.Select(c => c.CourseId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
                var courses = new List<Course>();
                foreach (var courseId in courseIds)
                {
                    var courseDoc = await _firestoreDb.Collection("courses").Document(courseId).GetSnapshotAsync();
                    if (courseDoc.Exists)
                    {
                        var course = courseDoc.ConvertTo<Course>();
                        course.Id = courseDoc.Id;
                        courses.Add(course);
                    }
                }

                // Get recent exercises for teacher's courses
                var exercises = new List<Exercise>();
                foreach (var courseId in courseIds)
                {
                    var exercisesQuery = _firestoreDb.Collection("exercises")
                        .WhereEqualTo("course_id", courseId)
                        .Limit(3);
                    var exercisesSnapshot = await exercisesQuery.GetSnapshotAsync();
                    exercises.AddRange(exercisesSnapshot.Documents
                        .Select(doc => { var ex = doc.ConvertTo<Exercise>(); ex.Id = doc.Id; return ex; }));
                }

                // Get student count
                var allStudents = new List<string>();
                foreach (var classData in classes)
                {
                    allStudents.AddRange(classData.StudentIds);
                }
                var uniqueStudents = allStudents.Distinct().Count();

                var dashboard = new
                {
                    user = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        avatarUrl = user.AvatarUrl
                    },
                    classes = classes.Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,
                        description = c.Description,
                        capacity = c.Capacity,
                        studentCount = c.StudentIds.Count,
                        courseId = c.CourseId
                    }),
                    courses = courses.Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,
                        description = c.Description,
                        imageUrl = c.ImageUrl
                    }),
                    recentExercises = exercises.Take(5).Select(ex => new
                    {
                        id = ex.Id,
                        title = ex.Title,
                        type = ex.Type,
                        difficulty = ex.Difficulty,
                        courseId = ex.CourseId
                    }),
                    stats = new
                    {
                        totalClasses = classes.Count,
                        totalStudents = uniqueStudents,
                        totalCourses = courses.Count,
                        totalExercises = exercises.Count
                    }
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting teacher dashboard");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null || user.Role.ToLower() != "admin")
                {
                    return Forbid("Access denied for non-admin users");
                }

                // Get system-wide statistics
                var usersQuery = _firestoreDb.Collection("users");
                var usersSnapshot = await usersQuery.GetSnapshotAsync();
                var totalUsers = usersSnapshot.Count;
                var students = usersSnapshot.Documents.Count(doc => doc.ConvertTo<User>().Role.ToLower() == "student");
                var teachers = usersSnapshot.Documents.Count(doc => doc.ConvertTo<User>().Role.ToLower() == "teacher");
                var admins = usersSnapshot.Documents.Count(doc => doc.ConvertTo<User>().Role.ToLower() == "admin");

                var classesQuery = _firestoreDb.Collection("classes");
                var classesSnapshot = await classesQuery.GetSnapshotAsync();
                var totalClasses = classesSnapshot.Count;

                var coursesQuery = _firestoreDb.Collection("courses");
                var coursesSnapshot = await coursesQuery.GetSnapshotAsync();
                var totalCourses = coursesSnapshot.Count;

                var exercisesQuery = _firestoreDb.Collection("exercises");
                var exercisesSnapshot = await exercisesQuery.GetSnapshotAsync();
                var totalExercises = exercisesSnapshot.Count;

                var dashboard = new
                {
                    user = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        avatarUrl = user.AvatarUrl
                    },
                    stats = new
                    {
                        totalUsers,
                        totalStudents = students,
                        totalTeachers = teachers,
                        totalAdmins = admins,
                        totalClasses,
                        totalCourses,
                        totalExercises
                    },
                    recentActivity = new
                    {
                        recentUsers = usersSnapshot.Documents
                            .OrderByDescending(doc => doc.ConvertTo<User>().LastLoginDate)
                            .Take(5)
                            .Select(doc =>
                            {
                                var u = doc.ConvertTo<User>();
                                u.Id = doc.Id;
                                return new
                                {
                                    id = u.Id,
                                    fullName = u.FullName,
                                    email = u.Email,
                                    role = u.Role,
                                    lastLoginDate = u.LastLoginDate
                                };
                            }),
                        recentClasses = classesSnapshot.Documents
                            .OrderByDescending(doc => doc.ConvertTo<Class>().CreatedAt)
                            .Take(5)
                            .Select(doc =>
                            {
                                var c = doc.ConvertTo<Class>();
                                c.Id = doc.Id;
                                return new
                                {
                                    id = c.Id,
                                    name = c.Name,
                                    description = c.Description,
                                    studentCount = c.StudentIds.Count,
                                    capacity = c.Capacity
                                };
                            })
                    }
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin dashboard");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}