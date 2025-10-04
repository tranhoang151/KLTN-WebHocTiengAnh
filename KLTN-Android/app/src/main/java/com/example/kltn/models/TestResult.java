package com.example.kltn.models;

public class TestResult {
    private String testName;
    private int score;
    private String date;
    private String scoreDetail;
    private String duration;

    public TestResult(String testName, int score, String date, String scoreDetail, String duration) {
        this.testName = testName;
        this.score = score;
        this.date = date;
        this.scoreDetail = scoreDetail;
        this.duration = duration;
    }

    public String getTestName() { return testName; }
    public int getScore() { return score; }
    public String getDate() { return date; }
    public String getScoreDetail() { return scoreDetail; }
    public String getDuration() { return duration; }
} 