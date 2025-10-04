package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.adapters.ClassSimpleAdapter;
import com.example.kltn.models.ClassInfo;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.google.firebase.firestore.FirebaseFirestore;
import android.widget.ArrayAdapter;

public class ManageClassesActivity extends AppCompatActivity implements ClassSimpleAdapter.OnClassClickListener {

    private RecyclerView rvClasses;
    private EditText etSearch;
    private TextView tvTotalClasses;
    private FloatingActionButton fabAddClass;
    private ImageButton btnBack;
    
    private ClassSimpleAdapter adapter;
    private List<ClassInfo> allClasses;
    private List<ClassInfo> filteredClasses;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_classes);
        
        initViews();
        setupListeners();
        loadClassesFromFirestore(); // Thay vì loadSampleData
        setupRecyclerView();
        updateTotalClasses();
    }
    
    private void initViews() {
        rvClasses = findViewById(R.id.rv_classes);
        etSearch = findViewById(R.id.et_search);
        tvTotalClasses = findViewById(R.id.tv_total_classes);
        fabAddClass = findViewById(R.id.fab_add_class);
        btnBack = findViewById(R.id.btn_back);
    }
    
    private void setupListeners() {
        btnBack.setOnClickListener(v -> onBackPressed());
        
        fabAddClass.setOnClickListener(v -> showAddClassDialog());
        
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterClasses(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }
    
    private void loadClassesFromFirestore() {
        allClasses = new ArrayList<>();
        filteredClasses = new ArrayList<>();
        com.google.firebase.firestore.FirebaseFirestore db = com.google.firebase.firestore.FirebaseFirestore.getInstance();
        db.collection("classes").get().addOnSuccessListener(queryDocumentSnapshots -> {
            allClasses.clear();
            for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                ClassInfo classInfo = ClassInfo.fromDocument(doc);
                classInfo.setDocumentId(doc.getId());
                allClasses.add(classInfo);
            }
            filteredClasses = new ArrayList<>(allClasses);
            if (adapter != null) {
                adapter.updateData(filteredClasses);
            }
            updateTotalClasses();
        });
    }
    
    private void setupRecyclerView() {
        adapter = new ClassSimpleAdapter(this, filteredClasses, this);
        rvClasses.setLayoutManager(new LinearLayoutManager(this));
        rvClasses.setAdapter(adapter);
    }
    
    private void updateTotalClasses() {
        if (tvTotalClasses != null) {
            tvTotalClasses.setText("Total Classes: " + allClasses.size());
        }
    }
    
    private void filterClasses(String query) {
        if (query.isEmpty()) {
            filteredClasses = new ArrayList<>(allClasses);
        } else {
            filteredClasses = new ArrayList<>();
            for (ClassInfo classInfo : allClasses) {
                if (classInfo.getName() != null && classInfo.getName().toLowerCase().contains(query.toLowerCase())) {
                    filteredClasses.add(classInfo);
                }
            }
        }
        adapter.updateData(filteredClasses);
    }
    
    private void showAddClassDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_edit_class, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();
        // Get dialog views
        TextView tvTitle = dialogView.findViewById(R.id.tv_dialog_title);
        EditText etClassName = dialogView.findViewById(R.id.et_class_name);
        EditText etDescription = dialogView.findViewById(R.id.et_description);
        EditText etCapacity = dialogView.findViewById(R.id.et_capacity);
        Spinner spTeacher = dialogView.findViewById(R.id.sp_teacher);
        Spinner spCourse = dialogView.findViewById(R.id.sp_course);
        TextView tvTeacher = null;
        TextView tvCourse = null;
        // Lấy TextView label (phải đảm bảo id trong XML, nếu chưa có thì thêm)
        tvTeacher = (TextView) ((View) spTeacher.getParent()).findViewById(R.id.tv_teacher_label);
        tvCourse = (TextView) ((View) spCourse.getParent()).findViewById(R.id.tv_course_label);
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        Button btnSave = dialogView.findViewById(R.id.btn_save);
        // Ẩn Teacher & Course khi thêm mới
        if (spTeacher != null) spTeacher.setVisibility(View.GONE);
        if (spCourse != null) spCourse.setVisibility(View.GONE);
        if (tvTeacher != null) tvTeacher.setVisibility(View.GONE);
        if (tvCourse != null) tvCourse.setVisibility(View.GONE);
        // Set title
        tvTitle.setText("Add New Class");
        // Set click listeners
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String className = etClassName.getText().toString().trim();
            String description = etDescription.getText().toString().trim();
            String capacityStr = etCapacity.getText().toString().trim();
            // Validation
            if (className.isEmpty()) {
                etClassName.setError("Class name is required");
                return;
            }
            if (description.isEmpty()) {
                etDescription.setError("Description is required");
                return;
            }
            if (capacityStr.isEmpty()) {
                etCapacity.setError("Capacity is required");
                return;
            }
            int capacity;
            try {
                capacity = Integer.parseInt(capacityStr);
                if (capacity <= 0) {
                    etCapacity.setError("Capacity must be greater than 0");
                    return;
                }
            } catch (NumberFormatException e) {
                etCapacity.setError("Invalid capacity");
                return;
            }
            // Tạo dữ liệu lớp học mới chỉ với 3 trường
            java.util.Map<String, Object> classData = new java.util.HashMap<>();
            classData.put("name", className);
            classData.put("description", description);
            classData.put("capacity", capacity);
            classData.put("created_at", com.google.firebase.Timestamp.now());
            com.google.firebase.firestore.FirebaseFirestore db = com.google.firebase.firestore.FirebaseFirestore.getInstance();
            db.collection("classes").add(classData)
                .addOnSuccessListener(documentReference -> {
                    dialog.dismiss();
                    Toast.makeText(this, "Class added successfully", Toast.LENGTH_SHORT).show();
                    loadClassesFromFirestore();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Failed to add class: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
        });
        dialog.show();
    }
    
    private void showEditClassDialog(ClassInfo classInfo) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_edit_class, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();
        // Get dialog views
        TextView tvTitle = dialogView.findViewById(R.id.tv_dialog_title);
        EditText etClassName = dialogView.findViewById(R.id.et_class_name);
        EditText etDescription = dialogView.findViewById(R.id.et_description);
        EditText etCapacity = dialogView.findViewById(R.id.et_capacity);
        Spinner spTeacher = dialogView.findViewById(R.id.sp_teacher);
        Spinner spCourse = dialogView.findViewById(R.id.sp_course);
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        Button btnSave = dialogView.findViewById(R.id.btn_save);
        // Set title and populate fields
        tvTitle.setText("Edit Class");
        etClassName.setText(classInfo.getName());
        etDescription.setText(classInfo.getDescription());
        etCapacity.setText(String.valueOf(classInfo.getCapacity()));
        // Khai báo teacherIds, courseIds ngoài callback
        final List<String>[] teacherIds = new List[]{new ArrayList<>()};
        final List<String>[] courseIds = new List[]{new ArrayList<>()};
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").whereEqualTo("role", "teacher").get().addOnSuccessListener(teacherSnap -> {
            List<String> teacherNames = new ArrayList<>();
            int selectedTeacherIdx = -1;
            teacherIds[0].clear();
            for (int i = 0; i < teacherSnap.size(); i++) {
                String name = teacherSnap.getDocuments().get(i).getString("full_name");
                String id = teacherSnap.getDocuments().get(i).getId();
                teacherNames.add(name);
                teacherIds[0].add(id);
                if (id.equals(classInfo.getTeacherName())) selectedTeacherIdx = i;
            }
            ArrayAdapter<String> teacherAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, teacherNames);
            teacherAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spTeacher.setAdapter(teacherAdapter);
            if (selectedTeacherIdx >= 0) spTeacher.setSelection(selectedTeacherIdx);
        });
        db.collection("courses").get().addOnSuccessListener(courseSnap -> {
            List<String> courseNames = new ArrayList<>();
            int selectedCourseIdx = -1;
            courseIds[0].clear();
            for (int i = 0; i < courseSnap.size(); i++) {
                String name = courseSnap.getDocuments().get(i).getString("name");
                String id = courseSnap.getDocuments().get(i).getId();
                courseNames.add(name);
                courseIds[0].add(id);
            }
            ArrayAdapter<String> courseAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, courseNames);
            courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spCourse.setAdapter(courseAdapter);
        });
        // Set click listeners
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String className = etClassName.getText().toString().trim();
            String description = etDescription.getText().toString().trim();
            String capacityStr = etCapacity.getText().toString().trim();
            int teacherIdx = spTeacher.getSelectedItemPosition();
            int courseIdx = spCourse.getSelectedItemPosition();
            // Validation
            if (className.isEmpty()) {
                etClassName.setError("Class name is required");
                return;
            }
            if (description.isEmpty()) {
                etDescription.setError("Description is required");
                return;
            }
            if (capacityStr.isEmpty()) {
                etCapacity.setError("Capacity is required");
                return;
            }
            int capacity;
            try {
                capacity = Integer.parseInt(capacityStr);
                if (capacity <= 0) {
                    etCapacity.setError("Capacity must be greater than 0");
                    return;
                }
            } catch (NumberFormatException e) {
                etCapacity.setError("Invalid capacity");
                return;
            }
            // Update Firestore bằng documentId
            FirebaseFirestore db2 = FirebaseFirestore.getInstance();
            String teacherId = teacherIdx >= 0 && teacherIdx < teacherIds[0].size() ? teacherIds[0].get(teacherIdx) : null;
            String courseId = courseIdx >= 0 && courseIdx < courseIds[0].size() ? courseIds[0].get(courseIdx) : null;
            db2.collection("classes").document(classInfo.getDocumentId())
                .update(
                    "name", className,
                    "description", description,
                    "capacity", capacity,
                    "teacher_id", teacherId,
                    "course_id", courseId
                ).addOnSuccessListener(aVoid -> {
                    dialog.dismiss();
                    Toast.makeText(this, "Class updated successfully", Toast.LENGTH_SHORT).show();
                    loadClassesFromFirestore();
                }).addOnFailureListener(e -> {
                    Toast.makeText(this, "Failed to update class: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
        });
        dialog.show();
    }
    
    private void showDeleteClassDialog(ClassInfo classInfo) {
        new AlertDialog.Builder(this)
                .setTitle("Delete Class")
                .setMessage("Are you sure you want to delete " + classInfo.getName() + "?")
                .setPositiveButton("Delete", (dialog, which) -> {
                    com.google.firebase.firestore.FirebaseFirestore db = com.google.firebase.firestore.FirebaseFirestore.getInstance();
                    db.collection("classes").document(classInfo.getDocumentId())
                        .delete()
                        .addOnSuccessListener(aVoid -> {
                            Toast.makeText(this, "Class deleted successfully", Toast.LENGTH_SHORT).show();
                            loadClassesFromFirestore();
                        })
                        .addOnFailureListener(e -> {
                            Toast.makeText(this, "Failed to delete class: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    public void onClassClick(ClassInfo classInfo) {
        android.content.Intent intent = new android.content.Intent(this, ClassDetailActivity.class);
        intent.putExtra("class_id", classInfo.getDocumentId());
        startActivityForResult(intent, 100);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 100 && resultCode == RESULT_OK) {
            loadClassesFromFirestore();
        }
    }

    @Override
    public void onEditClick(ClassInfo classInfo) {
        showEditOptionsDialog(classInfo);
    }
    
    private void showEditOptionsDialog(ClassInfo classInfo) {
        String[] options = {"Edit", "Delete", "Gán giáo viên", "Gán học viên"};
        new AlertDialog.Builder(this)
                .setTitle("Class Options")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0: // Edit
                            showEditClassDialog(classInfo);
                            break;
                        case 1: // Delete
                            showDeleteClassDialog(classInfo);
                            break;
                        case 2: // Gán giáo viên
                            showAssignTeacherDialog(classInfo);
                            break;
                        case 3: // Gán học viên
                            showAssignStudentsDialog(classInfo);
                            break;
                    }
                })
                .show();
    }

    // Gán giáo viên
    private void showAssignTeacherDialog(ClassInfo classInfo) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").whereEqualTo("role", "teacher").get().addOnSuccessListener(queryDocumentSnapshots -> {
            List<String> teacherNames = new ArrayList<>();
            List<String> teacherIds = new ArrayList<>();
            for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                String name = doc.getString("full_name");
                String userId = doc.getId();
                teacherNames.add(name);
                teacherIds.add(userId);
            }
            String[] namesArr = teacherNames.toArray(new String[0]);
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("Chọn giáo viên cho lớp");
            builder.setSingleChoiceItems(namesArr, -1, (dialog, which) -> {
                String selectedTeacherId = teacherIds.get(which);
                // 1. Update teacher_id của lớp
                db.collection("classes").document(classInfo.getDocumentId())
                    .update("teacher_id", selectedTeacherId)
                    .addOnSuccessListener(aVoid -> {
                        // 2. Thêm class_id vào class_ids của user
                        db.collection("users").document(selectedTeacherId)
                            .update("class_ids", com.google.firebase.firestore.FieldValue.arrayUnion(classInfo.getDocumentId()));
                        Toast.makeText(this, "Đã gán giáo viên cho lớp!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                    });
            });
            builder.setNegativeButton("Hủy", null);
            builder.show();
        });
    }

    // Gán học viên
    private void showAssignStudentsDialog(ClassInfo classInfo) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("classes").document(classInfo.getDocumentId()).get().addOnSuccessListener(classDoc -> {
            List<String> currentStudentIds = (List<String>) classDoc.get("student_ids");
            if (currentStudentIds == null) currentStudentIds = new ArrayList<>();
            final List<String> finalCurrentStudentIds = currentStudentIds;
            db.collection("users").whereEqualTo("role", "student").get().addOnSuccessListener(queryDocumentSnapshots -> {
                List<String> studentNames = new ArrayList<>();
                List<String> studentIds = new ArrayList<>();
                for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                    String name = doc.getString("full_name");
                    String userId = doc.getId();
                    studentNames.add(name);
                    studentIds.add(userId);
                }

                // Tạo dialog custom
                android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
                View dialogView = getLayoutInflater().inflate(R.layout.dialog_assign_students, null);
                builder.setView(dialogView);

                EditText etSearch = dialogView.findViewById(R.id.et_search_student);
                ListView lvStudents = dialogView.findViewById(R.id.lv_students);

                // Adapter custom
                com.example.kltn.adapters.StudentAssignAdapter adapter = new com.example.kltn.adapters.StudentAssignAdapter(
                        this, studentNames, studentIds, finalCurrentStudentIds
                );
                lvStudents.setAdapter(adapter);
                lvStudents.setChoiceMode(ListView.CHOICE_MODE_MULTIPLE);

                // Chọn lại các học viên đã thuộc lớp
                for (int i = 0; i < studentIds.size(); i++) {
                    if (finalCurrentStudentIds.contains(studentIds.get(i))) {
                        lvStudents.setItemChecked(i, true);
                    }
                }

                // Search realtime
                etSearch.addTextChangedListener(new android.text.TextWatcher() {
                    @Override
                    public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
                    @Override
                    public void onTextChanged(CharSequence s, int start, int before, int count) {
                        adapter.getFilter().filter(s);
                    }
                    @Override
                    public void afterTextChanged(android.text.Editable s) {}
                });

                // Đặt nút trước khi tạo dialog!
                builder.setPositiveButton("Gán học viên", (d, which) -> {
                    List<String> selectedStudentIds = new ArrayList<>(adapter.getSelectedIds());
                    db.collection("classes").document(classInfo.getDocumentId())
                            .update("student_ids", selectedStudentIds)
                            .addOnSuccessListener(aVoid -> {
                                for (String studentId : selectedStudentIds) {
                                    db.collection("users").document(studentId)
                                            .update("class_ids", com.google.firebase.firestore.FieldValue.arrayUnion(classInfo.getDocumentId()));
                                }
                                Toast.makeText(this, "Đã gán học viên cho lớp!", Toast.LENGTH_SHORT).show();
                                loadClassesFromFirestore();
                            });
                });
                builder.setNegativeButton("Hủy", (d, which) -> {});
                android.app.AlertDialog dialog = builder.create();
                dialog.show();
            });
        });
    }
}