package com.example.kltn.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.FlashcardSetAdapter;
import com.example.kltn.models.ContentItem;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;
import android.app.AlertDialog;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import com.google.firebase.Timestamp;
import java.util.HashMap;
import java.util.Map;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class FlashcardsFragment extends Fragment {
    private RecyclerView recyclerView;
    private FlashcardSetAdapter adapter;
    private List<ContentItem> flashcardSets = new ArrayList<>();
    private String courseId = "";
    private String searchQuery = "";

    public void setCourseId(String courseId) {
        this.courseId = courseId;
        loadFlashcardSets();
    }

    public void setSearchQuery(String query) {
        this.searchQuery = query == null ? "" : query.trim().toLowerCase();
        filterAndShow();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_flashcards, container, false);
        recyclerView = view.findViewById(R.id.rvFlashcardSets);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new FlashcardSetAdapter(flashcardSets);
        recyclerView.setAdapter(adapter);
        loadFlashcardSets();

        // Đăng ký callback cho Adapter
        adapter.setOnFlashcardSetActionListener(new FlashcardSetAdapter.OnFlashcardSetActionListener() {
            @Override
            public void onEdit(ContentItem flashcardSet) {
                showAddEditFlashcardSetDialog(flashcardSet);
            }
            @Override
            public void onDelete(ContentItem flashcardSet) {
                confirmDeleteFlashcardSet(flashcardSet);
            }
        });

        // Bắt sự kiện click nút thêm mới
        FloatingActionButton fabAdd = view.findViewById(R.id.fabAddFlashcardSet);
        fabAdd.setOnClickListener(v -> showAddEditFlashcardSetDialog(null));

        return view;
    }

    private void loadFlashcardSets() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        if (courseId != null && !courseId.isEmpty()) {
            db.collection("flashcard_sets").whereEqualTo("course_id", courseId).get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    flashcardSets.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        ContentItem item = new ContentItem();
                        item.setId(doc.getId());
                        item.setTitle(doc.getString("title"));
                        item.setDescription(doc.getString("description"));
                        item.setCourseId(doc.getString("course_id"));
                        flashcardSets.add(item);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải flashcard sets: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } else {
            db.collection("flashcard_sets").get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    flashcardSets.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        ContentItem item = new ContentItem();
                        item.setId(doc.getId());
                        item.setTitle(doc.getString("title"));
                        item.setDescription(doc.getString("description"));
                        item.setCourseId(doc.getString("course_id"));
                        flashcardSets.add(item);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải flashcard sets: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }

    private void filterAndShow() {
        List<ContentItem> filtered = new ArrayList<>();
        if (searchQuery.isEmpty()) {
            filtered.addAll(flashcardSets);
        } else {
            for (ContentItem item : flashcardSets) {
                if ((item.getTitle() != null && item.getTitle().toLowerCase().contains(searchQuery)) ||
                    (item.getDescription() != null && item.getDescription().toLowerCase().contains(searchQuery))) {
                    filtered.add(item);
                }
            }
        }
        adapter = new FlashcardSetAdapter(filtered);
        adapter.setOnFlashcardSetActionListener(new FlashcardSetAdapter.OnFlashcardSetActionListener() {
            @Override
            public void onEdit(ContentItem flashcardSet) {
                showAddEditFlashcardSetDialog(flashcardSet);
            }
            @Override
            public void onDelete(ContentItem flashcardSet) {
                confirmDeleteFlashcardSet(flashcardSet);
            }
        });
        recyclerView.setAdapter(adapter);
    }

    public void showAddEditFlashcardSetDialog(@Nullable ContentItem flashcardSet) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_add_edit_flashcard_set, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();

        EditText etSetTitle = dialogView.findViewById(R.id.etSetTitle);
        EditText etSetDescription = dialogView.findViewById(R.id.etSetDescription);
        Spinner spinnerCourse = dialogView.findViewById(R.id.spinnerCourse);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnSave = dialogView.findViewById(R.id.btnSave);

        // Load danh sách khoá học vào spinner
        FirebaseFirestore.getInstance().collection("courses").get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                java.util.List<String> courseNames = new java.util.ArrayList<>();
                java.util.List<String> courseIds = new java.util.ArrayList<>();
                for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                    courseNames.add(doc.getString("name"));
                    courseIds.add(doc.getId());
                }
                ArrayAdapter<String> adapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseNames);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerCourse.setAdapter(adapter);
                // Nếu sửa thì chọn đúng khoá học cũ
                if (flashcardSet != null && flashcardSet.getCourseId() != null) {
                    int idx = courseIds.indexOf(flashcardSet.getCourseId());
                    if (idx >= 0) spinnerCourse.setSelection(idx);
                }
            });

        if (flashcardSet != null) {
            etSetTitle.setText(flashcardSet.getTitle());
            etSetDescription.setText(flashcardSet.getDescription());
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String title = etSetTitle.getText().toString().trim();
            String description = etSetDescription.getText().toString().trim();
            int courseIdx = spinnerCourse.getSelectedItemPosition();
            if (title.isEmpty()) {
                etSetTitle.setError("Vui lòng nhập tên bộ flashcard");
                return;
            }
            if (courseIdx < 0) {
                Toast.makeText(getContext(), "Vui lòng chọn khoá học", Toast.LENGTH_SHORT).show();
                return;
            }
            String courseId = ((ArrayAdapter<String>) spinnerCourse.getAdapter()).getItem(courseIdx);
            // Lấy id thực tế
            FirebaseFirestore.getInstance().collection("courses").get().addOnSuccessListener(qs -> {
                java.util.List<String> courseIds = new java.util.ArrayList<>();
                for (QueryDocumentSnapshot doc : qs) courseIds.add(doc.getId());
                String courseIdReal = courseIds.get(courseIdx);
                Map<String, Object> data = new HashMap<>();
                data.put("title", title);
                data.put("description", description);
                data.put("course_id", courseIdReal);
                if (flashcardSet == null) {
                    // Thêm mới
                    data.put("created_at", Timestamp.now());
                    data.put("created_by", "admin"); // Có thể lấy user thực tế
                    data.put("set_id", title.toLowerCase().replaceAll("[^a-z0-9]", "_"));
                    FirebaseFirestore.getInstance().collection("flashcard_sets")
                        .add(data)
                        .addOnSuccessListener(docRef -> {
                            Toast.makeText(getContext(), "Đã thêm bộ flashcard!", Toast.LENGTH_SHORT).show();
                            dialog.dismiss();
                            loadFlashcardSets();
                        })
                        .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi thêm: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                } else {
                    // Sửa
                    FirebaseFirestore.getInstance().collection("flashcard_sets")
                        .document(flashcardSet.getId())
                        .update(data)
                        .addOnSuccessListener(unused -> {
                            Toast.makeText(getContext(), "Đã cập nhật bộ flashcard!", Toast.LENGTH_SHORT).show();
                            dialog.dismiss();
                            loadFlashcardSets();
                        })
                        .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi cập nhật: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                }
            });
        });
        dialog.show();
    }

    private void confirmDeleteFlashcardSet(ContentItem flashcardSet) {
        new AlertDialog.Builder(getContext())
            .setTitle("Xoá bộ flashcard")
            .setMessage("Bạn có chắc muốn xoá bộ này không?")
            .setPositiveButton("Xoá", (dialog, which) -> {
                FirebaseFirestore.getInstance().collection("flashcard_sets")
                    .document(flashcardSet.getId())
                    .delete()
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(getContext(), "Đã xoá bộ flashcard!", Toast.LENGTH_SHORT).show();
                        loadFlashcardSets();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi xoá: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            })
            .setNegativeButton("Huỷ", null)
            .show();
    }
} 