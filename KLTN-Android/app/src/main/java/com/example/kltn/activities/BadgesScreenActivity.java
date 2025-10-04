package com.example.kltn.activities;

import android.os.Bundle;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.BadgeAdapter;
import com.example.kltn.dialogs.BadgeAwardedDialogFragment;
import com.example.kltn.models.Badge;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import android.widget.Toast;
import android.util.Log;

public class BadgesScreenActivity extends AppCompatActivity {
    private RecyclerView recyclerViewBadges;
    private BadgeAdapter badgeAdapter;
    private List<Badge> badgeList = new ArrayList<>();
    private String userId;
    private TextView tvBadgesEarnedCount;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_badges_screen);

        recyclerViewBadges = findViewById(R.id.recyclerViewBadges);
        recyclerViewBadges.setLayoutManager(new GridLayoutManager(this, 2)); // 2 cột cho đẹp
        badgeAdapter = new BadgeAdapter(badgeList);
        recyclerViewBadges.setAdapter(badgeAdapter);

        tvBadgesEarnedCount = findViewById(R.id.tv_badges_earned_count);
        progressBar = findViewById(R.id.progress_bar);

        userId = getIntent().getStringExtra("user_id");
        Log.d("BadgeScreen", "userId: " + userId);
        if (userId == null) {
            Toast.makeText(this, "Không xác định được user!", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        // Gọi kiểm tra badge mới chưa xem
        checkAndShowUnseenBadges();
        loadBadges();
    }

    private void loadBadges() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        // Lấy danh sách badgeId user đã đạt được
        db.collection("users").document(userId).collection("badges").get()
            .addOnSuccessListener(userBadgesSnap -> {
                Set<String> earnedBadgeIds = new HashSet<>();
                for (QueryDocumentSnapshot doc : userBadgesSnap) {
                    earnedBadgeIds.add(doc.getId());
                }
                // Lấy toàn bộ badges
                db.collection("badges").get()
                    .addOnSuccessListener(badgesSnap -> {
                        badgeList.clear();
                        int earnedCount = 0;
                        int totalCount = 0;
                        for (QueryDocumentSnapshot doc : badgesSnap) {
                            Badge badge = doc.toObject(Badge.class);
                            badge.setId(doc.getId());
                            boolean isEarned = earnedBadgeIds.contains(badge.getId());
                            badge.setEarned(isEarned);
                            if (isEarned) earnedCount++;
                            badgeList.add(badge);
                            totalCount++;
                        }
                        badgeAdapter.notifyDataSetChanged();
                        // Cập nhật số lượng và progress
                        tvBadgesEarnedCount.setText(earnedCount + "/" + totalCount + " badges earned");
                        if (totalCount > 0) {
                            int progress = (int) ((earnedCount * 100.0f) / totalCount);
                            progressBar.setProgress(progress);
                        } else {
                            progressBar.setProgress(0);
                        }
                    });
            });
    }

    private void checkAndShowUnseenBadges() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId).collection("badges")
            .whereEqualTo("seen", false)
            .get()
            .addOnSuccessListener(querySnapshot -> {
                showUnseenBadgeDialogs(querySnapshot.getDocuments(), 0);
            });
    }

    // Đệ quy hiện dialog cho từng badge chưa xem
    private void showUnseenBadgeDialogs(java.util.List<com.google.firebase.firestore.DocumentSnapshot> badgeDocs, int index) {
        if (index >= badgeDocs.size()) return;
        com.google.firebase.firestore.DocumentSnapshot badgeDoc = badgeDocs.get(index);
        String badgeId = badgeDoc.getString("badge_id");
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("badges").document(badgeId).get().addOnSuccessListener(doc -> {
            String name = doc.getString("name");
            String desc = doc.getString("description");
            String imageUrl = doc.getString("imageUrl");
            BadgeAwardedDialogFragment dialog = BadgeAwardedDialogFragment.newInstance(name, desc, imageUrl);
            dialog.setOnOkClickListener(() -> {
                // Update seen = true
                badgeDoc.getReference().update("seen", true);
                // Hiện dialog tiếp theo nếu còn
                showUnseenBadgeDialogs(badgeDocs, index + 1);
            });
            if (!isFinishing() && !isDestroyed()) {
                dialog.show(getSupportFragmentManager(), "badge_awarded");
            }
        });
    }
} 