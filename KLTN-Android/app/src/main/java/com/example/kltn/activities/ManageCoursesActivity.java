package com.example.kltn.activities;

import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.adapters.CourseAdapter;
import com.example.kltn.models.Course;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.List;
import android.app.AlertDialog;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import com.google.firebase.Timestamp;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class ManageCoursesActivity extends AppCompatActivity {

    private RecyclerView recyclerViewCourses;
    private CourseAdapter courseAdapter;
    private List<Course> courseList = new ArrayList<>();
    private List<Course> filteredCourseList = new ArrayList<>();
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_courses);

        userId = getIntent().getStringExtra("user_id");
        recyclerViewCourses = findViewById(R.id.recyclerViewCourses);
        recyclerViewCourses.setLayoutManager(new LinearLayoutManager(this));
        // Khởi tạo danh sách lọc ban đầu
        filteredCourseList.addAll(courseList);
        courseAdapter = new CourseAdapter(this, filteredCourseList, new CourseAdapter.OnCourseActionListener() {
            @Override
            public void onAddClass(Course course) {
                showAssignClassDialog(course);
            }
            @Override
            public void onDeleteCourse(Course course) {
                new android.app.AlertDialog.Builder(ManageCoursesActivity.this)
                        .setTitle("Xóa khóa học")
                        .setMessage("Bạn có chắc muốn xóa khóa học này?")
                        .setPositiveButton("Xóa", (dialog, which) -> {
                            FirebaseFirestore db = FirebaseFirestore.getInstance();
                            db.collection("courses").document(course.getId())
                                    .delete()
                                    .addOnSuccessListener(aVoid -> {
                                        Toast.makeText(ManageCoursesActivity.this, "Đã xóa khóa học!", Toast.LENGTH_SHORT).show();
                                        loadCoursesFromFirestore();
                                    })
                                    .addOnFailureListener(e -> {
                                        Toast.makeText(ManageCoursesActivity.this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                                    });
                        })
                        .setNegativeButton("Hủy", null)
                        .show();
            }
            @Override
            public void onEditCourse(Course course) {
                showEditCourseDialog(course);
            }
        });
        recyclerViewCourses.setAdapter(courseAdapter);
        loadCoursesFromFirestore();

        // Thiết lập tìm kiếm realtime
        EditText etSearch = findViewById(R.id.etSearchCourse);
        etSearch.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterCourses(s.toString());
            }
            @Override
            public void afterTextChanged(android.text.Editable s) {}
        });

        FloatingActionButton fabAddCourse = findViewById(R.id.fabAddCourse);
        fabAddCourse.setOnClickListener(v -> showAddCourseDialog());
    }

    private void loadCoursesFromFirestore() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("courses").get().addOnSuccessListener(queryDocumentSnapshots -> {
            List<Course> newList = new ArrayList<>();
            for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                Course course = doc.toObject(Course.class);
                course.setId(doc.getId());
                newList.add(course);
            }
            courseList = newList;
            filterCourses(((EditText)findViewById(R.id.etSearchCourse)).getText().toString());
        });
    }

    // Hiển thị dialog chỉnh sửa khoá học
    private void showEditCourseDialog(Course course) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = LayoutInflater.from(this);
        View dialogView = inflater.inflate(R.layout.dialog_edit_course, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();
        EditText etName = dialogView.findViewById(R.id.etEditCourseName);
        EditText etDesc = dialogView.findViewById(R.id.etEditCourseDesc);
        Button btnSave = dialogView.findViewById(R.id.btnSaveEditCourse);
        Button btnCancel = dialogView.findViewById(R.id.btnCancelEditCourse);

        // Set current value
        etName.setText(course.getName());
        etDesc.setText(course.getDescription());

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String desc = etDesc.getText().toString().trim();
            if (name.isEmpty()) {
                etName.setError("Nhập tên khóa học");
                return;
            }
            if (desc.isEmpty()) {
                etDesc.setError("Nhập mô tả khóa học");
                return;
            }
            // Update Firestore
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            db.collection("courses").document(course.getId())
                    .update("name", name, "description", desc)
                    .addOnSuccessListener(aVoid -> {
                        Toast.makeText(this, "Đã cập nhật khóa học!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadCoursesFromFirestore();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    });
        });
        dialog.show();
    }

    // Hàm lọc danh sách khóa học theo từ khóa
    private void filterCourses(String keyword) {
        filteredCourseList.clear();
        if (keyword == null || keyword.trim().isEmpty()) {
            filteredCourseList.addAll(courseList);
        } else {
            String lowerKeyword = keyword.toLowerCase();
            for (Course course : courseList) {
                if ((course.getName() != null && course.getName().toLowerCase().contains(lowerKeyword)) ||
                    (course.getDescription() != null && course.getDescription().toLowerCase().contains(lowerKeyword))) {
                    filteredCourseList.add(course);
                }
            }
        }
        courseAdapter.updateData(filteredCourseList);
    }

    private void showAddCourseDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = LayoutInflater.from(this);
        android.view.View dialogView = inflater.inflate(R.layout.dialog_add_course, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();
        EditText etName = dialogView.findViewById(R.id.etCourseName);
        EditText etDesc = dialogView.findViewById(R.id.etCourseDesc);
        Button btnAdd = dialogView.findViewById(R.id.btnAddCourse);
        Button btnCancel = dialogView.findViewById(R.id.btnCancelAddCourse);
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnAdd.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String desc = etDesc.getText().toString().trim();
            if (TextUtils.isEmpty(name)) {
                etName.setError("Nhập tên khóa học");
                return;
            }
            if (TextUtils.isEmpty(desc)) {
                etDesc.setError("Nhập mô tả khóa học");
                return;
            }
            // Tạo object và lưu Firestore
            java.util.Map<String, Object> course = new java.util.HashMap<>();
            course.put("name", name);
            course.put("description", desc);
            course.put("created_at", Timestamp.now());
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            db.collection("courses").add(course)
                .addOnSuccessListener(docRef -> {
                    Toast.makeText(this, "Đã thêm khóa học!", Toast.LENGTH_SHORT).show();
                    dialog.dismiss();
                    // Reload danh sách
                    loadCoursesFromFirestore();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
        });
        dialog.show();
    }

    // Thêm hàm này vào ManageCoursesActivity
    private void showAssignClassDialog(Course course) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("classes").get().addOnSuccessListener(queryDocumentSnapshots -> {
            List<String> classNames = new ArrayList<>();
            List<String> classIds = new ArrayList<>();
            for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                String courseId = doc.getString("course_id");
                if (courseId == null || courseId.isEmpty()) {
                    String name = doc.getString("name");
                    classNames.add(name);
                    classIds.add(doc.getId());
                }
            }
            boolean[] checkedItems = new boolean[classNames.size()];
            List<Integer> selectedIndexes = new ArrayList<>();
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("Chọn lớp để gán vào khóa học");
            builder.setMultiChoiceItems(classNames.toArray(new String[0]), checkedItems, (dialog, which, isChecked) -> {
                if (isChecked) {
                    selectedIndexes.add(which);
                } else {
                    selectedIndexes.remove(Integer.valueOf(which));
                }
            });
            builder.setPositiveButton("Gán lớp", (dialog, which) -> {
                for (int idx : selectedIndexes) {
                    String classId = classIds.get(idx);
                    String className = classNames.get(idx);
                    // 1. Thêm vào subcollection 'classes' của khóa học
                    java.util.Map<String, Object> classData = new java.util.HashMap<>();
                    classData.put("name", className);
                    classData.put("class_id", classId);
                    db.collection("courses").document(course.getId())
                        .collection("classes").document(classId)
                        .set(classData);
                    // 2. Update course_id của lớp
                    db.collection("classes").document(classId)
                        .update("course_id", course.getId());
                }
                Toast.makeText(this, "Đã gán lớp vào khóa học!", Toast.LENGTH_SHORT).show();
            });
            builder.setNegativeButton("Hủy", null);
            builder.show();
        });
    }
}