package com.example.kltn.activities;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.LinearLayout;
import android.widget.ImageView;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

public class ChangePasswordActivity extends AppCompatActivity {
    
    // UI Components
    private TextView tvTitle;
    private EditText etOldPassword;
    private EditText etNewPassword;
    private EditText etConfirmPassword;
    private LinearLayout btnChangePassword;
    private ImageView btnBack;
    
    // Current password (in real app, this would be stored securely)
    private String userId;
    private FirebaseFirestore db;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        // Lấy user_id từ Intent
        userId = getIntent().getStringExtra("user_id");
        db = FirebaseFirestore.getInstance();

        initializeViews();
        setupEventHandlers();
    }
    
    private void initializeViews() {
        tvTitle = findViewById(R.id.tvTitle);
        etOldPassword = findViewById(R.id.etOldPassword);
        etNewPassword = findViewById(R.id.etNewPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnChangePassword = findViewById(R.id.btnChangePassword);
        btnBack = findViewById(R.id.btnBack);
    }
    
    private void setupEventHandlers() {
        btnChangePassword.setOnClickListener(v -> changePassword());
        btnBack.setOnClickListener(v -> finish());
    }
    
    private void changePassword() {
        String oldPassword = etOldPassword.getText().toString();
        String newPassword = etNewPassword.getText().toString();
        String confirmPassword = etConfirmPassword.getText().toString();
        
        // Log user_id để kiểm tra
        Log.d("ChangePass", "user_id: " + userId);
        Toast.makeText(this, "user_id: " + userId, Toast.LENGTH_SHORT).show();

        // Clear previous errors
        etOldPassword.setError(null);
        etNewPassword.setError(null);
        etConfirmPassword.setError(null);
        
        // Validate input như cũ...
        if (TextUtils.isEmpty(oldPassword)) {
            etOldPassword.setError("Please enter your current password");
            etOldPassword.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(newPassword)) {
            etNewPassword.setError("Please enter a new password");
            etNewPassword.requestFocus();
            return;
        }
        if (newPassword.length() < 6) {
            etNewPassword.setError("Password must be at least 6 characters");
            etNewPassword.requestFocus();
            return;
        }
        if (newPassword.equals(oldPassword)) {
            etNewPassword.setError("New password must be different from current password");
            etNewPassword.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(confirmPassword)) {
            etConfirmPassword.setError("Please confirm your new password");
            etConfirmPassword.requestFocus();
            return;
        }
        if (!newPassword.equals(confirmPassword)) {
            etConfirmPassword.setError(getString(R.string.error_passwords_dont_match));
            etConfirmPassword.requestFocus();
            return;
        }

        // Kiểm tra mật khẩu cũ trên Firestore
        btnChangePassword.setEnabled(false);
        db.collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            Log.d("ChangePass", "Document exists: " + documentSnapshot.exists());
            if (documentSnapshot.exists()) {
                String currentPassword = documentSnapshot.getString("password");
                Log.d("ChangePass", "Current password in Firestore: " + currentPassword);
                if (!oldPassword.equals(currentPassword)) {
                    etOldPassword.setError(getString(R.string.error_old_password_incorrect));
                    etOldPassword.requestFocus();
                    btnChangePassword.setEnabled(true);
                    return;
                }
                // Đúng mật khẩu cũ, cập nhật mật khẩu mới
                db.collection("users").document(userId)
                  .update("password", newPassword)
                  .addOnSuccessListener(aVoid -> {
                      Log.d("ChangePass", "Password updated successfully for user_id: " + userId);
                      Toast.makeText(this, "Đã đổi mật khẩu Firestore cho user_id: " + userId, Toast.LENGTH_LONG).show();
                      etOldPassword.setText("");
                      etNewPassword.setText("");
                      etConfirmPassword.setText("");
                      btnChangePassword.setEnabled(true);
                      finish();
                  })
                  .addOnFailureListener(e -> {
                      Log.e("ChangePass", "Update failed: " + e.getMessage());
                      Toast.makeText(this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
                      btnChangePassword.setEnabled(true);
                  });
            } else {
                Log.e("ChangePass", "Không tìm thấy user với user_id: " + userId);
                Toast.makeText(this, "Không tìm thấy user!", Toast.LENGTH_LONG).show();
                btnChangePassword.setEnabled(true);
            }
        }).addOnFailureListener(e -> {
            Log.e("ChangePass", "Lỗi truy vấn Firestore: " + e.getMessage());
            Toast.makeText(this, "Lỗi: " + e.getMessage(), Toast.LENGTH_LONG).show();
            btnChangePassword.setEnabled(true);
        });
    }
    
    @Override
    public void onBackPressed() {
        // Check if any field has been modified
        if (!TextUtils.isEmpty(etOldPassword.getText()) ||
            !TextUtils.isEmpty(etNewPassword.getText()) ||
            !TextUtils.isEmpty(etConfirmPassword.getText())) {
            
            new android.app.AlertDialog.Builder(this)
                .setTitle("Discard Changes")
                .setMessage("Are you sure you want to discard your changes?")
                .setPositiveButton("Yes", (dialog, which) -> super.onBackPressed())
                .setNegativeButton("No", null)
                .show();
        } else {
            super.onBackPressed();
        }
    }
} 