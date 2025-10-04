package com.example.kltn.activities;

import android.os.Bundle;
import android.widget.TextView;
import com.example.kltn.R;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView;
import androidx.appcompat.app.AppCompatActivity;
import com.example.kltn.managers.BadgeManager;
import com.google.firebase.firestore.FirebaseFirestore;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;

public class VideoDetail extends AppCompatActivity {
    private String userId;
    private boolean badgeAwarded = false;
    private float videoDuration = 0f; // tổng số giây video

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_detail);

        userId = getIntent().getStringExtra("user_id");
        String title = getIntent().getStringExtra("title");
        String description = getIntent().getStringExtra("description");
        String duration = getIntent().getStringExtra("duration");
        String topic = getIntent().getStringExtra("topic");
        String thumbnailUrl = getIntent().getStringExtra("thumbnailUrl");
        String videoUrl = getIntent().getStringExtra("videoUrl");
        // Lấy videoId Firestore từ intent
        String videoId = getIntent().getStringExtra("video_id");

        TextView tvTitle = findViewById(R.id.rfxxxes5byk5);
        TextView tvDesc = findViewById(R.id.r6nrzucmp76v);
        tvTitle.setText(title);
        tvDesc.setText(description);

        // Lấy videoId Youtube (nếu cần play)
        String youtubeId = extractYoutubeId(videoUrl);

        YouTubePlayerView youTubePlayerView = findViewById(R.id.youtubePlayerView);
        getLifecycle().addObserver(youTubePlayerView);
        youTubePlayerView.addYouTubePlayerListener(new AbstractYouTubePlayerListener() {
            @Override
            public void onReady(YouTubePlayer youTubePlayer) {
                youTubePlayer.cueVideo(youtubeId, 0);
            }
            @Override
            public void onVideoDuration(YouTubePlayer youTubePlayer, float duration) {
                videoDuration = duration;
            }
            @Override
            public void onCurrentSecond(YouTubePlayer youTubePlayer, float second) {
                if (!badgeAwarded && videoDuration > 0 && second >= 0.8 * videoDuration) {
                    badgeAwarded = true; // Đảm bảo chỉ trao 1 lần
                    // Lưu tiến độ theo videoId Firestore
                    if (userId != null && videoId != null && !videoId.isEmpty()) {
                        FirebaseFirestore db = FirebaseFirestore.getInstance();
                        db.collection("users").document(userId)
                            .collection("video lectures").document(videoId)
                            .set(new java.util.HashMap<String, Object>() {{
                                put("watched", true);
                                put("timestamp", System.currentTimeMillis());
                            }});
                        BadgeManager badgeManager = new BadgeManager(userId);
                        badgeManager.checkAndAwardVideoBadge();
                        badgeManager.updateLearningStreakAndCheckBadge();
                        updateLearningHistory(userId);
                    }
                }
            }
        });
    }

    // Hàm tách videoId từ link YouTube
    private String extractYoutubeId(String url) {
        String pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#\\&\\?\\n]*";
        java.util.regex.Pattern compiledPattern = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";
    }

    // Cập nhật learningHistory khi user học xong
    private void updateLearningHistory(String userId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        db.collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            Map<String, Boolean> history = (Map<String, Boolean>) documentSnapshot.get("learningHistory");
            if (history == null) history = new HashMap<>();
            history.put(today, true);
            db.collection("users").document(userId)
                .update("learningHistory", history);
        });
    }
}