package com.example.kltn.models;

import java.util.List;

public class Exercise {
    private String id;
    private String title;
    private String description;
    private String courseId;
    private String type; // "practice", "quiz", "assignment"
    private List<String> questionIds; // Danh sách ID câu hỏi từ collection questions
    private int timeLimit; // Thời gian làm bài (phút), 0 = không giới hạn
    private int totalPoints;
    private String difficulty; // "easy", "medium", "hard"
    private boolean isActive;
    private String createdBy;
    private long createdAt;
    private long updatedAt;

    // Constructor
    public Exercise() {}

    public Exercise(String id, String title, String description, String courseId, 
                   String type, List<String> questionIds, int timeLimit, 
                   int totalPoints, String difficulty, String createdBy) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.courseId = courseId;
        this.type = type;
        this.questionIds = questionIds;
        this.timeLimit = timeLimit;
        this.totalPoints = totalPoints;
        this.difficulty = difficulty;
        this.isActive = true;
        this.createdBy = createdBy;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<String> questionIds) { this.questionIds = questionIds; }

    public int getTimeLimit() { return timeLimit; }
    public void setTimeLimit(int timeLimit) { this.timeLimit = timeLimit; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
} 