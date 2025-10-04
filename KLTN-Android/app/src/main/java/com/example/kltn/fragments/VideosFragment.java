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
import com.example.kltn.fragments.VideosManageAdapter;
import com.example.kltn.models.VideoLesson;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Button;

public class VideosFragment extends Fragment {
    private RecyclerView recyclerView;
    private VideosManageAdapter adapter;
    private List<VideoLesson> videos = new ArrayList<>();
    private String courseId = "";
    private String searchQuery = "";

    public void setCourseId(String courseId) {
        this.courseId = courseId;
        loadVideos();
    }

    public void setSearchQuery(String query) {
        this.searchQuery = query == null ? "" : query.trim().toLowerCase();
        filterAndShow();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_videos, container, false);
        recyclerView = view.findViewById(R.id.rvVideos);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new VideosManageAdapter(videos);
        recyclerView.setAdapter(adapter);
        loadVideos();

        // Bắt sự kiện thêm mới
        View fabAdd = view.findViewById(R.id.fabAddVideo);
        fabAdd.setOnClickListener(v -> showAddEditVideoDialog(null));

        // Đăng ký callback cho adapter
        adapter.setOnVideoActionListener(new VideosManageAdapter.OnVideoActionListener() {
            @Override
            public void onLongClick(VideoLesson video, View anchorView) {
                android.widget.PopupMenu popup = new android.widget.PopupMenu(getContext(), anchorView);
                popup.getMenu().add("Sửa");
                popup.getMenu().add("Xoá");
                popup.setOnMenuItemClickListener(item -> {
                    if (item.getTitle().equals("Sửa")) {
                        showAddEditVideoDialog(video);
                        return true;
                    } else if (item.getTitle().equals("Xoá")) {
                        confirmDeleteVideo(video);
                        return true;
                    }
                    return false;
                });
                popup.show();
            }
        });
        return view;
    }

    private void loadVideos() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        if (courseId != null && !courseId.isEmpty()) {
            db.collection("video_lectures").whereEqualTo("course_id", courseId).get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    videos.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        VideoLesson v = new VideoLesson();
                        v.id = doc.getId();
                        v.title = doc.getString("title");
                        v.description = doc.getString("description");
                        v.duration = doc.getString("duration");
                        v.topic = doc.getString("topic");
                        v.thumbnailUrl = doc.getString("thumbnail_url");
                        v.videoUrl = doc.getString("video_url");
                        videos.add(v);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải videos: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } else {
            db.collection("video_lectures").get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    videos.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        VideoLesson v = new VideoLesson();
                        v.id = doc.getId();
                        v.title = doc.getString("title");
                        v.description = doc.getString("description");
                        v.duration = doc.getString("duration");
                        v.topic = doc.getString("topic");
                        v.thumbnailUrl = doc.getString("thumbnail_url");
                        v.videoUrl = doc.getString("video_url");
                        videos.add(v);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải videos: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }

    private void filterAndShow() {
        List<VideoLesson> filtered = new ArrayList<>();
        if (searchQuery.isEmpty()) {
            filtered.addAll(videos);
        } else {
            for (VideoLesson v : videos) {
                if ((v.title != null && v.title.toLowerCase().contains(searchQuery)) ||
                    (v.description != null && v.description.toLowerCase().contains(searchQuery)) ||
                    (v.topic != null && v.topic.toLowerCase().contains(searchQuery))) {
                    filtered.add(v);
                }
            }
        }
        adapter = new VideosManageAdapter(filtered);
        recyclerView.setAdapter(adapter);
        // Đăng ký lại callback long click cho adapter mới
        adapter.setOnVideoActionListener(new VideosManageAdapter.OnVideoActionListener() {
            @Override
            public void onLongClick(VideoLesson video, View anchorView) {
                android.widget.PopupMenu popup = new android.widget.PopupMenu(getContext(), anchorView);
                popup.getMenu().add("Sửa");
                popup.getMenu().add("Xoá");
                popup.setOnMenuItemClickListener(item -> {
                    if (item.getTitle().equals("Sửa")) {
                        showAddEditVideoDialog(video);
                        return true;
                    } else if (item.getTitle().equals("Xoá")) {
                        confirmDeleteVideo(video);
                        return true;
                    }
                    return false;
                });
                popup.show();
            }
        });
    }

    // Dialog thêm/sửa video
    public void showAddEditVideoDialog(@Nullable VideoLesson video) {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_add_edit_video, null);
        builder.setView(dialogView);
        android.app.AlertDialog dialog = builder.create();
        dialog.show();

        Spinner spinnerCourse = dialogView.findViewById(R.id.spinnerCourse);
        EditText etTitle = dialogView.findViewById(R.id.etVideoTitle);
        EditText etDesc = dialogView.findViewById(R.id.etVideoDesc);
        EditText etDuration = dialogView.findViewById(R.id.etVideoDuration);
        EditText etTopic = dialogView.findViewById(R.id.etVideoTopic);
        EditText etThumbnail = dialogView.findViewById(R.id.etThumbnailUrl);
        EditText etVideoUrl = dialogView.findViewById(R.id.etVideoUrl);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnSave = dialogView.findViewById(R.id.btnSave);

        // Load khoá học
        List<String> courseNames = new ArrayList<>();
        List<String> courseIds = new ArrayList<>();
        FirebaseFirestore.getInstance().collection("courses").get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                for (com.google.firebase.firestore.QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                    courseNames.add(doc.getString("name"));
                    courseIds.add(doc.getId());
                }
                ArrayAdapter<String> adapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseNames);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerCourse.setAdapter(adapter);
                // Nếu sửa thì chọn đúng khoá học
                if (video != null && video.courseId != null) {
                    int idx = courseIds.indexOf(video.courseId);
                    if (idx >= 0) spinnerCourse.setSelection(idx);
                }
            });

        // Nếu sửa thì set dữ liệu cũ
        if (video != null) {
            etTitle.setText(video.title);
            etDesc.setText(video.description);
            etDuration.setText(video.duration);
            etTopic.setText(video.topic);
            etThumbnail.setText(video.thumbnailUrl);
            etVideoUrl.setText(video.videoUrl);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String title = etTitle.getText().toString().trim();
            String desc = etDesc.getText().toString().trim();
            String duration = etDuration.getText().toString().trim();
            String topic = etTopic.getText().toString().trim();
            String thumbnail = etThumbnail.getText().toString().trim();
            String videoUrl = etVideoUrl.getText().toString().trim();
            int courseIdx = spinnerCourse.getSelectedItemPosition();
            if (title.isEmpty() || desc.isEmpty() || duration.isEmpty() || topic.isEmpty() || thumbnail.isEmpty() || videoUrl.isEmpty() || courseIdx < 0) {
                Toast.makeText(getContext(), "Vui lòng nhập đầy đủ thông tin", Toast.LENGTH_SHORT).show();
                return;
            }
            String courseId = courseIds.get(courseIdx);
            // Tạo map dữ liệu
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("title", title);
            data.put("description", desc);
            data.put("duration", duration);
            data.put("topic", topic);
            data.put("thumbnail_url", thumbnail);
            data.put("video_url", videoUrl);
            data.put("course_id", courseId);
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            if (video == null) {
                // Thêm mới
                db.collection("video_lectures").add(data)
                    .addOnSuccessListener(docRef -> {
                        Toast.makeText(getContext(), "Đã thêm video!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadVideos();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi thêm: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            } else {
                // Sửa
                db.collection("video_lectures").document(video.id).update(data)
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(getContext(), "Đã cập nhật video!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadVideos();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi cập nhật: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        });
    }

    // Xác nhận xoá video
    private void confirmDeleteVideo(VideoLesson video) {
        new android.app.AlertDialog.Builder(getContext())
            .setTitle("Xoá video")
            .setMessage("Bạn có chắc muốn xoá video này không?")
            .setPositiveButton("Xoá", (dialog, which) -> {
                FirebaseFirestore.getInstance().collection("video_lectures")
                    .document(video.id)
                    .delete()
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(getContext(), "Đã xoá video!", Toast.LENGTH_SHORT).show();
                        loadVideos();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi xoá: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            })
            .setNegativeButton("Huỷ", null)
            .show();
    }
} 