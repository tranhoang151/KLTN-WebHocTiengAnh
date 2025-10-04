package com.example.kltn.models;

public class ActivityItem {
    private String description;
    private String topic;
    private String timeAgo;
    private String status;

    public ActivityItem(String description, String topic, String timeAgo, String status) {
        this.description = description;
        this.topic = topic;
        this.timeAgo = timeAgo;
        this.status = status;
    }

    public String getDescription() { return description; }
    public String getTopic() { return topic; }
    public String getTimeAgo() { return timeAgo; }
    public String getStatus() { return status; }
} 