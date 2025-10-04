package com.example.kltn.models;

public class Flashcard {
    private String id;
    private String flashcardSetId;
    private String frontText;
    private String backText;
    private String exampleSentence;
    private String imageUrl;
    private String imageBase64;
    private int order;

    public Flashcard() {
    }

    public Flashcard(String id, String flashcardSetId, String frontText, String backText, String exampleSentence, String imageUrl, int order) {
        this.id = id;
        this.flashcardSetId = flashcardSetId;
        this.frontText = frontText;
        this.backText = backText;
        this.exampleSentence = exampleSentence;
        this.imageUrl = imageUrl;
        this.order = order;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFlashcardSetId() {
        return flashcardSetId;
    }

    public void setFlashcardSetId(String flashcardSetId) {
        this.flashcardSetId = flashcardSetId;
    }

    public String getFrontText() {
        return frontText;
    }

    public void setFrontText(String frontText) {
        this.frontText = frontText;
    }

    public String getBackText() {
        return backText;
    }

    public void setBackText(String backText) {
        this.backText = backText;
    }

    public String getExampleSentence() {
        return exampleSentence;
    }

    public void setExampleSentence(String exampleSentence) {
        this.exampleSentence = exampleSentence;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageBase64() {
        return imageBase64;
    }
    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
} 