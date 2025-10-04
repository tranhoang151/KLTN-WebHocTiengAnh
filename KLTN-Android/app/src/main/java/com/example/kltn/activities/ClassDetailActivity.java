package com.example.kltn.activities;

import android.os.Bundle;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.example.kltn.R;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import java.util.List;
import android.widget.ImageView;
import android.view.ViewGroup;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ImageButton;
import com.bumptech.glide.Glide;

public class ClassDetailActivity extends AppCompatActivity {
    private boolean dataChanged = false;
    private String classId;
    private LinearLayout llStudentsList;
    private FirebaseFirestore db;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_class_detail);
        classId = getIntent().getStringExtra("class_id");
        TextView tvClassName = findViewById(R.id.tvClassName);
        TextView tvDescription = findViewById(R.id.tvDescription);
        TextView tvCreatedAt = findViewById(R.id.tvCreatedAt);
        TextView tvCapacity = findViewById(R.id.tvCapacity);
        TextView tvCourse = findViewById(R.id.tvCourse);
        TextView tvTeacher = findViewById(R.id.tvTeacher);
        llStudentsList = findViewById(R.id.llStudentsList);
        db = FirebaseFirestore.getInstance();
        db.collection("classes").document(classId).get().addOnSuccessListener(doc -> {
            if (doc.exists()) {
                tvClassName.setText(doc.getString("name"));
                tvDescription.setText(doc.getString("description"));
                Object dateObj = doc.get("created_at");
                String createdAt = (dateObj != null) ? dateObj.toString() : "N/A";
                tvCreatedAt.setText("Created at: " + createdAt);
                Long capacity = doc.getLong("capacity");
                tvCapacity.setText("Capacity: " + (capacity != null ? capacity : "N/A"));
                // Lấy tên khóa học
                String courseId = doc.getString("course_id");
                if (courseId != null && !courseId.isEmpty()) {
                    db.collection("courses").document(courseId).get().addOnSuccessListener(courseDoc -> {
                        tvCourse.setText("Course: " + courseDoc.getString("name"));
                    });
                } else {
                    tvCourse.setText("Course: N/A");
                }
                // Lấy tên giáo viên
                String teacherId = doc.getString("teacher_id");
                if (teacherId != null && !teacherId.isEmpty()) {
                    db.collection("users").document(teacherId).get().addOnSuccessListener(userDoc -> {
                        tvTeacher.setText("Teacher: " + userDoc.getString("full_name"));
                    });
                } else {
                    tvTeacher.setText("Teacher: N/A");
                }
                loadStudentsList();
            }
        });
    }

    private void loadStudentsList() {
        llStudentsList.removeAllViews();
        db.collection("classes").document(classId).get().addOnSuccessListener(doc -> {
            List<String> studentIds = (List<String>) doc.get("student_ids");
            if (studentIds != null && !studentIds.isEmpty()) {
                db.collection("users").whereIn("user_id", studentIds).get().addOnSuccessListener(studentsSnap -> {
                    for (DocumentSnapshot stuDoc : studentsSnap) {
                        String fullName = stuDoc.getString("full_name");
                        String avatarBase64 = stuDoc.getString("avatar_base64");
                        String userId = stuDoc.getString("user_id");
                        LinearLayout row = new LinearLayout(this);
                        row.setOrientation(LinearLayout.HORIZONTAL);
                        row.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
                        row.setPadding(0, 8, 0, 8);
                        // Avatar
                        ImageView avatar = new ImageView(this);
                        LinearLayout.LayoutParams avatarParams = new LinearLayout.LayoutParams(80, 80);
                        avatarParams.setMarginEnd(16);
                        avatar.setLayoutParams(avatarParams);
                        avatar.setScaleType(ImageView.ScaleType.CENTER_CROP);
                        avatar.setBackgroundResource(R.drawable.circle_background);
                        if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                            byte[] decodedString = android.util.Base64.decode(avatarBase64, android.util.Base64.DEFAULT);
                            Glide.with(this).load(decodedString).circleCrop().into(avatar);
                        } else {
                            avatar.setImageResource(R.drawable.user);
                        }
                        // Tên học viên
                        TextView tvName = new TextView(this);
                        tvName.setText(fullName);
                        tvName.setTextSize(16f);
                        tvName.setTextColor(0xFF101518);
                        tvName.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
                        // Nút xóa
                        ImageButton btnDelete = new ImageButton(this);
                        btnDelete.setImageResource(android.R.drawable.ic_menu_delete);
                        btnDelete.setBackgroundColor(android.graphics.Color.TRANSPARENT);
                        btnDelete.setOnClickListener(v -> {
                            db.collection("classes").document(classId)
                                .update("student_ids", com.google.firebase.firestore.FieldValue.arrayRemove(userId))
                                .addOnSuccessListener(aVoid -> {
                                    db.collection("users").document(userId)
                                        .update("class_ids", com.google.firebase.firestore.FieldValue.arrayRemove(classId));
                                    dataChanged = true;
                                    loadStudentsList();
                                });
                        });
                        row.addView(avatar);
                        row.addView(tvName);
                        row.addView(btnDelete);
                        llStudentsList.addView(row);
                    }
                });
            } else {
                TextView tvNone = new TextView(this);
                tvNone.setText("No students");
                tvNone.setTextColor(0xFF5C748A);
                tvNone.setTextSize(15f);
                llStudentsList.addView(tvNone);
            }
        });
    }

    @Override
    public void onBackPressed() {
        if (dataChanged) setResult(RESULT_OK);
        super.onBackPressed();
    }
} 