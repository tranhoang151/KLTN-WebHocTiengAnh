package com.example.kltn.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.TestSetAdapter;
import com.example.kltn.models.TestSet;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;

public class TestChoiceActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test_choice);
        RecyclerView rv = findViewById(R.id.rvTestList);
        rv.setLayoutManager(new LinearLayoutManager(this));
        List<TestSet> tests = new ArrayList<>();
        TestSetAdapter adapter = new TestSetAdapter(tests, test -> {
            Intent intent = new Intent(this, TestDetailActivity.class);
            intent.putExtra("test_id", test.id);
            String userId = getIntent().getStringExtra("user_id");
            if (userId != null) intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        rv.setAdapter(adapter);
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String userId = getIntent().getStringExtra("user_id");
        if (userId == null) return;
        db.collection("users").document(userId).get().addOnSuccessListener(userDoc -> {
            String classId = null;
            Object classIdsObj = userDoc.get("class_ids");
            if (classIdsObj instanceof java.util.List && !((java.util.List<?>) classIdsObj).isEmpty()) {
                classId = (String) ((java.util.List<?>) classIdsObj).get(0);
            } else {
                classId = userDoc.getString("class_id");
            }
            if (classId == null || classId.isEmpty()) return;
            db.collection("classes").document(classId).get().addOnSuccessListener(classDoc -> {
                String courseId = classDoc.getString("course_id");
                if (courseId == null || courseId.isEmpty()) return;
                db.collection("tests").whereEqualTo("course_id", courseId).get().addOnSuccessListener(queryDocumentSnapshots -> {
                    tests.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        String id = doc.getId();
                        String title = doc.getString("title");
                        int duration = doc.getLong("duration") != null ? doc.getLong("duration").intValue() : 0;
                        int maxScore = doc.getLong("maxScore") != null ? doc.getLong("maxScore").intValue() : 0;
                        String exerciseId = doc.getString("exercise_id");
                        List<?> questions = (List<?>) doc.get("questions");
                        int questionCount = questions != null ? questions.size() : 0;
                        tests.add(new TestSet(id, title, duration, maxScore, exerciseId, questionCount));
                    }
                    adapter.notifyDataSetChanged();
                });
            });
        });
    }
}