package com.example.kltn.managers;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class BadgeManager {
    private final FirebaseFirestore db;
    private final String userId;

    // Bổ sung listener để callback khi nhận badge mới
    public interface BadgeAwardedListener {
        void onBadgeAwarded(String badgeId);
    }
    private BadgeAwardedListener listener;
    public void setBadgeAwardedListener(BadgeAwardedListener listener) {
        this.listener = listener;
    }

    public BadgeManager(String userId) {
        this.db = FirebaseFirestore.getInstance();
        this.userId = userId;
    }

    // Badge 1: Đăng nhập 3 ngày liên tiếp
    public void checkAndAwardLoginStreakBadge(int streakDays) {
        if (streakDays >= 3) {
            awardBadgeIfNotExists("badge1");
        }
    }

    // Badge 2: Học xong 1 bộ flashcard
    public void checkAndAwardFlashcardBadge() {
        db.collection("users").document(userId).collection("flashcard_progress").get()
            .addOnSuccessListener(snap -> {
                if (snap.size() >= 1) {
                    awardBadgeIfNotExists("badge2");
                }
            });
    }

    // Badge 3: Hoàn thành 1 bài tập
    public void checkAndAwardExerciseBadge() {
        db.collection("users").document(userId).collection("exercises").get()
            .addOnSuccessListener(snap -> {
                if (snap.size() >= 1) {
                    awardBadgeIfNotExists("badge3");
                }
            });
    }

    // Badge 4: Tham gia 2 bài kiểm tra
    public void checkAndAwardTestBadge() {
        db.collection("users").document(userId).collection("tests").get()
            .addOnSuccessListener(snap -> {
                if (snap.size() >= 2) {
                    awardBadgeIfNotExists("badge4");
                }
            });
    }

    // Badge 5: Xem 1 video bài giảng
    public void checkAndAwardVideoBadge() {
        db.collection("users").document(userId).collection("video lectures").get()
            .addOnSuccessListener(snap -> {
                if (snap.size() >= 1) {
                    awardBadgeIfNotExists("badge5");
                }
            });
    }

    // Badge 6: Streak học tập 3 ngày
    public void checkAndAwardLearningStreakBadge(int streakDays) {
        if (streakDays >= 3) {
            awardBadgeIfNotExists("badge6");
        }
    }

    public void updateLearningStreakAndCheckBadge() {
        com.google.firebase.firestore.DocumentReference userRef = db.collection("users").document(userId);
        String today = getTodayString();
        userRef.get().addOnSuccessListener(documentSnapshot -> {
            String lastLearning = documentSnapshot.getString("last_learning_date");
            Long streak = documentSnapshot.getLong("learning_streak_count");
            long streakCount = (streak != null) ? streak : 0;

            long newStreakCount;
            if (lastLearning != null && isYesterday(lastLearning, today)) {
                newStreakCount = streakCount + 1;
            } else if (lastLearning != null && isToday(lastLearning, today)) {
                newStreakCount = streakCount; // Đã học hôm nay, không tăng
            } else {
                newStreakCount = 1;
            }

            java.util.Map<String, Object> update = new java.util.HashMap<>();
            update.put("last_learning_date", today);
            update.put("learning_streak_count", newStreakCount);
            userRef.update(update);

            checkAndAwardLearningStreakBadge((int) newStreakCount);
        });
    }

    // Lấy ngày hôm nay dạng yyyy-MM-dd
    private String getTodayString() {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault());
        return sdf.format(new java.util.Date());
    }
    // Kiểm tra hôm qua
    private boolean isYesterday(String last, String today) {
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault());
            java.util.Date lastDate = sdf.parse(last);
            java.util.Date todayDate = sdf.parse(today);
            long diff = todayDate.getTime() - lastDate.getTime();
            return diff == 86400000L;
        } catch (Exception e) {
            return false;
        }
    }
    // Kiểm tra hôm nay
    private boolean isToday(String last, String today) {
        return last.equals(today);
    }

    // Hàm trao badge nếu chưa có
    private void awardBadgeIfNotExists(String badgeId) {
        db.collection("users").document(userId).collection("badges")
            .document(badgeId).get()
            .addOnSuccessListener(doc -> {
                if (!doc.exists()) {
                    Map<String, Object> badgeData = new HashMap<>();
                    badgeData.put("badge_id", badgeId);
                    badgeData.put("date_achieved", System.currentTimeMillis());
                    badgeData.put("seen", false); // Thêm trường này
                    db.collection("users").document(userId).collection("badges")
                        .document(badgeId)
                        .set(badgeData)
                        .addOnSuccessListener(aVoid -> {
                            if (listener != null) listener.onBadgeAwarded(badgeId);
                        });
                }
            });
    }
} 