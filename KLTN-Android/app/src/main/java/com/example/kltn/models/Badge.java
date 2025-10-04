package com.example.kltn.models;

public class Badge {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private boolean isEarned;

    public Badge() {} // Constructor rỗng cho Firestore

    public Badge(String id, String name, String description, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isEarned = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isEarned() { return isEarned; }
    public void setEarned(boolean earned) { isEarned = earned; }
} 