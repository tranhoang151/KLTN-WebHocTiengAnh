package com.example.kltn.activities;


import android.os.Bundle;
import android.content.Intent;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;



import com.example.kltn.R;


public class TestScreenActivity extends AppCompatActivity {




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test_screen);

        String userId = getIntent().getStringExtra("user_id");
        String userEmail = getIntent().getStringExtra("user_email");

        // Xử lý sự kiện khi ấn nút Start Test
        View startTestButton = findViewById(R.id.r52en8o6v33);
        startTestButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(TestScreenActivity.this,TestChoiceActivity.class);
                if (userId != null) intent.putExtra("user_id", userId);
                if (userEmail != null) intent.putExtra("user_email", userEmail);
                startActivity(intent);
            }
        });
    }
} 