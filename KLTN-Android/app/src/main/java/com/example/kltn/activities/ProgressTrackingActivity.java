package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;


import com.example.kltn.R;

import android.util.Log;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.google.firebase.firestore.FieldPath;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import java.util.List;
import java.util.Map;


public class ProgressTrackingActivity extends AppCompatActivity {
    private LinearLayout cardFlashcard, cardExercise, cardTest, cardVideo;


    @Override
    protected void onCreate(Bundle savedInstanceState) {


        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_tracking);

        cardFlashcard = findViewById(R.id.card_flashcard);
        cardExercise = findViewById(R.id.card_exercise);
        cardTest = findViewById(R.id.card_test);
        cardVideo = findViewById(R.id.card_video);

        // Click Flashcard
        cardFlashcard.setOnClickListener(v -> showLearnedFlashcardSets());
        // Click Exercise
        cardExercise.setOnClickListener(v -> showCompletedExercises());
        // Click Test
        cardTest.setOnClickListener(v -> showCompletedTests());
        // Click Video
        cardVideo.setOnClickListener(v -> showWatchedVideos());

        // Lấy userId từ intent (hoặc session)
        String userId = getIntent().getStringExtra("user_id");
        if (userId == null) return;

        FirebaseFirestore db = FirebaseFirestore.getInstance();

