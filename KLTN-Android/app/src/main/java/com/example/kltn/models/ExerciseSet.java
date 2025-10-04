package com.example.kltn.models;

public class ExerciseSet {
    public String id;
    public String title;
    public int questionCount;
    public String type;

    public ExerciseSet(String id, String title, int questionCount, String type) {
        this.id = id;
        this.title = title;
        this.questionCount = questionCount;
        this.type = type;
    }
} 