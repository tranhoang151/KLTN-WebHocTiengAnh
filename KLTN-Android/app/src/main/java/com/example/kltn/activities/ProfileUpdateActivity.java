package com.example.kltn.activities;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.DocumentSnapshot;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ProfileUpdateActivity extends AppCompatActivity {
    private static final int REQUEST_CODE_PICK_IMAGE = 1002;
    private ImageView profileImage;
    private EditText etName, etEmail;
    private Spinner spGender;
    private Button btnSave, btnCancel;
    private String userId;
    private String avatarBase64 = null;
    private String oldEmail = null;
    private TextView tvDisplayName, tvChangePicture, tvDisplayEmail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile_update);

        userId = getIntent().getStringExtra("user_id");
        profileImage = findViewById(R.id.profile_image);
        etName = findViewById(R.id.editTextName);
        etEmail = findViewById(R.id.editTextEmail);
        spGender = findViewById(R.id.spinnerGender);
        btnSave = findViewById(R.id.btnSave);
        btnCancel = findViewById(R.id.btnCancel);
        tvDisplayName = findViewById(R.id.tvDisplayName);
        tvChangePicture = findViewById(R.id.tvChangePicture);
        tvDisplayEmail = findViewById(R.id.tvDisplayEmail);

        // Setup gender spinner
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this, R.array.gender_array, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spGender.setAdapter(adapter);

        // Lấy thông tin user từ Firestore
        FirebaseFirestore.getInstance().collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            if (documentSnapshot.exists()) {
                String fullName = documentSnapshot.getString("full_name");
                String email = documentSnapshot.getString("email");
                String gender = documentSnapshot.getString("gender");
                String avatarBase64Firestore = documentSnapshot.getString("avatar_base64");
                oldEmail = email;
                etName.setText(fullName);
                etEmail.setText(email);
                tvDisplayName.setText(fullName);
                tvDisplayEmail.setText(email);
                if (gender != null) {
                    int pos = adapter.getPosition(gender);
                    if (pos >= 0) spGender.setSelection(pos);
                }
                if (avatarBase64Firestore != null && !avatarBase64Firestore.isEmpty()) {
                    byte[] decodedString = Base64.decode(avatarBase64Firestore, Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    Glide.with(this).load(decodedByte).circleCrop().into(profileImage);
                    avatarBase64 = avatarBase64Firestore;
                } else {
                    profileImage.setImageResource(R.drawable.user);
                }
            }
        });

        profileImage.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK);
            intent.setType("image/*");
            startActivityForResult(intent, REQUEST_CODE_PICK_IMAGE);
        });
        tvChangePicture.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK);
            intent.setType("image/*");
            startActivityForResult(intent, REQUEST_CODE_PICK_IMAGE);
        });

        btnSave.setOnClickListener(v -> attemptUpdateProfile());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void attemptUpdateProfile() {
        String newName = etName.getText().toString().trim();
        String newEmail = etEmail.getText().toString().trim();
        String newGender = spGender.getSelectedItem().toString();

        if (newName.isEmpty()) {
            etName.setError("Name is required");
            return;
        }
        if (newEmail.isEmpty()) {
            etEmail.setError("Email is required");
            return;
        }
        // Nếu email không đổi, bỏ qua check trùng
        if (newEmail.equals(oldEmail)) {
            updateProfile(newName, newEmail, newGender);
            return;
        }
        // Kiểm tra trùng email
        FirebaseFirestore.getInstance().collection("users")
            .whereEqualTo("email", newEmail)
            .get()
            .addOnSuccessListener(querySnapshot -> {
                boolean emailExists = false;
                for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
                    if (!doc.getId().equals(userId)) {
                        emailExists = true;
                        break;
                    }
                }
                if (emailExists) {
                    etEmail.setError("Email already exists!");
                } else {
                    updateProfile(newName, newEmail, newGender);
                }
            });
    }

    private void updateProfile(String name, String email, String gender) {
        FirebaseFirestore.getInstance().collection("users").document(userId)
            .update("full_name", name,
                    "email", email,
                    "gender", gender,
                    "avatar_base64", avatarBase64)
            .addOnSuccessListener(aVoid -> {
                Toast.makeText(this, "Profile updated successfully!", Toast.LENGTH_SHORT).show();
                finish();
            })
            .addOnFailureListener(e -> {
                Toast.makeText(this, "Update failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_PICK_IMAGE && resultCode == Activity.RESULT_OK && data != null) {
            Uri selectedImageUri = data.getData();
            if (selectedImageUri != null) {
                try {
                    InputStream inputStream = getContentResolver().openInputStream(selectedImageUri);
                    Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                    Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 60, baos);
                    byte[] imageBytes = baos.toByteArray();
                    int imageSizeKB = imageBytes.length / 1024;
                    if (imageSizeKB > 500) {
                        Toast.makeText(this, "Ảnh quá lớn sau nén (" + imageSizeKB + "KB). Vui lòng chọn ảnh nhỏ hơn!", Toast.LENGTH_LONG).show();
                        return;
                    }
                    // Xóa avatar cũ trước khi lưu mới
                    FirebaseFirestore.getInstance().collection("users").document(userId)
                        .update("avatar_base64", "")
                        .addOnSuccessListener(aVoid -> {
                            avatarBase64 = Base64.encodeToString(imageBytes, Base64.DEFAULT);
                            Glide.with(this).load(scaledBitmap).circleCrop().into(profileImage);
                        });
                } catch (IOException e) {
                    Toast.makeText(this, "Lỗi đọc ảnh: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }
        }
    }
} 