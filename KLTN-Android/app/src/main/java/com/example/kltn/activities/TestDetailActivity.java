package com.example.kltn.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.example.kltn.R;
import com.example.kltn.models.TestQuestion;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import android.widget.RadioButton;
import android.util.Log;
import android.os.CountDownTimer;
import android.widget.Toast;

import com.example.kltn.managers.BadgeManager;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.HashMap;

public class TestDetailActivity extends AppCompatActivity {
    private List<TestQuestion> questions = new ArrayList<>();
    private List<String> userAnswers = new ArrayList<>();
    private int currentIndex = 0;
    private TextView tvQuestionCount, tvQuestionText;
    private LinearLayout optionsLayout;
    private Button btnNext, btnPrevious, btnSubmit;
    private int score = 0;
    private TextView tvMinute, tvSecond;
    private int duration = 0;
    private CountDownTimer countDownTimer;
    private String userId;
    private String testId;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test_detail);
        // Ánh xạ view
        tvQuestionCount = findViewById(R.id.questionCount);
        tvQuestionText = findViewById(R.id.questionText);
        optionsLayout = findViewById(R.id.optionsLayout);
        btnNext = findViewById(R.id.btnNext);
        btnPrevious = findViewById(R.id.btnPrevious);
        btnSubmit = new Button(this);
        btnSubmit.setText("Nộp bài");
        btnSubmit.setBackgroundColor(0xFF5C708A);
        btnSubmit.setTextColor(0xFFFFFFFF);
        btnSubmit.setPadding(32, 16, 32, 16);
        tvMinute = findViewById(R.id.tvMinute);
        tvSecond = findViewById(R.id.tvSecond);
        // Lấy test_id
        testId = getIntent().getStringExtra("test_id");
        userId = getIntent().getStringExtra("user_id");
        if (testId == null) { finish(); return; }
        // Lấy dữ liệu bài test
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("tests").document(testId).get().addOnSuccessListener(doc -> {
            if (doc.exists()) {
                duration = doc.getLong("duration") != null ? doc.getLong("duration").intValue() : 0;
                tvMinute.setText(String.format("%02d", duration));
                tvSecond.setText("00");
                // Bắt đầu đếm ngược khi đã load xong dữ liệu
                startTimer(duration);
                List<Map<String, Object>> qs = (List<Map<String, Object>>) doc.get("questions");
                for (Map<String, Object> q : qs) {
                    Log.d("TestDetail", "question map: " + q.toString());
                    String type = q.get("type") != null ? q.get("type").toString().trim().toLowerCase() : "";
                    Log.d("TestDetail", "type raw = '" + q.get("type") + "', type parsed = '" + type + "'");
                    String question = (String) q.get("question_text");
                    String answer = "";
                    List<String> choices = null;
                    if ("multiple_choice".equals(type)) {
                        choices = (List<String>) q.get("options");
                        answer = q.get("correct_answer") != null ? q.get("correct_answer").toString() : "";
                    } else if ("fill_blank".equals(type)) {
                        answer = q.get("correct_answer") != null ? q.get("correct_answer").toString() : "";
                    }
                    questions.add(new TestQuestion(type, question, choices, answer));
                    userAnswers.add("");
                }
                showQuestion(0);
            }
        });
        btnNext.setOnClickListener(v -> {
            saveUserAnswer();
            if (currentIndex < questions.size() - 1) showQuestion(currentIndex + 1);
        });
        btnPrevious.setOnClickListener(v -> {
            saveUserAnswer();
            if (currentIndex > 0) showQuestion(currentIndex - 1);
        });
        btnSubmit.setOnClickListener(v -> {
            saveUserAnswer();
            // Kiểm tra còn đáp án bỏ trống không
            for (int i = 0; i < questions.size(); i++) {
                String ua = userAnswers.get(i) == null ? "" : userAnswers.get(i).trim();
                if (ua.isEmpty()) {
                    Toast.makeText(this, "Bạn cần trả lời tất cả các câu hỏi trước khi nộp bài", Toast.LENGTH_SHORT).show();
                    return;
                }
            }
            int correct = 0;
            for (int i = 0; i < questions.size(); i++) {
                String ua = userAnswers.get(i) == null ? "" : userAnswers.get(i).trim();
                String ans = questions.get(i).answer == null ? "" : questions.get(i).answer.trim();
                // Nếu là fill_blank thì chuẩn hóa thêm khoảng trắng
                String qType = questions.get(i).type != null ? questions.get(i).type.trim().toLowerCase() : "";
                if ("fill_blank".equals(qType)) {
                    ua = ua.replaceAll("\\s+", " ").trim();
                    ans = ans.replaceAll("\\s+", " ").trim();
                }
                if (ua.equalsIgnoreCase(ans)) correct++;
            }
            score = correct;
            showResultDialog(score, questions.size());
        });
    }
    private void showQuestion(int idx) {
        if (questions == null || questions.isEmpty() || idx < 0 || idx >= questions.size()) {
            optionsLayout.removeAllViews();
            TextView tv = new TextView(this);
            tv.setText("Không có câu hỏi nào!");
            tv.setTextColor(0xFFD32F2F);
            tv.setTextSize(18);
            optionsLayout.addView(tv);
            return;
        }
        currentIndex = idx;
        TestQuestion q = questions.get(idx);
        String type = q.type != null ? q.type.trim().toLowerCase() : "";
        Log.d("TestDetail", "[showQuestion] type = '" + type + "', question = '" + q.question + "'");
        tvQuestionCount.setText("Câu " + (idx + 1) + "/" + questions.size());
        tvQuestionText.setText(q.question != null ? q.question : "");
        optionsLayout.removeAllViews();
        if ("multiple_choice".equals(type) && q.choices != null && !q.choices.isEmpty()) {
            for (String choice : q.choices) {
                View v = getLayoutInflater().inflate(R.layout.item_test_answer, optionsLayout, false);
                RadioButton rb = v.findViewById(R.id.rbAnswer);
                EditText et = v.findViewById(R.id.etAnswer);
                rb.setVisibility(View.VISIBLE);
                et.setVisibility(View.GONE);
                rb.setText(choice);
                rb.setChecked(choice.equals(userAnswers.get(currentIndex)));
                rb.setOnClickListener(view -> {
                    for (int i = 0; i < optionsLayout.getChildCount(); i++) {
                        RadioButton r = optionsLayout.getChildAt(i).findViewById(R.id.rbAnswer);
                        if (r != null) r.setChecked(false);
                    }
                    rb.setChecked(true);
                    userAnswers.set(currentIndex, choice);
                });
                optionsLayout.addView(v);
            }
        } else if ("fill_blank".equals(type)) {
            View v = getLayoutInflater().inflate(R.layout.item_test_answer, optionsLayout, false);
            RadioButton rb = v.findViewById(R.id.rbAnswer);
            EditText et = v.findViewById(R.id.etAnswer);
            rb.setVisibility(View.GONE);
            et.setVisibility(View.VISIBLE);
            et.setText(userAnswers.get(idx));
            et.setHint("Nhập đáp án...");
            et.setOnFocusChangeListener((view, hasFocus) -> {
                if (!hasFocus) {
                    userAnswers.set(currentIndex, et.getText().toString());
                }
            });
            optionsLayout.addView(v);
        } else {
            TextView tv = new TextView(this);
            tv.setText("Không xác định được loại câu hỏi!");
            tv.setTextColor(0xFFD32F2F);
            tv.setTextSize(16);
            optionsLayout.addView(tv);
        }
        if (currentIndex == questions.size() - 1) {
            optionsLayout.addView(btnSubmit);
        }
    }
    private void saveUserAnswer() {
        TestQuestion q = questions.get(currentIndex);
        if (q == null) return;
        String type = q.type != null ? q.type.trim().toLowerCase() : "";
        if ("multiple_choice".equals(type)) {
            // Lưu đáp án đang được chọn
            for (int i = 0; i < optionsLayout.getChildCount(); i++) {
                RadioButton rb = optionsLayout.getChildAt(i).findViewById(R.id.rbAnswer);
                if (rb != null && rb.isChecked()) {
                    userAnswers.set(currentIndex, rb.getText().toString());
                    break;
                }
            }
        } else if ("fill_blank".equals(type)) {
            if (optionsLayout.getChildCount() > 0) {
                EditText et = optionsLayout.getChildAt(0).findViewById(R.id.etAnswer);
                if (et != null) {
                    userAnswers.set(currentIndex, et.getText().toString());
                }
            }
        }
    }
    private void showResultDialog(int correct, int total) {
        // Lưu tiến độ và trao badge
        if (userId != null && testId != null) {
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            db.collection("users").document(userId)
                .collection("tests").document(testId)
                .set(new java.util.HashMap<String, Object>() {{
                    put("completed", true);
                    put("score", correct);
                    put("timestamp", System.currentTimeMillis());
                }});
            BadgeManager badgeManager = new BadgeManager(userId);
            badgeManager.checkAndAwardTestBadge();
            badgeManager.updateLearningStreakAndCheckBadge();
            updateLearningHistory(userId); // <-- Thêm dòng này
        }
        androidx.appcompat.app.AlertDialog dialog = new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Kết quả bài kiểm tra")
            .setMessage("Bạn trả lời đúng " + correct + "/" + total + " câu!\nĐiểm: " + (correct * 10 / total) + "/10")
            .setPositiveButton("OK", (d, w) -> finish())
            .setCancelable(false)
            .create();
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) countDownTimer.cancel();
    }

    private void startTimer(int minutes) {
        if (countDownTimer != null) countDownTimer.cancel();
        long millis = minutes * 60L * 1000L;
        countDownTimer = new CountDownTimer(millis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                int totalSeconds = (int) (millisUntilFinished / 1000);
                int min = totalSeconds / 60;
                int sec = totalSeconds % 60;
                tvMinute.setText(String.format("%02d", min));
                tvSecond.setText(String.format("%02d", sec));
            }
            @Override
            public void onFinish() {
                tvMinute.setText("00");
                tvSecond.setText("00");
                // Tự động nộp bài khi hết giờ
                if (btnSubmit != null) btnSubmit.performClick();
            }
        };
        countDownTimer.start();
    }

    // Cập nhật learningHistory khi user học xong
    private void updateLearningHistory(String userId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        db.collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            Map<String, Boolean> history = (Map<String, Boolean>) documentSnapshot.get("learningHistory");
            if (history == null) history = new HashMap<>();
            history.put(today, true);
            db.collection("users").document(userId)
                .update("learningHistory", history);
        });
    }
} 