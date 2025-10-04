package com.example.kltn.models;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class ClassInfo {
    private String name;
    private String description;
    private int capacity;
    private int currentStudents;
    private String teacherName;
    private boolean isActive;
    private Date creationDate;
    private String documentId;

    public ClassInfo(String name, String description, int capacity, int currentStudents, String teacherName, boolean isActive, Date creationDate) {
        this.name = name;
        this.description = description;
        this.capacity = capacity;
        this.currentStudents = currentStudents;
        this.teacherName = teacherName;
        this.isActive = isActive;
        this.creationDate = creationDate;
    }

    public ClassInfo() {}

    public static ClassInfo fromDocument(com.google.firebase.firestore.DocumentSnapshot doc) {
        String name = doc.getString("name");
        String description = doc.getString("description");
        Long capacityLong = doc.getLong("capacity");
        int capacity = capacityLong != null ? capacityLong.intValue() : 0;
        String teacherName = doc.getString("teacherName");
        Boolean isActiveObj = doc.getBoolean("isActive");
        boolean isActive = isActiveObj != null ? isActiveObj : true;
        java.util.Date creationDate = null;
        Object dateObj = doc.get("created_at");
        if (dateObj instanceof com.google.firebase.Timestamp) {
            creationDate = ((com.google.firebase.Timestamp) dateObj).toDate();
        } else if (dateObj instanceof java.util.Date) {
            creationDate = (java.util.Date) dateObj;
        } else if (dateObj instanceof String) {
            String dateStr = (String) dateObj;
            // Thử parse nhiều định dạng
            String[] formats = {
                "dd MMMM yyyy 'à' HH:mm:ss z", // Pháp
                "yyyy-MM-dd'T'HH:mm:ss'Z'",    // ISO
                "yyyy-MM-dd HH:mm:ss",         // Việt
                "yyyy-MM-dd",                  // Ngày dạng ngắn
                "MM/dd/yyyy",                  // Mỹ
                "dd/MM/yyyy"                   // Việt/EU
            };
            for (String fmt : formats) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat(fmt, java.util.Locale.US);
                    sdf.setLenient(false);
                    creationDate = sdf.parse(dateStr);
                    if (creationDate != null) break;
                } catch (Exception e) { /* ignore */ }
            }
        }
        // Lấy số lượng học viên từ student_ids nếu có
        int currentStudents = 0;
        Object studentIdsObj = doc.get("student_ids");
        if (studentIdsObj instanceof java.util.List) {
            java.util.List<?> studentIds = (java.util.List<?>) studentIdsObj;
            currentStudents = studentIds.size();
        }
        ClassInfo classInfo = new ClassInfo(name, description, capacity, currentStudents, teacherName, isActive, creationDate);
        classInfo.setDocumentId(doc.getId());
        return classInfo;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getCapacity() { return capacity; }
    public int getCurrentStudents() { return currentStudents; }
    public String getTeacherName() { return teacherName; }
    public boolean isActive() { return isActive; }
    public Date getCreationDate() { return creationDate; }
    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }
    
    public void setActive(boolean active) { isActive = active; }
    
    public String getFormattedCreationDate() {
        if (creationDate != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy", Locale.getDefault());
            return sdf.format(creationDate);
        }
        return "N/A";
    }
    
    public String getStudentInfo() {
        return currentStudents + " students";
    }
} 