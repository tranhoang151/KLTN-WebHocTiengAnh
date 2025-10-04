package com.example.kltn.models;

public class Course {
    private String id;
    private String name;
    private String description;
    private String image_url;
    private com.google.firebase.Timestamp created_at;

    public Course() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }
    public com.google.firebase.Timestamp getCreated_at() { return created_at; }
    public void setCreated_at(com.google.firebase.Timestamp created_at) { this.created_at = created_at; }
} 