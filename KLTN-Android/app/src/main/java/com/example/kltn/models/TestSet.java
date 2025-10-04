package com.example.kltn.models;

public class TestSet {
    public String id;
    public String title;
    public int duration;
    public int maxScore;
    public String exerciseId;
    public int questionCount;

    // Constructor mặc định
    public TestSet() {}

    // Constructor đầy đủ
    public TestSet(String id, String title, int duration, int maxScore, String exerciseId, int questionCount) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.maxScore = maxScore;
        this.exerciseId = exerciseId;
        this.questionCount = questionCount;
    }
} 