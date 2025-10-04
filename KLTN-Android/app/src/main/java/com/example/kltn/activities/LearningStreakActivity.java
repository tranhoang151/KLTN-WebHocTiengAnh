package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.view.View;
import android.widget.TextView;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import java.text.SimpleDateFormat;
import java.util.*;

import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;

public class LearningStreakActivity extends AppCompatActivity {

    private Button btnContinueLearning;
    private String userEmail;
    private String userId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_learning_streak);
        
        // Get user email và userId từ intent
        userEmail = getIntent().getStringExtra("user_email");
        userId = getIntent().getStringExtra("user_id");
        
        // Initialize views
        initViews();
        
        // Lấy dữ liệu streak
        loadLearningStreakData(userId);
        
        // Setup click listeners
        setupClickListeners();
    }
    
    private void initViews() {
        btnContinueLearning = findViewById(R.id.btn_continue_learning);
    }
    
    private void setupClickListeners() {
        btnContinueLearning.setOnClickListener(v -> {
            // Chuyển về StudentHomeActivity
            Intent intent = new Intent(this, StudentHomeActivity.class);
            intent.putExtra("user_email", userEmail);
            startActivity(intent);
            // Đóng activity hiện tại để không stack lại
            finish();
        });
    }

    private void loadLearningStreakData(String userId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            if (documentSnapshot.exists()) {
                Long streak = documentSnapshot.getLong("learning_streak_count");
                Map<String, Boolean> history = (Map<String, Boolean>) documentSnapshot.get("learningHistory");
                updateStreakUI(streak, history);
            }
        });
    }

    private void updateStreakUI(Long streak, Map<String, Boolean> history) {
        TextView streakDays = findViewById(R.id.current_streak_days);
        streakDays.setText((streak != null ? streak : 0) + " Days");

        // Lấy 7 ngày gần nhất (thứ 2 -> CN tuần hiện tại)
        List<String> weekDates = getCurrentWeekDates();
        int[] circleIds = {R.id.circle_mon, R.id.circle_tue, R.id.circle_wed, R.id.circle_thu, R.id.circle_fri, R.id.circle_sat, R.id.circle_sun};

        for (int i = 0; i < 7; i++) {
            View circle = findViewById(circleIds[i]);
            String date = weekDates.get(i);
            boolean learned = history != null && Boolean.TRUE.equals(history.get(date));
            circle.setBackgroundResource(learned ? R.drawable.circle_green : R.drawable.circle_red);
        }
    }

    private List<String> getCurrentWeekDates() {
        List<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        // Đặt về thứ 2 đầu tuần
        cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        for (int i = 0; i < 7; i++) {
            dates.add(sdf.format(cal.getTime()));
            cal.add(Calendar.DATE, 1);
        }
        return dates;
    }
} 