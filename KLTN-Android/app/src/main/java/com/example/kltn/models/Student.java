package com.example.kltn.models;

public class Student {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String className;
    private int score;
    private int progress;
    private boolean isActive;
    private String avatarBase64;
    private String avatarUrl;
    private String gender;
    private java.util.List<String> classIds;

    public Student() {}
    public Student(String userId, String fullName, String email, String avatarBase64, String avatarUrl, String gender, java.util.List<String> classIds, boolean isActive) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.avatarBase64 = avatarBase64;
        this.avatarUrl = avatarUrl;
        this.gender = gender;
        this.classIds = classIds;
        this.isActive = isActive;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getClassName() { return className; }
    public int getScore() { return score; }
    public int getProgress() { return progress; }
    public boolean isActive() { return isActive; }
    public String getAvatarBase64() { return avatarBase64; }
    public void setAvatarBase64(String avatarBase64) { this.avatarBase64 = avatarBase64; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public java.util.List<String> getClassIds() { return classIds; }
    public void setClassIds(java.util.List<String> classIds) { this.classIds = classIds; }
    
    // Method to get grade from class name (assuming class name contains grade info)
    public String getGrade() {
        if (className != null && className.contains("Grade")) {
            return className.replaceAll(".*Grade\\s*(\\d+).*", "$1");
        }
        return "N/A";
    }
} 