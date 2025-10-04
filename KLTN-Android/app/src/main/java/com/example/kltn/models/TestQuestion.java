package com.example.kltn.models;
import java.util.List;

public class TestQuestion {
    public String type; // "fill_blank" hoặc "multiple_choice"
    public String question;
    public List<String> choices; // null nếu là fill_blank
    public String answer;

    public TestQuestion(String type, String question, List<String> choices, String answer) {
        this.type = type;
        this.question = question;
        this.choices = choices;
        this.answer = answer;
    }
} 