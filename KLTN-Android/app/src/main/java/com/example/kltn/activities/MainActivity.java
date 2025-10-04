package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Redirect to LoginActivity
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
        finish();
    }
}