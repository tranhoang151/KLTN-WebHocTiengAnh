namespace BingGoWebAPI.Models
{
    public class UserProgress
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int TotalFlashcardsStudied { get; set; }
        public int TotalTimeSpent { get; set; } // in minutes
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime LastStudyDate { get; set; }
        public Dictionary<string, int> SubjectProgress { get; set; } = new();
        public List<string> CompletedSets { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // New Properties
        public DateTime LastUpdated { get; set; }
        public int TotalXp { get; set; }
        public int CurrentLevel { get; set; }
    }



    public class LearningStreak
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime LastStudyDate { get; set; }
        public DateTime StreakStartDate { get; set; }
        public List<DateTime> StudyDates { get; set; } = new();

        // New Property
        public DateTime LastUpdated { get; set; }
    }
}