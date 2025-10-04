package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.ArrayList;
import java.util.List;
import com.bumptech.glide.Glide;
import com.google.firebase.firestore.FirebaseFirestore;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

public class StudentHomeActivity extends AppCompatActivity {

    private ImageView ivAvatar;
    private TextView tvUserName;
    private ImageView imgFlashCard, imgBaitap, imgTest, imgVideo, imgBadge, imgProgress, imgStreak;
    private String userEmail;
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student_home);

        // Get user email và user_id từ intent
        userEmail = getIntent().getStringExtra("user_email");
        userId = getIntent().getStringExtra("user_id");
        Log.d("StudentHome", "userId: " + userId + ", userEmail: " + userEmail);

        // Initialize views
        initViews();

        // Lấy avatar, tên và kiểm tra class/course từ Firestore
        FirebaseFirestore.getInstance().collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            if (documentSnapshot.exists()) {
                String fullName = documentSnapshot.getString("full_name");
                String avatarBase64 = documentSnapshot.getString("avatar_base64");
                // Lấy last name
                String lastName = fullName != null && fullName.trim().contains(" ") ? fullName.trim().substring(fullName.trim().lastIndexOf(" ") + 1) : fullName;
                tvUserName.setText("Hello, " + (lastName != null ? lastName : ""));
                if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                    byte[] decodedString = Base64.decode(avatarBase64, Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    Glide.with(this).load(decodedByte).circleCrop().into(ivAvatar);
                } else {
                    ivAvatar.setImageResource(R.drawable.user);
                }

                // Check class/course
                boolean hasClass = false;
                Object classIdsObj = documentSnapshot.get("class_ids");
                if (classIdsObj instanceof java.util.List && !((java.util.List<?>) classIdsObj).isEmpty()) {
                    hasClass = true;
                } else if (documentSnapshot.contains("class_id")) {
                    String classId = documentSnapshot.getString("class_id");
                    if (classId != null && !classId.isEmpty()) hasClass = true;
                }
                if (!hasClass) {
                    // Ẩn hết chức năng
                    imgFlashCard.setVisibility(View.GONE);
                    imgBaitap.setVisibility(View.GONE);
                    imgTest.setVisibility(View.GONE);
                    imgVideo.setVisibility(View.GONE);
                    imgBadge.setVisibility(View.GONE);
                    imgProgress.setVisibility(View.GONE);
                    imgStreak.setVisibility(View.GONE);
                    // Show dialog đẹp
                    showNoClassDialog();
                }
            }
        });



        // Setup BottomNavigationView
        setupBottomNavigation();
    }

    private void showNoClassDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_no_class, null);
        builder.setView(dialogView);
        androidx.appcompat.app.AlertDialog dialog = builder.create();
        dialog.setCancelable(false);
        dialogView.findViewById(R.id.btnContactCenter).setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }

    private void initViews() {
        ivAvatar = findViewById(R.id.r8xjyhkhtcc); // Avatar
        tvUserName = findViewById(R.id.rlff09bfus9); // Hello, <name>
        imgFlashCard = findViewById(R.id.imgFlashCard);
        imgBaitap = findViewById(R.id.imgBaitap);
        imgTest = findViewById(R.id.imgTest);
        imgVideo = findViewById(R.id.imgVideo);
        imgBadge = findViewById(R.id.imgBadge);
        imgProgress = findViewById(R.id.imgThongke);
        imgStreak = findViewById(R.id.imgStreak);
        // Nếu muốn set tên động:
        // tvUserName.setText("Hello, " + <userName>);
        setupImageClicks();
        ivAvatar.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileDetail.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            Intent intent = null;
            if (id == R.id.nav_home) {
                // Ở lại màn hình này, có thể reload nếu muốn
                return true;
            } else if (id == R.id.nav_learn) {
                intent = new Intent(this, FlashcardLearningActivity.class);
                intent.putExtra("user_id", userId);
            } else if (id == R.id.nav_badge) {
                intent = new Intent(this, BadgesScreenActivity.class);
                intent.putExtra("user_id", userId); // Bổ sung dòng này để truyền user_id
            } else if (id == R.id.nav_setting) {
                intent = new Intent(this, SettingsActivity.class);
                intent.putExtra("user_id", userId);
            }
            if (intent != null) {
                intent.putExtra("user_email", userEmail);
                intent.putExtra("user_id", userId); // Bổ sung dòng này để truyền user_id
                startActivity(intent);
                // Optional: không giữ lại activity hiện tại
                // finish();
            }
            return true;
        });
        // Đặt mục Home được chọn mặc định
        bottomNavigationView.setSelectedItemId(R.id.nav_home);
    }

    private void setupImageClicks() {
        imgFlashCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, FlashcardLearningActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgBaitap.setOnClickListener(v -> {
            Intent intent = new Intent(this, ExerciseScreenActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgTest.setOnClickListener(v -> {
            Intent intent = new Intent(this, TestScreenActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgVideo.setOnClickListener(v -> {
            Intent intent = new Intent(this, VideoLecturesActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgBadge.setOnClickListener(v -> {
            Intent intent = new Intent(this, BadgesScreenActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgProgress.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProgressTrackingActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        imgStreak.setOnClickListener(v -> {
            Intent intent = new Intent(this, LearningStreakActivity.class);
            intent.putExtra("user_email", userEmail);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
    }
} 