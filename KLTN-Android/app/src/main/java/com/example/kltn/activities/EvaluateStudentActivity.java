package com.example.kltn.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.Student;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.ArrayList;
import java.util.List;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class EvaluateStudentActivity extends AppCompatActivity {

    private TextView tvEvaluationDate;
    private TextView tvStudentClass;
    private TextView tvStudentName;
    private ImageView ivStudentAvatar;
    private RatingBar ratingParticipation, ratingUnderstanding, ratingProgress;
    private TextView tvOverallRating;
    private EditText etComments, etScore;
    private Button btnSaveEvaluation;

    private String userId, studentName, classId, avatarUrl, teacherId;
    private float overallRating = 0f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_evaluate_student);

        // Initialize views
        tvEvaluationDate = findViewById(R.id.tvEvaluationDate);
        tvStudentClass = findViewById(R.id.tvStudentClass);
        tvStudentName = findViewById(R.id.tvStudentName);
        ivStudentAvatar = findViewById(R.id.ivStudentAvatar);
        ratingParticipation = findViewById(R.id.ratingParticipation);
        ratingUnderstanding = findViewById(R.id.ratingUnderstanding);
        ratingProgress = findViewById(R.id.ratingProgress);
        tvOverallRating = findViewById(R.id.tvOverallRating);
        etComments = findViewById(R.id.etComments);
        etScore = findViewById(R.id.etScore);
        btnSaveEvaluation = findViewById(R.id.btnSaveEvaluation);

        // Get student info from intent
        userId = getIntent().getStringExtra("user_id");
        studentName = getIntent().getStringExtra("student_name");
        String className = getIntent().getStringExtra("class_name");
        avatarUrl = getIntent().getStringExtra("avatar_url");
        String avatarBase64 = getIntent().getStringExtra("avatar_base64");
        teacherId = getIntent().getStringExtra("teacher_id");

        tvStudentName.setText(studentName != null ? studentName : "");
        tvStudentClass.setText(className != null ? className : "");
        if (avatarBase64 != null && !avatarBase64.isEmpty()) {
            try {
                byte[] decodedString = android.util.Base64.decode(avatarBase64, android.util.Base64.DEFAULT);
                android.graphics.Bitmap decodedByte = android.graphics.BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                Glide.with(this).load(decodedByte).placeholder(R.drawable.user).circleCrop().into(ivStudentAvatar);
            } catch (Exception e) {
                ivStudentAvatar.setImageResource(R.drawable.user);
            }
        } else if (avatarUrl != null && !avatarUrl.isEmpty()) {
            Glide.with(this).load(avatarUrl).placeholder(R.drawable.user).circleCrop().into(ivStudentAvatar);
        } else {
            ivStudentAvatar.setImageResource(R.drawable.user);
        }
        setCurrentDate();
        setupRatingListeners();
        btnSaveEvaluation.setOnClickListener(v -> saveEvaluation());
    }

    private void setCurrentDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault());
        String currentDate = sdf.format(new Date());
        tvEvaluationDate.setText(currentDate);
    }

    private void setupRatingListeners() {
        RatingBar.OnRatingBarChangeListener listener = (ratingBar, rating, fromUser) -> updateOverallRating();
        ratingParticipation.setOnRatingBarChangeListener(listener);
        ratingUnderstanding.setOnRatingBarChangeListener(listener);
        ratingProgress.setOnRatingBarChangeListener(listener);
    }

    private void updateOverallRating() {
        float participation = ratingParticipation.getRating();
        float understanding = ratingUnderstanding.getRating();
        float progress = ratingProgress.getRating();
        overallRating = (participation + understanding + progress) / 3f;
        // Làm tròn 1 số sau dấu phẩy
        overallRating = (float) (Math.floor(overallRating * 10) / 10.0);
        tvOverallRating.setText(String.format(Locale.getDefault(), "%.1f", overallRating));
    }

    private void saveEvaluation() {
        String comments = etComments.getText().toString().trim();
        String scoreStr = etScore.getText().toString().trim();
        int score = 0;
        try {
            score = Integer.parseInt(scoreStr);
        } catch (Exception ignored) {}
        String evaluationDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        if (userId == null || teacherId == null) {
            Toast.makeText(this, "Missing student or teacher info", Toast.LENGTH_SHORT).show();
            return;
        }
        float ratingParticipationValue = ratingParticipation.getRating();
        float ratingUnderstandingValue = ratingUnderstanding.getRating();
        float ratingProgressValue = ratingProgress.getRating();
        float roundedOverall = Math.round(overallRating * 10f) / 10f;
        Map<String, Object> data = new HashMap<>();
        data.put("evaluation_date", evaluationDate);
        data.put("overall_rating", roundedOverall);
        data.put("teacher_id", teacherId);
        data.put("comments", comments);
        data.put("score", score);
        data.put("rating_participation", ratingParticipationValue);
        data.put("rating_understanding", ratingUnderstandingValue);
        data.put("rating_progress", ratingProgressValue);
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(userId)
            .collection("evaluations")
            .add(data)
            .addOnSuccessListener(ref -> {
                Toast.makeText(this, "Evaluation saved", Toast.LENGTH_SHORT).show();
                finish(); // Quay lại màn trước (danh sách học viên)
            })
            .addOnFailureListener(e -> Toast.makeText(this, "Save failed: " + e.getMessage(), Toast.LENGTH_SHORT).show());
    }
}