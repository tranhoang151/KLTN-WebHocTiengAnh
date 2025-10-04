package com.example.kltn.activities;

import android.os.Bundle;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.Question;
import com.example.kltn.adapters.FillBlankAdapter;
import com.example.kltn.adapters.MultipleChoiceAdapter;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class ExerciseQuestionListActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_exercise_question_list);
        String topic = getIntent().getStringExtra("topic");
        String type = getIntent().getStringExtra("type");
        String setId = getIntent().getStringExtra("set_id");
        String userId = getIntent().getStringExtra("user_id"); // Lấy userId từ intent
        TextView tvTitle = findViewById(R.id.tvTitle);
        tvTitle.setText("Chủ đề: " + topic + "\nLoại: " + type);
        RecyclerView rv = findViewById(R.id.rvQuestions);
        TextView tvQuestionCount = findViewById(R.id.tvQuestionCount);
        rv.setLayoutManager(new LinearLayoutManager(this));
        loadQuestionsFromFirestore(setId, type, rv, tvQuestionCount, userId);
    }

    private void loadQuestionsFromFirestore(String setId, String type, RecyclerView rv, TextView tvQuestionCount, String userId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("exercises").document(setId).get().addOnSuccessListener(documentSnapshot -> {
            List<Question> questions = new ArrayList<>();
            List<Map<String, Object>> questionList = (List<Map<String, Object>>) documentSnapshot.get("questions");
            if (questionList != null) {
                for (Map<String, Object> q : questionList) {
                    if ("fill_blank".equals(type)) {
                        String questionText = (String) q.get("question_text");
                        String correctAnswer = (String) q.get("correct_answer");
                        Question question = new Question();
                        question.setContent(questionText);
                        question.setCorrect_answer(correctAnswer);
                        question.setType("fill_blank");
                        question.setOptions(new ArrayList<>());
                        question.setExplanation("");
                        question.setDifficulty("easy");
                        question.setTags(new ArrayList<>());
                        question.setCourse_id("LABTsID1zvPRsVjPjhLd");
                        question.setCreated_by("admin");
                        question.setIs_active(true);
                        questions.add(question);
                    } else {
                        String questionText = (String) q.get("question_text");
                        String correctAnswer = "";
                        if (q.get("options") instanceof List) {
                            List<String> options = (List<String>) q.get("options");
                            int correctIdx = ((Number) q.get("correct_answer")).intValue();
                            correctAnswer = options.get(correctIdx);
                            Question question = new Question();
                            question.setContent(questionText);
                            question.setCorrect_answer(correctAnswer);
                            question.setType("multiple_choice");
                            question.setOptions(options);
                            question.setExplanation("");
                            question.setDifficulty("easy");
                            question.setTags(new ArrayList<>());
                            question.setCourse_id("LABTsID1zvPRsVjPjhLd");
                            question.setCreated_by("admin");
                            question.setIs_active(true);
                            questions.add(question);
                        }
                    }
                }
            }
            tvQuestionCount.setText("Question 1/" + questions.size());
            rv.addOnScrollListener(new RecyclerView.OnScrollListener() {
                @Override
                public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                    super.onScrolled(recyclerView, dx, dy);
                    LinearLayoutManager lm = (LinearLayoutManager) recyclerView.getLayoutManager();
                    int pos = lm.findFirstVisibleItemPosition();
                    tvQuestionCount.setText("Question " + (pos + 1) + "/" + questions.size());
                }
            });
            if ("fill_blank".equals(type)) {
                rv.setAdapter(new FillBlankAdapter(questions, userId, setId));
            } else {
                rv.setAdapter(new MultipleChoiceAdapter(questions, userId, setId));
            }
        });
    }
} 