package com.example.kltn.models;

public class User {
    private String user_id;
    private String full_name;
    private String email;
    private String password;
    private String role;
    private String gender;
    private String avatar_url;
    private String avatar_base64;
    private long streak_count;
    private String last_login_date;

    public User() {}

    public User(String user_id, String full_name, String email, String password, String role, String gender, String avatar_url) {
        this.user_id = user_id;
        this.full_name = full_name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.gender = gender;
        this.avatar_url = avatar_url;
    }

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public String getFull_name() { return full_name; }
    public void setFull_name(String full_name) { this.full_name = full_name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAvatar_url() { return avatar_url; }
    public void setAvatar_url(String avatar_url) { this.avatar_url = avatar_url; }

    public String getAvatar_base64() { return avatar_base64; }
    public void setAvatar_base64(String avatar_base64) { this.avatar_base64 = avatar_base64; }

    public long getStreak_count() { return streak_count; }
    public void setStreak_count(long streak_count) { this.streak_count = streak_count; }
    public String getLast_login_date() { return last_login_date; }
    public void setLast_login_date(String last_login_date) { this.last_login_date = last_login_date; }
} 