package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import android.widget.ArrayAdapter;

public class StudentListForEvaluationActivity extends AppCompatActivity {
    private RecyclerView rvStudents;
    private StudentAdapter adapter;
    private List<Map<String, Object>> studentList = new ArrayList<>();
    private String userId;
    private Spinner spinnerClass;
    private List<String> classIds = new ArrayList<>();
    private List<String> classNames = new ArrayList<>();
    private ArrayAdapter<String> spinnerAdapter;
    private String selectedClassId = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_students); // Reuse layout
        userId = getIntent().getStringExtra("user_id");
        rvStudents = findViewById(R.id.rvStudents);
        rvStudents.setLayoutManager(new LinearLayoutManager(this));
        adapter = new StudentAdapter();
        rvStudents.setAdapter(adapter);
        spinnerClass = findViewById(R.id.spinnerClass);
        View btnAddStudent = findViewById(R.id.btnAddStudent);
        if (btnAddStudent != null) btnAddStudent.setVisibility(View.GONE); // Hide Add Student button
        loadClassesFromFirestore();
    }

    private void loadClassesFromFirestore() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("classes").whereEqualTo("teacher_id", userId).get().addOnSuccessListener(querySnapshot -> {
            classIds.clear();
            classNames.clear();
            for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
                classIds.add(doc.getId());
                classNames.add(doc.getString("name"));
            }
            spinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, classNames);
            spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinnerClass.setAdapter(spinnerAdapter);
            if (!classIds.isEmpty()) {
                selectedClassId = classIds.get(0);
                loadStudentsForClass(selectedClassId);
            }
            spinnerClass.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(android.widget.AdapterView<?> parent, android.view.View view, int position, long id) {
                    if (position >= 0 && position < classIds.size()) {
                        selectedClassId = classIds.get(position);
                        loadStudentsForClass(selectedClassId);
                    }
                }
                @Override
                public void onNothingSelected(android.widget.AdapterView<?> parent) {}
            });
        });
    }

    private void loadStudentsForClass(String classId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("classes").document(classId).get().addOnSuccessListener(doc -> {
            List<String> studentIds = (List<String>) doc.get("student_ids");
            if (studentIds == null || studentIds.isEmpty()) {
                studentList.clear();
                adapter.notifyDataSetChanged();
                return;
            }
            db.collection("users").whereIn("user_id", studentIds).get().addOnSuccessListener(userSnap -> {
                studentList.clear();
                for (DocumentSnapshot userDoc : userSnap.getDocuments()) {
                    Map<String, Object> s = new HashMap<>();
                    s.put("user_id", userDoc.getString("user_id"));
                    s.put("full_name", userDoc.getString("full_name"));
                    s.put("avatar_base64", userDoc.getString("avatar_base64"));
                    s.put("avatar_url", userDoc.getString("avatar_url"));
                    s.put("email", userDoc.getString("email"));
                    s.put("gender", userDoc.getString("gender"));
                    s.put("class_ids", userDoc.get("class_ids"));
                    studentList.add(s);
                }
                adapter.notifyDataSetChanged();
            });
        });
    }

    private class StudentAdapter extends RecyclerView.Adapter<StudentAdapter.ViewHolder> {
        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = getLayoutInflater().inflate(R.layout.item_student, parent, false);
            return new ViewHolder(v);
        }
        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            holder.bind(studentList.get(position));
        }
        @Override
        public int getItemCount() { return studentList.size(); }
        class ViewHolder extends RecyclerView.ViewHolder {
            ImageView ivStudentAvatar;
            TextView tvStudentName, tvStudentEmail, tvStudentGender, tvStudentStatus;
            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                ivStudentAvatar = itemView.findViewById(R.id.ivStudentAvatar);
                tvStudentName = itemView.findViewById(R.id.tvStudentName);
                tvStudentEmail = itemView.findViewById(R.id.tvStudentEmail);
                tvStudentGender = itemView.findViewById(R.id.tvStudentGender);
                tvStudentStatus = itemView.findViewById(R.id.tvStudentStatus);
                itemView.setOnClickListener(v -> {
                    String studentId = (String) studentList.get(getAdapterPosition()).get("user_id");
                    String studentName = (String) studentList.get(getAdapterPosition()).get("full_name");
                    String avatarUrl = (String) studentList.get(getAdapterPosition()).get("avatar_url");
                    String avatarBase64 = (String) studentList.get(getAdapterPosition()).get("avatar_base64");
                    // Lấy tên lớp từ classNames
                    String studentClassName = "";
                    int classIdx = classIds.indexOf(selectedClassId);
                    if (classIdx >= 0 && classIdx < classNames.size()) {
                        studentClassName = classNames.get(classIdx);
                    }
                    Intent intent = new Intent(StudentListForEvaluationActivity.this, EvaluateStudentActivity.class);
                    intent.putExtra("user_id", studentId);
                    intent.putExtra("student_name", studentName);
                    intent.putExtra("class_name", studentClassName);
                    intent.putExtra("avatar_url", avatarUrl);
                    intent.putExtra("avatar_base64", avatarBase64);
                    intent.putExtra("teacher_id", userId); // Truyền teacher_id sang
                    startActivity(intent);
                });
            }
            void bind(Map<String, Object> student) {
                tvStudentName.setText((String) student.get("full_name"));
                tvStudentEmail.setText((String) student.get("email"));
                tvStudentGender.setText("Gender: " + (student.get("gender") != null ? student.get("gender") : "N/A"));
                java.util.List<String> classIds = (java.util.List<String>) student.get("class_ids");
                String status = (classIds == null || classIds.isEmpty()) ? "Chưa có lớp" : "Đã có lớp";
                tvStudentStatus.setText("Status: " + status);
                String avatarBase64 = (String) student.get("avatar_base64");
                String avatarUrl = (String) student.get("avatar_url");
                if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                    try {
                        byte[] decodedString = android.util.Base64.decode(avatarBase64, android.util.Base64.DEFAULT);
                        android.graphics.Bitmap decodedByte = android.graphics.BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                        Glide.with(ivStudentAvatar.getContext()).load(decodedByte).circleCrop().into(ivStudentAvatar);
                    } catch (Exception e) {
                        ivStudentAvatar.setImageResource(R.drawable.user);
                    }
                } else if (avatarUrl != null && !avatarUrl.isEmpty()) {
                    Glide.with(ivStudentAvatar.getContext())
                            .load(avatarUrl)
                            .placeholder(R.drawable.user)
                            .error(R.drawable.user)
                            .into(ivStudentAvatar);
                } else {
                    ivStudentAvatar.setImageResource(R.drawable.user);
                }
            }
        }
    }
}
