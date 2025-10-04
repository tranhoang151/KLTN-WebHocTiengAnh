package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;
import com.example.kltn.managers.BadgeManager;
import com.example.kltn.models.User;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

public class LoginActivity extends AppCompatActivity {


    // UI Components
    private EditText etEmail, etPassword;
    private ProgressBar progressBar;
    private Button btnLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize UI components
        initViews();
        setupClickListeners();
        setupBackPressHandler();

    }


    private void initViews() {
        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);
        // Xóa tham chiếu đến tvForgotPassword
        // tvForgotPassword = findViewById(R.id.tv_forgot_password);
    }

    private void setupClickListeners() {
        // Login button click listener
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                attemptLogin();
            }
        });


    }

    private void setupBackPressHandler() {
        // Handle back press for Android API 33+
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Prevent going back from login screen
                moveTaskToBack(true);
            }
        });
    }

    private void attemptLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Email is required");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Password is required");
            return;
        }

        showLoading(true);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users")
                .whereEqualTo("email", email)
                .get()
                .addOnCompleteListener(task -> {
                    showLoading(false);
                    if (task.isSuccessful() && task.getResult() != null && !task.getResult().isEmpty()) {
                        DocumentSnapshot document = task.getResult().getDocuments().get(0);
                        User user = document.toObject(User.class);
                        if (user != null && password.equals(user.getPassword())) {
                            navigateToHome(user);
                        } else {
                            Toast.makeText(LoginActivity.this, "Sai mật khẩu.", Toast.LENGTH_LONG).show();
                        }
                    } else {
                        Toast.makeText(LoginActivity.this, "Không tìm thấy tài khoản.", Toast.LENGTH_LONG).show();
                    }
                })
                .addOnFailureListener(e -> {
                    showLoading(false);
                    Toast.makeText(LoginActivity.this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }

    private void navigateToHome(User user) {
        String userId = user.getUser_id();
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        com.google.firebase.firestore.DocumentReference userRef = db.collection("users").document(userId);
        String today = getTodayString();
        userRef.get().addOnSuccessListener(documentSnapshot -> {
            String lastLogin = documentSnapshot.getString("last_login_date");
            Long streak = documentSnapshot.getLong("streak_count");
            long streakCount = (streak != null) ? streak : 0;

            long newStreakCount;
            if (lastLogin != null && isYesterday(lastLogin, today)) {
                newStreakCount = streakCount + 1;
            } else if (lastLogin != null && isToday(lastLogin, today)) {
                newStreakCount = streakCount; // Đã login hôm nay, không tăng
            } else {
                newStreakCount = 1;
            }

            java.util.Map<String, Object> update = new java.util.HashMap<>();
            update.put("last_login_date", today);
            update.put("streak_count", newStreakCount);
            userRef.update(update);

            // Nếu đủ 3 ngày liên tiếp, trao badge (không show dialog)
            if (newStreakCount >= 3) {
                BadgeManager badgeManager = new BadgeManager(userId);
                badgeManager.checkAndAwardLoginStreakBadge((int) newStreakCount);
            }

            goToHome(user);
        });
    }

    private void goToHome(User user) {
        Intent intent;
        String role = user.getRole();
        if ("student".equalsIgnoreCase(role)) {
            intent = new Intent(LoginActivity.this, StudentHomeActivity.class);
        } else if ("teacher".equalsIgnoreCase(role)) {
            intent = new Intent(LoginActivity.this, TeacherDashboardActivity.class);
        } else if ("admin".equalsIgnoreCase(role)) {
            intent = new Intent(LoginActivity.this, AdminDashboardActivity.class);
        } else {
            intent = new Intent(LoginActivity.this, StudentHomeActivity.class);
        }
        intent.putExtra("user_email", user.getEmail());
        intent.putExtra("user_id", user.getUser_id());
        intent.putExtra("full_name", user.getFull_name());
        intent.putExtra("role", user.getRole());
        startActivity(intent);
        finish();
    }

    private void showLoading(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        progressBar.setVisibility(View.GONE);
        btnLogin.setEnabled(!show);
        etEmail.setEnabled(!show);
        etPassword.setEnabled(!show);
    }


    private long getTodayEpochMillis() {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        cal.set(java.util.Calendar.MILLISECOND, 0);
        return cal.getTimeInMillis();
    }

    private boolean isYesterday(long lastLogin, long today) {
        return (today - lastLogin) == 86400000L;
    }

    private boolean isToday(long lastLogin, long today) {
        return today == lastLogin;
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


}