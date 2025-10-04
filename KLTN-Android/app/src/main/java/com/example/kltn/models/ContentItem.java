package com.example.kltn.models;

import java.util.List;
import java.util.Map;

public class ContentItem {
    private String id;
    private String title;
    private String description;
    private String imageUrl;
    private String type; // "flashcard" or "test"
    private String category; // "vocabulary", "grammar", etc.
    private long createdAt;
    private boolean isActive;
    private String courseId;
    private List<Map<String, Object>> questions;
    private List<String> questionIds;
    private int duration;
    private int maxScore;

    // Default constructor for Firebase
    public ContentItem() {
    }

    public ContentItem(String id, String title, String description, String imageUrl, String type, String category) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.type = type;
        this.category = category;
        this.createdAt = System.currentTimeMillis();
        this.isActive = true;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getCourseId() {
        return courseId;
    }
    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public List<Map<String, Object>> getQuestions() {
        return questions;
    }
    public void setQuestions(List<Map<String, Object>> questions) {
        this.questions = questions;
    }

    public List<String> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(int maxScore) {
        this.maxScore = maxScore;
    }
} 