package com.example.kltn.models;

public class ClassItem {
    private String className;
    private String classCode;
    private String teacherInfo;

    public ClassItem(String className, String classCode, String teacherInfo) {
        this.className = className;
        this.classCode = classCode;
        this.teacherInfo = teacherInfo;
    }

    public String getClassName() { return className; }
    public String getClassCode() { return classCode; }
    public String getTeacherInfo() { return teacherInfo; }
} 