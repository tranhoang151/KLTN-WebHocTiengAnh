package com.example.kltn.activities;


import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import android.widget.Toast;
import android.content.Intent;
import com.example.kltn.activities.ManageStudentsActivity;
import com.example.kltn.activities.ProfileDetail;
import com.example.kltn.activities.SettingsActivity;
import com.example.kltn.activities.AssignLessonActivity;
import com.example.kltn.activities.ViewStudentProgressActivity;
import com.example.kltn.activities.EvaluateStudentActivity;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import com.bumptech.glide.Glide;
import android.util.Base64;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;


import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;
import com.example.kltn.activities.StudentListForProgressActivity;


public class TeacherDashboardActivity extends AppCompatActivity {

    private String userId;

    private void setupDashboardMenu(View item, int iconRes, int titleRes, int subtitleRes) {
        ImageView icon = item.findViewById(R.id.menu_icon);
        TextView title = item.findViewById(R.id.menu_title);
        TextView subtitle = item.findViewById(R.id.menu_subtitle);
        icon.setImageResource(iconRes);
        title.setText(titleRes);
        subtitle.setText(subtitleRes);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_teacher_dashboard);
        userId = getIntent().getStringExtra("user_id");

        // Lấy view header
        ImageView imgAvatar = findViewById(R.id.imgAvatar);
        TextView tvHello = findViewById(R.id.tvHello);
        TextView tvManageInfo = findViewById(R.id.tvManageInfo);

        // Lấy thông tin giáo viên từ Firestore
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId).get().addOnSuccessListener(userDoc -> {
            if (userDoc.exists()) {
                String fullName = userDoc.getString("full_name");
                String avatarBase64 = userDoc.getString("avatar_base64");
                String avatarUrl = userDoc.getString("avatar_url");
                // Hiển thị Hello, tên
                String helloName = fullName != null ? fullName : "Teacher";
                tvHello.setText("Hello, " + helloName);
                // Hiển thị avatar
                if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                    try {
                        byte[] decodedString = Base64.decode(avatarBase64, Base64.DEFAULT);
                        Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                        Glide.with(this).load(decodedByte).placeholder(R.drawable.user).error(R.drawable.user).circleCrop().into(imgAvatar);
                    } catch (Exception e) {
                        imgAvatar.setImageResource(R.drawable.user);
                    }
                } else if (avatarUrl != null && !avatarUrl.isEmpty()) {
                    Glide.with(this).load(avatarUrl).placeholder(R.drawable.user).error(R.drawable.user).circleCrop().into(imgAvatar);
                } else {
                    imgAvatar.setImageResource(R.drawable.user);
                }
            }
        });
        // Lấy tổng số lớp và tổng số học sinh
        db.collection("classes").whereEqualTo("teacher_id", userId).get().addOnSuccessListener(querySnapshot -> {
            int classCount = querySnapshot.size();
            int studentCount = 0;
            for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
                java.util.List<String> studentIds = (java.util.List<String>) doc.get("student_ids");
                if (studentIds != null) studentCount += studentIds.size();
            }
            tvManageInfo.setText("You are managing " + classCount + " classes and " + studentCount + " students");
        });

        setupDashboardMenu(findViewById(R.id.itemManageStudents), R.drawable.tc_class, R.string.manage_students, R.string.manage_students_sub);
        setupDashboardMenu(findViewById(R.id.itemViewProgress), R.drawable.tc_theodoi, R.string.view_progress, R.string.view_progress_sub);
        setupDashboardMenu(findViewById(R.id.itemEvaluateStudents), R.drawable.tc_danhgia, R.string.evaluate_students, R.string.evaluate_students_sub);

        // Handle bottom navigation clicks
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottomNavigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                // 1. Ấn Home: vẫn ở TeacherDashboardActivity (không làm gì)
                return true;
            } else if (id == R.id.nav_classes) {
                // 2. Ấn Classes: chuyển sang ManageStudentsActivity
                Intent intent = new Intent(this, ManageStudentsActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            } else if (id == R.id.nav_profile) {
                // 3. Ấn Profile: chuyển sang ProfileDetail
                Intent intent = new Intent(this, ProfileDetail.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            } else if (id == R.id.nav_setting) {
                // 4. Ấn Setting: chuyển sang SettingsActivity
                Intent intent = new Intent(this, SettingsActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
                return true;
            }
            return false;
        });

        // Handle menu item clicks
        // 1. Manage Students
        View itemManageStudents = findViewById(R.id.itemManageStudents);
        itemManageStudents.setOnClickListener(v -> {
            Intent intent = new Intent(this, ManageStudentsActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });


        // 3. View Progress
        View itemViewProgress = findViewById(R.id.itemViewProgress);
        itemViewProgress.setOnClickListener(v -> {
            Intent intent = new Intent(this, StudentListForProgressActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });

        // 4. Evaluate Students
        View itemEvaluateStudents = findViewById(R.id.itemEvaluateStudents);
        itemEvaluateStudents.setOnClickListener(v -> {
            Intent intent = new Intent(this, StudentListForEvaluationActivity.class);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
    }

} 