package com.example.kltn.models;

import java.util.List;
import java.util.Map;

public class Question {
    private String id;
    private String content;
    private String type; // "multiple_choice", "true_false", "fill_blank", "essay"
    private java.util.List<String> options; // Cho multiple choice
    private String correct_answer;
    private String explanation;
    private String difficulty; // "easy", "medium", "hard"
    private java.util.List<String> tags; // Tags để phân loại
    private String course_id;
    private String created_by;
    private long created_at;
    private boolean is_active;

    // Constructor
    public Question() {}

    public Question(String id, String content, String type, java.util.List<String> options,
                   String correct_answer, String explanation, String difficulty,
                   java.util.List<String> tags, String course_id, String created_by) {
        this.id = id;
        this.content = content;
        this.type = type;
        this.options = options;
        this.correct_answer = correct_answer;
        this.explanation = explanation;
        this.difficulty = difficulty;
        this.tags = tags;
        this.course_id = course_id;
        this.created_by = created_by;
        this.created_at = System.currentTimeMillis();
        this.is_active = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public java.util.List<String> getOptions() { return options; }
    public void setOptions(java.util.List<String> options) { this.options = options; }

    public String getCorrect_answer() { return correct_answer; }
    public void setCorrect_answer(String correct_answer) { this.correct_answer = correct_answer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public java.util.List<String> getTags() { return tags; }
    public void setTags(java.util.List<String> tags) { this.tags = tags; }

    public String getCourse_id() { return course_id; }
    public void setCourse_id(String course_id) { this.course_id = course_id; }

    public String getCreated_by() { return created_by; }
    public void setCreated_by(String created_by) { this.created_by = created_by; }

    public long getCreated_at() { return created_at; }
    public void setCreated_at(long created_at) { this.created_at = created_at; }

    public boolean isIs_active() { return is_active; }
    public void setIs_active(boolean is_active) { this.is_active = is_active; }
} 