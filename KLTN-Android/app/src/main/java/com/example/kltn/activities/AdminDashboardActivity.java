package com.example.kltn.activities;


import android.os.Bundle;


import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;
import android.content.Intent;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import android.widget.LinearLayout;

public class AdminDashboardActivity extends AppCompatActivity {

    private android.widget.TextView tvTotalUsers, tvTotalClasses, tvTotalContent, tvTotalLogins;


    private LinearLayout actionManageUsers, actionManageClasses, actionManageContent, actionSettings, actionManageCourses, actionQuestionBank;
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_dashboard);

        userId = getIntent().getStringExtra("user_id");

        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_admin);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                // Stay on this activity
                return true;
            } else if (id == R.id.nav_users) {
                Intent intent = new Intent(this, ManageUsersActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            } else if (id == R.id.nav_classes) {
                Intent intent = new Intent(this, ManageClassesActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            } else if (id == R.id.nav_content) {
                Intent intent = new Intent(this, ManageContentActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            }
            return false;
        });
        bottomNav.setSelectedItemId(R.id.nav_home);

        mapViews();
        setupQuickActionClicks();
        updateStatsFromFirestore();
    }

    private void mapViews() {
        tvTotalUsers = findViewById(R.id.tv_total_users);
        tvTotalClasses = findViewById(R.id.tv_total_classes);
        tvTotalContent = findViewById(R.id.tv_total_content);
        tvTotalLogins = findViewById(R.id.tv_total_logins);

        actionManageUsers = findViewById(R.id.action_manage_users);
        actionManageClasses = findViewById(R.id.action_manage_classes);

        actionManageContent = findViewById(R.id.action_manage_content);
        actionSettings = findViewById(R.id.action_settings);
        actionManageCourses = findViewById(R.id.action_manage_courses);
        actionQuestionBank = findViewById(R.id.action_question_bank);
    }

    private void setupQuickActionClicks() {
        actionManageUsers.setOnClickListener(v -> {
            Intent intent = new Intent(this, ManageUsersActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        actionManageClasses.setOnClickListener(v -> {
            Intent intent = new Intent(this, ManageClassesActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        actionManageContent.setOnClickListener(v -> {
            Intent intent = new Intent(this, ManageContentActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        actionSettings.setOnClickListener(v -> {
            Intent intent = new Intent(this, SettingsActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        actionManageCourses.setOnClickListener(v -> {
            Intent intent = new Intent(this, ManageCoursesActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        actionQuestionBank.setOnClickListener(v -> {
            Intent intent = new Intent(this, QuestionBankActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
    }

    // Cập nhật số liệu động từ Firestore
    private void updateStatsFromFirestore() {
        com.google.firebase.firestore.FirebaseFirestore db = com.google.firebase.firestore.FirebaseFirestore.getInstance();
        // Tổng user
        db.collection("users").get().addOnSuccessListener(snaps -> {
            int totalUsers = snaps.size();
            tvTotalUsers.setText(String.valueOf(totalUsers));

            // Tổng giáo viên (thay cho Logins)
            int totalTeachers = 0;
            for (com.google.firebase.firestore.DocumentSnapshot doc : snaps) {
                String role = doc.contains("role") ? doc.getString("role") : "";
                if (role != null && (role.equalsIgnoreCase("teacher") || role.equalsIgnoreCase("giaovien"))) {
                    totalTeachers++;
                }
            }
            tvTotalLogins.setText(String.valueOf(totalTeachers));
        });
        // Tổng class
        db.collection("classes").get().addOnSuccessListener(snaps -> {
            int totalClasses = snaps.size();
            tvTotalClasses.setText(String.valueOf(totalClasses));
        });
        // Tổng content = flashcard_sets + exercises + tests + video_lectures
        final int[] totalContent = {0};
        db.collection("flashcard_sets").get().addOnSuccessListener(s1 -> {
            totalContent[0] += s1.size();
            db.collection("exercises").get().addOnSuccessListener(s2 -> {
                totalContent[0] += s2.size();
                db.collection("tests").get().addOnSuccessListener(s3 -> {
                    totalContent[0] += s3.size();
                    db.collection("video_lectures").get().addOnSuccessListener(s4 -> {
                        totalContent[0] += s4.size();
                        tvTotalContent.setText(String.valueOf(totalContent[0]));
                    });
                });
            });
        });
    }
}