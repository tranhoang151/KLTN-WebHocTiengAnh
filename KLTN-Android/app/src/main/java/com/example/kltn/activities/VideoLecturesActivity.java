package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.VideoLessonAdapter;
import com.example.kltn.models.VideoLesson;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.Comparator;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

public class VideoLecturesActivity extends AppCompatActivity {
    private List<VideoLesson> videos = new ArrayList<>();
    private VideoLessonAdapter adapter;
    private List<VideoLesson> allVideos = new ArrayList<>(); // Lưu toàn bộ video để search
    private String userId;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_lectures);
        userId = getIntent().getStringExtra("user_id");
        RecyclerView rv = findViewById(R.id.rvVideoLectures);
        rv.setLayoutManager(new LinearLayoutManager(this));
        adapter = new VideoLessonAdapter(this, videos, video -> openVideoDetail(video));
        rv.setAdapter(adapter);
        loadVideosFromFirestore();
        // Search
        EditText etSearch = findViewById(R.id.editTextSearch);
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                filterVideos(s.toString());
            }
        });
    }
    private void loadVideosFromFirestore() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String userId = getIntent().getStringExtra("user_id");
        if (userId == null) return;
        db.collection("users").document(userId).get().addOnSuccessListener(userDoc -> {
            String classId = null;
            Object classIdsObj = userDoc.get("class_ids");
            if (classIdsObj instanceof java.util.List && !((java.util.List<?>) classIdsObj).isEmpty()) {
                classId = (String) ((java.util.List<?>) classIdsObj).get(0);
            } else {
                classId = userDoc.getString("class_id");
            }
            if (classId == null || classId.isEmpty()) return;
            db.collection("classes").document(classId).get().addOnSuccessListener(classDoc -> {
                String courseId = classDoc.getString("course_id");
                if (courseId == null || courseId.isEmpty()) return;
                db.collection("video_lectures").whereEqualTo("course_id", courseId).get().addOnSuccessListener(queryDocumentSnapshots -> {
                    videos.clear();
                    allVideos.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        VideoLesson v = new VideoLesson();
                        v.id = doc.getId();
                        v.title = doc.getString("title");
                        v.description = doc.getString("description");
                        v.duration = doc.getString("duration");
                        v.topic = doc.getString("topic");
                        v.thumbnailUrl = doc.getString("thumbnail_url");
                        v.videoUrl = doc.getString("video_url");
                        v.teacherId = doc.getString("teacher_id");
                        allVideos.add(v);
                    }
                    // Sắp xếp theo số thứ tự bài học trong title (Lesson 1, Lesson 2, ...)
                    java.util.Collections.sort(allVideos, (v1, v2) -> Integer.compare(extractLessonNumber(v1.title), extractLessonNumber(v2.title)));
                    videos.addAll(allVideos);
                    adapter.notifyDataSetChanged();
                });
            });
        });
    }
    private void filterVideos(String query) {
        videos.clear();
        if (query == null || query.trim().isEmpty()) {
            videos.addAll(allVideos);
        } else {
            String q = query.trim().toLowerCase();
            for (VideoLesson v : allVideos) {
                if (v.title != null && v.title.toLowerCase().contains(q)) {
                    videos.add(v);
                }
            }
        }
        adapter.notifyDataSetChanged();
    }
    private void openVideoDetail(VideoLesson video) {
        Intent intent = new Intent(this, VideoDetail.class);
        intent.putExtra("video_id", video.id); // truyền videoId Firestore
        intent.putExtra("title", video.title);
        intent.putExtra("description", video.description);
        intent.putExtra("duration", video.duration);
        intent.putExtra("topic", video.topic);
        intent.putExtra("thumbnailUrl", video.thumbnailUrl);
        intent.putExtra("videoUrl", video.videoUrl);
        intent.putExtra("teacherId", video.teacherId);
        if (userId != null) intent.putExtra("user_id", userId);
        startActivity(intent);
    }
    // Hàm hỗ trợ tách số bài học từ title
    private int extractLessonNumber(String title) {
        if (title == null) return 0;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("Lesson (\\d+)").matcher(title);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }
} 