        // Đếm số bộ flashcard đã học
        db.collection("users").document(userId)
            .collection("flashcard_progress")
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                int flashcardSetsLearned = queryDocumentSnapshots.size();
                ((TextView)findViewById(R.id.tv_words_learned)).setText(String.valueOf(flashcardSetsLearned));
                // Lấy tổng số bộ flashcard
                db.collection("flashcard_sets").get().addOnSuccessListener(snaps -> {
                    int totalFlashcardSets = snaps.size();
                    int percent = totalFlashcardSets > 0 ? (int) (100.0 * flashcardSetsLearned / totalFlashcardSets) : 0;
                    ((ProgressBar)findViewById(R.id.progress_words_learned)).setProgress(percent);
                    ((TextView)findViewById(R.id.tv_words_learned_progress)).setText(flashcardSetsLearned + "/" + totalFlashcardSets);
                });
            });

        // Đếm số bài ôn tập đã làm
        db.collection("users").document(userId)
            .collection("exercises")
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                int exercisesCompleted = queryDocumentSnapshots.size();
                ((TextView)findViewById(R.id.tv_exercises_completed)).setText(String.valueOf(exercisesCompleted));
                // Lấy tổng số bài ôn tập
                db.collection("exercises").get().addOnSuccessListener(snaps -> {
                    int totalExercises = snaps.size();
                    int percent = totalExercises > 0 ? (int) (100.0 * exercisesCompleted / totalExercises) : 0;
                    ((ProgressBar)findViewById(R.id.progress_exercises_completed)).setProgress(percent);
                    ((TextView)findViewById(R.id.tv_exercises_completed_progress)).setText(exercisesCompleted + "/" + totalExercises);
                });
            });

        // Đếm số bài kiểm tra đã làm
        db.collection("users").document(userId)
            .collection("tests")
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                int testsCompleted = queryDocumentSnapshots.size();
                ((TextView)findViewById(R.id.tv_tests_completed)).setText(String.valueOf(testsCompleted));
                // Lấy tổng số bài kiểm tra
                db.collection("tests").get().addOnSuccessListener(snaps -> {
                    int totalTests = snaps.size();
                    int percent = totalTests > 0 ? (int) (100.0 * testsCompleted / totalTests) : 0;
                    ((ProgressBar)findViewById(R.id.progress_tests_completed)).setProgress(percent);
                    ((TextView)findViewById(R.id.tv_tests_completed_progress)).setText(testsCompleted + "/" + totalTests);
                });
            });

        // Đếm số video đã xem
        db.collection("users").document(userId)
                .collection("video lectures")
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    int videosWatched = queryDocumentSnapshots.size();
                    ((TextView)findViewById(R.id.tv_videos_watched)).setText(String.valueOf(videosWatched));
                    // Lấy tổng số video
                    db.collection("video_lectures").get()
                            .addOnSuccessListener(snaps -> {
                                int totalVideos = snaps.size();
                                Log.d("ProgressTracking", "Total videos: " + totalVideos);
                                int percent = totalVideos > 0 ? (int) (100.0 * videosWatched / totalVideos) : 0;
                                ((ProgressBar)findViewById(R.id.progress_videos_watched)).setProgress(percent);
                                ((TextView)findViewById(R.id.tv_videos_watched_progress)).setText(videosWatched + "/" + totalVideos);
                            })
                            .addOnFailureListener(e -> Log.e("ProgressTracking", "Error getting total videos: " + e.getMessage()));
                })
                .addOnFailureListener(e -> Log.e("ProgressTracking", "Error getting videos watched: " + e.getMessage()));

        // Lấy đánh giá học viên mới nhất (evaluation) và hiển thị lên card
        db.collection("users").document(userId)
            .collection("evaluations")
            .orderBy("evaluation_date", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .limit(1)
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                if (queryDocumentSnapshots.isEmpty()) return;
                com.google.firebase.firestore.DocumentSnapshot doc = queryDocumentSnapshots.getDocuments().get(0);
                // Lấy dữ liệu
                String evaluationDate = doc.getString("evaluation_date");
                double overallRating = doc.contains("overall_rating") ? doc.getDouble("overall_rating") : 0.0;
                double ratingParticipation = doc.contains("rating_participation") ? doc.getDouble("rating_participation") : 0.0;
                double ratingUnderstanding = doc.contains("rating_understanding") ? doc.getDouble("rating_understanding") : 0.0;
                double ratingProgress = doc.contains("rating_progress") ? doc.getDouble("rating_progress") : 0.0;
                String comments = doc.getString("comments");
                long score = doc.contains("score") ? doc.getLong("score") : 0;
                String teacherId = doc.getString("teacher_id");

                // Lấy tên giáo viên
                if (teacherId != null && !teacherId.isEmpty()) {
                    db.collection("users").document(teacherId).get().addOnSuccessListener(teacherDoc -> {
                        String teacherName = teacherDoc.getString("full_name");
                        showEvaluationCard(evaluationDate, overallRating, ratingParticipation, ratingUnderstanding, ratingProgress, comments, score, teacherName);
                    });
                } else {
                    showEvaluationCard(evaluationDate, overallRating, ratingParticipation, ratingUnderstanding, ratingProgress, comments, score, "");
                }
            });
    }
    private void showEvaluationCard(String evaluationDate, double overall, double participation, double understanding, double progress, String comments, long score, String teacherName) {
        findViewById(R.id.card_evaluation).setVisibility(android.view.View.VISIBLE);
        ((TextView)findViewById(R.id.tv_evaluation_date)).setText("Ngày đánh giá: " + (evaluationDate != null ? evaluationDate : "N/A"));
        ((TextView)findViewById(R.id.tv_teacher_name)).setText("Giáo viên đánh giá: " + (teacherName != null ? teacherName : "N/A"));
        ((android.widget.RatingBar)findViewById(R.id.rating_participation)).setRating((float) participation);
        ((android.widget.RatingBar)findViewById(R.id.rating_understanding)).setRating((float) understanding);
        ((android.widget.RatingBar)findViewById(R.id.rating_progress)).setRating((float) progress);
        ((TextView)findViewById(R.id.tv_overall_rating)).setText("Điểm tổng: " + String.format(java.util.Locale.getDefault(), "%.1f", overall));
        ((TextView)findViewById(R.id.tv_score)).setText("Điểm số: " + score);
        ((TextView)findViewById(R.id.tv_comments)).setText("Nhận xét: " + (comments != null ? comments : ""));
    }
    private void showLearnedFlashcardSets() {


        String userId = getIntent().getStringExtra("user_id");
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId)
                .collection("flashcard_progress")
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Đã học flashcard")
                                .setMessage("Bạn chưa học bộ flashcard nào!")
                                .setPositiveButton("OK", null)
                                .show();
                    } else {
                        java.util.List<String> setNames = new java.util.ArrayList<>();
                        java.util.List<String> setIds = new java.util.ArrayList<>();
                        for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                            String setId = doc.getId();
                            String setName = doc.contains("set_name") ? doc.getString("set_name") : setId;
                            setNames.add(setName);
                            setIds.add(setId);
                        }
                        android.widget.ArrayAdapter<String> adapter = new android.widget.ArrayAdapter<>(this, android.R.layout.simple_list_item_1, setNames);
                        new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Các bộ flashcard đã học")
                                .setAdapter(adapter, (dialog, which) -> {
                                    // Khi click vào 1 bộ, mở chi tiết bộ đó
                                    String selectedSetId = setIds.get(which);
                                    String selectedSetName = setNames.get(which);
                                    Intent intent = new Intent(this, FlashcardDetailActivity.class);
                                    intent.putExtra("flashcard_set_id", selectedSetId);
                                    intent.putExtra("flashcard_set_title", selectedSetName);
                                    startActivity(intent);
                                })
                                .setNegativeButton("Đóng", null)
                                .show();
                    }
                })
                .addOnFailureListener(e -> {
                    new androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Lỗi")
                            .setMessage("Không thể lấy dữ liệu flashcard đã học: " + e.getMessage())
                            .setPositiveButton("OK", null)
                            .show();
                });
    }
    private void showCompletedExercises() {

        String userId = getIntent().getStringExtra("user_id");
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId)
                .collection("exercises")
                .whereEqualTo("completed", true)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Bài tập đã làm")
                                .setMessage("Bạn chưa hoàn thành bài tập nào!")
                                .setPositiveButton("OK", null)
                                .show();
                    } else {
                        java.util.List<String> exerciseIds = new java.util.ArrayList<>();
                        for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                            exerciseIds.add(doc.getId());
                        }
                        if (exerciseIds.isEmpty()) {
                            new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Bài tập đã làm")
                                .setMessage("Bạn chưa hoàn thành bài tập nào!")
                                .setPositiveButton("OK", null)
                                .show();
                            return;
                        }
                        // Truy vấn sang bảng exercises lấy title
                        db.collection("exercises")
                                .whereIn(FieldPath.documentId(), exerciseIds)
                                .get()
                                .addOnSuccessListener(exerciseDocs -> {
                                    java.util.List<String> titles = new java.util.ArrayList<>();
                                    for (com.google.firebase.firestore.DocumentSnapshot doc : exerciseDocs) {
                                        String title = doc.contains("title") && doc.getString("title") != null ? doc.getString("title") : doc.getId();
                                        titles.add(title);
                                    }
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Các bài tập đã hoàn thành")
                                            .setItems(titles.toArray(new String[0]), null)
                                            .setNegativeButton("Đóng", null)
                                            .show();
                                })
                                .addOnFailureListener(e2 -> {
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Lỗi")
                                            .setMessage("Không thể lấy tên bài tập: " + e2.getMessage())
                                            .setPositiveButton("OK", null)
                                            .show();
                                });
                    }
                })
                .addOnFailureListener(e -> {
                    new androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Lỗi")
                            .setMessage("Không thể lấy dữ liệu bài tập đã làm: " + e.getMessage())
                            .setPositiveButton("OK", null)
                            .show();
                });
    }
    private void showCompletedTests() {

        String userId = getIntent().getStringExtra("user_id");
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId)
                .collection("tests")
                .whereEqualTo("completed", true)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Bài kiểm tra đã làm")
                                .setMessage("Bạn chưa hoàn thành bài kiểm tra nào!")
                                .setPositiveButton("OK", null)
                                .show();
                    } else {
                        java.util.List<String> testIds = new java.util.ArrayList<>();
                        java.util.Map<String, Integer> testScores = new java.util.HashMap<>();
                        for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                            String testId = doc.getId();
                            int score = doc.contains("score") && doc.getLong("score") != null ? doc.getLong("score").intValue() : 0;
                            testIds.add(testId);
                            testScores.put(testId, score);
                        }
                        if (testIds.isEmpty()) {
                            new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Bài kiểm tra đã làm")
                                .setMessage("Bạn chưa hoàn thành bài kiểm tra nào!")
                                .setPositiveButton("OK", null)
                                .show();
                            return;
                        }
                        db.collection("tests")
                                .whereIn(FieldPath.documentId(), testIds)
                                .get()
                                .addOnSuccessListener(testDocs -> {
                                    java.util.List<String> summaries = new java.util.ArrayList<>();
                                    for (com.google.firebase.firestore.DocumentSnapshot doc : testDocs) {
                                        String title = doc.contains("title") && doc.getString("title") != null ? doc.getString("title") : doc.getId();
                                        int total = 0;
                                        if (doc.contains("questions") && doc.get("questions") instanceof java.util.List) {
                                            total = ((java.util.List<?>) doc.get("questions")).size();
                                        }
                                        int score = testScores.containsKey(doc.getId()) ? testScores.get(doc.getId()) : 0;
                                        String summary = title + " - Điểm: " + score + "/" + total;
                                        summaries.add(summary);
                                    }
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Các bài kiểm tra đã hoàn thành")
                                            .setItems(summaries.toArray(new String[0]), null)
                                            .setNegativeButton("Đóng", null)
                                            .show();
                                })
                                .addOnFailureListener(e2 -> {
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Lỗi")
                                            .setMessage("Không thể lấy tên/chi tiết bài kiểm tra: " + e2.getMessage())
                                            .setPositiveButton("OK", null)
                                            .show();
                                });
                    }
                })
                .addOnFailureListener(e -> {
                    new androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Lỗi")
                            .setMessage("Không thể lấy dữ liệu bài kiểm tra đã làm: " + e.getMessage())
                            .setPositiveButton("OK", null)
                            .show();
                });
    }
    private void showWatchedVideos() {
        String userId = getIntent().getStringExtra("user_id");
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId)
                .collection("video lectures")
                .whereEqualTo("watched", true)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        new androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Video đã xem")
                                .setMessage("Bạn chưa xem video nào!")
                                .setPositiveButton("OK", null)
                                .show();
                    } else {
                        java.util.List<String> videoIds = new java.util.ArrayList<>();
                        for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                            videoIds.add(doc.getId());
                        }
                        if (videoIds.isEmpty()) {
                            new androidx.appcompat.app.AlertDialog.Builder(this)
                                    .setTitle("Các video đã xem")
                                    .setMessage("Không tìm thấy thông tin video!")
                                    .setPositiveButton("Đóng", null)
                                    .show();
                            return;
                        }
                        db.collection("video_lectures")
                                .whereIn(com.google.firebase.firestore.FieldPath.documentId(), videoIds)
                                .get()
                                .addOnSuccessListener(videoDocs -> {
                                    java.util.List<String> videoTitles = new java.util.ArrayList<>();
                                    for (String vid : videoIds) {
                                        String title = vid;
                                        for (com.google.firebase.firestore.DocumentSnapshot vdoc : videoDocs) {
                                            if (vdoc.getId().equals(vid)) {
                                                title = vdoc.contains("title") && vdoc.getString("title") != null ? vdoc.getString("title") : vid;
                                                break;
                                            }
                                        }
                                        videoTitles.add(title);
                                    }
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Các video đã xem")
                                            .setItems(videoTitles.toArray(new String[0]), null)
                                            .setNegativeButton("Đóng", null)
                                            .show();
                                })
                                .addOnFailureListener(e2 -> {
                                    new androidx.appcompat.app.AlertDialog.Builder(this)
                                            .setTitle("Lỗi")
                                            .setMessage("Không thể lấy tên video: " + e2.getMessage())
                                            .setPositiveButton("OK", null)
                                            .show();
                                });
                    }
                })
                .addOnFailureListener(e -> {
                    new androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("Lỗi")
                            .setMessage("Không thể lấy dữ liệu video đã xem: " + e.getMessage())
                            .setPositiveButton("OK", null)
                            .show();
                });
    }
}



