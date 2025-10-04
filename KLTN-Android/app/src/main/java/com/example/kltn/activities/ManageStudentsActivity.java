package com.example.kltn.activities;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.StudentAdapter;
import com.example.kltn.models.Student;
import java.util.ArrayList;
import java.util.List;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

public class ManageStudentsActivity extends AppCompatActivity implements StudentAdapter.OnStudentActionListener {
    
    private RecyclerView rvStudents;
    private StudentAdapter studentAdapter;
    private List<Student> studentList;
    private Spinner spinnerClass;
    private List<Student> allStudentsList;
    private String userId;
    private List<String> classIds = new ArrayList<>();
    private List<String> classNames = new ArrayList<>();
    private ArrayAdapter<String> spinnerAdapter;
    private String selectedClassId = null;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_students);
        userId = getIntent().getStringExtra("user_id");
        initViews();
        setupRecyclerView();
        loadClassesFromFirestore();
    }
    
    private void initViews() {
        rvStudents = findViewById(R.id.rvStudents);
        spinnerClass = findViewById(R.id.spinnerClass);
        
        // Setup Add Student button
        View btnAddStudent = findViewById(R.id.btnAddStudent);
        btnAddStudent.setOnClickListener(v -> showAddStudentDialog());
    }
    
    private void setupRecyclerView() {
        studentList = new ArrayList<>();
        allStudentsList = new ArrayList<>();
        studentAdapter = new StudentAdapter(studentList, this);
        
        rvStudents.setLayoutManager(new LinearLayoutManager(this));
        rvStudents.setAdapter(studentAdapter);
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
                studentAdapter.notifyDataSetChanged();
                return;
            }
            db.collection("users").whereIn("user_id", studentIds).get().addOnSuccessListener(querySnapshot -> {
                studentList.clear();
                for (DocumentSnapshot userDoc : querySnapshot.getDocuments()) {
                    String userId = userDoc.getString("user_id");
                    String fullName = userDoc.getString("full_name");
                    String email = userDoc.getString("email");
                    String avatarBase64 = userDoc.getString("avatar_base64");
                    String avatarUrl = userDoc.getString("avatar_url");
                    String gender = userDoc.getString("gender");
                    List<String> classIds = (List<String>) userDoc.get("class_ids");
                    boolean isActive = true;
                    Student s = new Student(userId, fullName, email, avatarBase64, avatarUrl, gender, classIds, isActive);
                    studentList.add(s);
                }
                studentAdapter.notifyDataSetChanged();
            });
        });
    }
    
    @Override
    public void onStudentAction(Student student, String action) {
        if ("delete".equals(action)) {
            showDeleteDialog(student);
        }
    }
    
    private void showDeleteDialog(Student student) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_delete_student, null);
        
        // Set custom message with student name
        TextView tvDeleteMessage = dialogView.findViewById(R.id.tvDeleteMessage);
        tvDeleteMessage.setText("Are you sure you want to delete " + student.getFullName() + "? This action cannot be undone.");
        
        // Setup buttons
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnDelete = dialogView.findViewById(R.id.btnDelete);
        
        AlertDialog dialog = builder.create();
        dialog.setView(dialogView);
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnDelete.setOnClickListener(v -> {
            deleteStudent(student);
            dialog.dismiss();
        });
        
        dialog.show();
    }
    
    private void deleteStudent(Student student) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        // 1. Xoá khỏi student_ids của lớp
        db.collection("classes").document(selectedClassId)
            .update("student_ids", com.google.firebase.firestore.FieldValue.arrayRemove(student.getUserId()))
            .addOnSuccessListener(aVoid -> {
                // 2. Xoá class_id khỏi class_ids của user
                db.collection("users").document(student.getUserId())
                    .update("class_ids", com.google.firebase.firestore.FieldValue.arrayRemove(selectedClassId))
                    .addOnSuccessListener(aVoid2 -> {
                        Toast.makeText(this, "Đã xoá học viên khỏi lớp!", Toast.LENGTH_SHORT).show();
                        loadStudentsForClass(selectedClassId);
                    });
            });
    }
    
    private void showAddStudentDialog() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        // Lấy danh sách học viên chưa thuộc bất kỳ lớp nào
        db.collection("users").whereEqualTo("role", "student").get().addOnSuccessListener(querySnapshot -> {
            List<String> availableNames = new ArrayList<>();
            List<String> availableIds = new ArrayList<>();
            for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
                List<String> classIds = (List<String>) doc.get("class_ids");
                // Chỉ cho phép học sinh chưa thuộc bất kỳ lớp nào
                if (classIds == null || classIds.isEmpty()) {
                    availableNames.add(doc.getString("full_name") + " (" + doc.getString("email") + ")");
                    availableIds.add(doc.getString("user_id"));
                }
            }
            if (availableIds.isEmpty()) {
                Toast.makeText(this, "Không còn học viên nào để thêm!", Toast.LENGTH_SHORT).show();
                return;
            }
            String[] namesArr = availableNames.toArray(new String[0]);
            boolean[] checkedItems = new boolean[namesArr.length];
            List<Integer> selectedIndexes = new ArrayList<>();
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("Chọn học viên để thêm vào lớp");
            builder.setMultiChoiceItems(namesArr, checkedItems, (dialog, which, isChecked) -> {
                if (isChecked) selectedIndexes.add(which);
                else selectedIndexes.remove(Integer.valueOf(which));
            });
            builder.setPositiveButton("Thêm", (dialog, which) -> {
                List<String> selectedStudentIds = new ArrayList<>();
                for (int idx : selectedIndexes) selectedStudentIds.add(availableIds.get(idx));
                // 1. Update student_ids của lớp
                db.collection("classes").document(selectedClassId)
                    .update("student_ids", com.google.firebase.firestore.FieldValue.arrayUnion(selectedStudentIds.toArray()))
                    .addOnSuccessListener(aVoid -> {
                        // 2. Update class_ids của từng user
                        for (String studentId : selectedStudentIds) {
                            db.collection("users").document(studentId)
                                .update("class_ids", com.google.firebase.firestore.FieldValue.arrayUnion(selectedClassId));
                        }
                        Toast.makeText(this, "Đã thêm học viên vào lớp!", Toast.LENGTH_SHORT).show();
                        loadStudentsForClass(selectedClassId);
                    });
            });
            builder.setNegativeButton("Huỷ", null);
            builder.show();
        });
    }
} 