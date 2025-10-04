package com.example.kltn.models;

import java.util.List;

public class Test {
    private String id;
    private String title;
    private String description;
    private String courseId;
    private String type; // "midterm", "final", "quiz", "assignment"
    private List<String> questionIds; // Danh sách ID câu hỏi từ collection questions
    private int timeLimit; // Thời gian làm bài (phút)
    private int totalPoints;
    private int passingScore; // Điểm đạt
    private String difficulty; // "easy", "medium", "hard"
    private boolean isActive;
    private boolean isPublished; // Có được publish cho học sinh làm chưa
    private String createdBy;
    private long createdAt;
    private long updatedAt;
    private long startDate; // Thời gian bắt đầu cho phép làm bài
    private long endDate; // Thời gian kết thúc

    // Constructor
    public Test() {}

    public Test(String id, String title, String description, String courseId, 
               String type, List<String> questionIds, int timeLimit, 
               int totalPoints, int passingScore, String difficulty, String createdBy) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.courseId = courseId;
        this.type = type;
        this.questionIds = questionIds;
        this.timeLimit = timeLimit;
        this.totalPoints = totalPoints;
        this.passingScore = passingScore;
        this.difficulty = difficulty;
        this.isActive = true;
        this.isPublished = false;
        this.createdBy = createdBy;
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
        this.startDate = 0; // Chưa set thời gian
        this.endDate = 0; // Chưa set thời gian
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

    public int getPassingScore() { return passingScore; }
    public void setPassingScore(int passingScore) { this.passingScore = passingScore; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isPublished() { return isPublished; }
    public void setPublished(boolean published) { isPublished = published; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }

    public long getStartDate() { return startDate; }
    public void setStartDate(long startDate) { this.startDate = startDate; }

    public long getEndDate() { return endDate; }
    public void setEndDate(long endDate) { this.endDate = endDate; }
} 