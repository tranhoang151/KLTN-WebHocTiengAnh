package com.example.kltn.activities;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.view.ViewGroup;
import android.view.View;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.example.kltn.R;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import java.util.List;
import android.widget.ImageView;
import android.app.AlertDialog;
import android.widget.ImageButton;

public class CourseDetailActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_detail);
        String courseId = getIntent().getStringExtra("course_id");
        TextView tvCourseName = findViewById(R.id.tvCourseName);
        TextView tvCourseDesc = findViewById(R.id.tvCourseDesc);
        TextView tvCourseCreated = findViewById(R.id.tvCourseCreated);
        LinearLayout llClassList = findViewById(R.id.llClassList);
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("courses").document(courseId).get().addOnSuccessListener(doc -> {
            if (doc.exists()) {
                tvCourseName.setText(doc.getString("name"));
                tvCourseDesc.setText(doc.getString("description"));
                Object dateObj = doc.get("created_at");
                String createdAt;
                if (dateObj instanceof com.google.firebase.Timestamp) {
                    java.util.Date date = ((com.google.firebase.Timestamp) dateObj).toDate();
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MM/dd/yyyy", java.util.Locale.getDefault());
                    createdAt = sdf.format(date);
                } else if (dateObj instanceof String) {
                    createdAt = dateObj.toString();
                } else {
                    createdAt = "N/A";
                }
                tvCourseCreated.setText("Created at: " + createdAt);
            }
        });
        // Lấy danh sách lớp thuộc khóa học
        db.collection("classes").whereEqualTo("course_id", courseId).get().addOnSuccessListener(querySnapshot -> {
            llClassList.removeAllViews();
            for (DocumentSnapshot classDoc : querySnapshot) {
                String className = classDoc.getString("name");
                String classId = classDoc.getId();
                List<String> studentIds = (List<String>) classDoc.get("student_ids");
                int studentCount = (studentIds != null) ? studentIds.size() : 0;
                LinearLayout row = new LinearLayout(this);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
                row.setPadding(0, 16, 0, 16);
                row.setBackgroundResource(R.drawable.card_background);
                // Icon lớp
                ImageView icon = new ImageView(this);
                LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(60, 60);
                iconParams.setMarginEnd(16);
                icon.setLayoutParams(iconParams);
                icon.setImageResource(R.drawable.ic_class);
                // Tên lớp
                TextView tvClass = new TextView(this);
                tvClass.setText(className);
                tvClass.setTextSize(17f);
                tvClass.setTextColor(0xFF101518);
                tvClass.setTypeface(null, android.graphics.Typeface.BOLD);
                tvClass.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
                // Số học viên
                TextView tvCount = new TextView(this);
                tvCount.setText(studentCount + " students");
                tvCount.setTextSize(15f);
                tvCount.setTextColor(0xFF2196F3);
                tvCount.setPadding(12, 0, 0, 0);
                // Nút xóa lớp khỏi khóa học
                ImageButton btnDelete = new ImageButton(this);
                btnDelete.setImageResource(android.R.drawable.ic_menu_delete);
                btnDelete.setBackgroundColor(android.graphics.Color.TRANSPARENT);
                btnDelete.setOnClickListener(v -> {
                    new AlertDialog.Builder(this)
                        .setTitle("Remove class from course")
                        .setMessage("Are you sure you want to remove this class from the course?")
                        .setPositiveButton("Remove", (dialog, which) -> {
                            // Xóa khỏi subcollection classes của khóa học (nếu có)
                            db.collection("courses").document(courseId)
                                .collection("classes").document(classId).delete();
                            // Set course_id của lớp về null
                            db.collection("classes").document(classId)
                                .update("course_id", null)
                                .addOnSuccessListener(aVoid -> {
                                    // Reload lại danh sách lớp
                                    recreate();
                                });
                        })
                        .setNegativeButton("Cancel", null)
                        .show();
                });
                row.addView(icon);
                row.addView(tvClass);
                row.addView(tvCount);
                row.addView(btnDelete);
                llClassList.addView(row);
            }
        });
    }
} 