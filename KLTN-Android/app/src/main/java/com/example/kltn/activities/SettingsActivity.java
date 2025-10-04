package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;

import android.widget.Toast;
import android.view.View;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.button.MaterialButton;

import com.bumptech.glide.Glide;
import com.google.firebase.firestore.FirebaseFirestore;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.widget.ImageView;
import android.widget.TextView;


import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;

public class SettingsActivity extends AppCompatActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        // Lấy user_id từ Intent
        String userId = getIntent().getStringExtra("user_id");

        // Ánh xạ view avatar và text
        ImageView imgAvatar = findViewById(R.id.imgSettingsAvatar);
        TextView tvLastName = findViewById(R.id.tvSettingsLastName);
        TextView tvMiddleLastName = findViewById(R.id.tvSettingsMiddleLastName);

        // Lấy thông tin user từ Firestore
        FirebaseFirestore.getInstance().collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            if (documentSnapshot.exists()) {
                String fullName = documentSnapshot.getString("full_name");
                String avatarBase64 = documentSnapshot.getString("avatar_base64");
                // Lấy last name
                String lastName = fullName != null && fullName.trim().contains(" ") ? fullName.trim().substring(fullName.trim().lastIndexOf(" ") + 1) : fullName;
                // Lấy middle + last name
                String middleLastName = "";
                if (fullName != null && fullName.trim().contains(" ")) {
                    int firstSpace = fullName.trim().indexOf(" ");
                    middleLastName = fullName.trim().substring(firstSpace + 1);
                } else {
                    middleLastName = fullName;
                }
                tvLastName.setText(lastName != null ? lastName : "");
                tvMiddleLastName.setText(middleLastName != null ? middleLastName : "");
                if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                    byte[] decodedString = Base64.decode(avatarBase64, Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    Glide.with(this).load(decodedByte).circleCrop().into(imgAvatar);
                } else {
                    imgAvatar.setImageResource(R.drawable.user);
                }
            }
        });

        MaterialCardView cardChangePassword = findViewById(R.id.card_change_password);
        cardChangePassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SettingsActivity.this, ChangePasswordActivity.class);
                intent.putExtra("user_id", userId);
                startActivity(intent);
            }
        });
        MaterialCardView cardUpdateProfile = findViewById(R.id.card_update_profile);
        cardUpdateProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SettingsActivity.this, ProfileUpdateActivity.class);
                intent.putExtra("user_id", userId); // Truyền user_id qua Intent
                startActivity(intent);
            }
        });
        MaterialButton btnLogout = findViewById(R.id.btnLogout);
        btnLogout.setOnClickListener(v -> {
            Intent intent = new Intent(SettingsActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

} 