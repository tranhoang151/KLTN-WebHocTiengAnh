package com.example.kltn.models;

public class VideoLesson {
    public String id;
    public String title;
    public String description;
    public String duration;
    public String topic;
    public String thumbnailUrl;
    public String videoUrl;
    public String teacherId;
    public String courseId;

    public VideoLesson() {}

    public VideoLesson(String id, String title, String description, String duration, String topic, String thumbnailUrl, String videoUrl, String teacherId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.topic = topic;
        this.thumbnailUrl = thumbnailUrl;
        this.videoUrl = videoUrl;
        this.teacherId = teacherId;
    }
} 