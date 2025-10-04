package com.example.kltn.adapters;

import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.models.Question;
import com.example.kltn.managers.BadgeManager;
import com.google.firebase.firestore.FirebaseFirestore;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

public class FillBlankAdapter extends RecyclerView.Adapter<FillBlankAdapter.VH> {
    List<Question> questions;
    private String userId;
    private String exerciseId;
    public FillBlankAdapter(List<Question> q, String userId, String exerciseId) {
        questions = q;
        this.userId = userId;
        this.exerciseId = exerciseId;
    }
    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_fill_blank_question, parent, false);
        return new VH(v);
    }
    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        Question q = questions.get(position);

        holder.tvQ.setText(q.getContent());
        holder.etAns.setText("");
        holder.tvFeedback.setVisibility(View.GONE);
        holder.btnSubmit.setEnabled(true);
        holder.etAns.setEnabled(true);
        holder.btnSubmit.setOnClickListener(v -> {
            String ans = holder.etAns.getText().toString().trim();
            if (TextUtils.isEmpty(ans)) {
                holder.tvFeedback.setText("Vui lòng nhập đáp án!");
                holder.tvFeedback.setTextColor(0xFFD32F2F); // đỏ
                holder.tvFeedback.setVisibility(View.VISIBLE);
            } else if (ans.equalsIgnoreCase(q.getCorrect_answer())) {
                holder.tvFeedback.setText("Chính xác!");
                holder.tvFeedback.setTextColor(0xFF388E3C); // xanh
                holder.tvFeedback.setVisibility(View.VISIBLE);
                holder.btnSubmit.setEnabled(false);
                holder.etAns.setEnabled(false);
            } else {
                holder.tvFeedback.setText("Sai! Đáp án đúng: " + q.getCorrect_answer());
                holder.tvFeedback.setTextColor(0xFFD32F2F);
                holder.tvFeedback.setVisibility(View.VISIBLE);
                holder.btnSubmit.setEnabled(false);
                holder.etAns.setEnabled(false);
            }
            // Nếu là câu cuối cùng, lưu tiến độ và trao badge
            if (position == questions.size() - 1 && userId != null && exerciseId != null) {
                FirebaseFirestore db = FirebaseFirestore.getInstance();
                db.collection("users").document(userId)
                    .collection("exercises").document(exerciseId)
                    .set(new java.util.HashMap<String, Object>() {{
                        put("completed", true);
                        put("timestamp", System.currentTimeMillis());
                    }});
                BadgeManager badgeManager = new BadgeManager(userId);
                badgeManager.checkAndAwardExerciseBadge();
                badgeManager.updateLearningStreakAndCheckBadge(); // Gọi cập nhật streak học tập
                updateLearningHistory(userId); // <-- Thêm dòng này
            }
        });
    }
    @Override
    public int getItemCount() { return questions.size(); }
    public static class VH extends RecyclerView.ViewHolder {
        TextView tvQ, tvFeedback;
        EditText etAns;
        Button btnSubmit;
        public VH(View v) {
            super(v);
            tvQ = v.findViewById(R.id.tvQuestion);
            etAns = v.findViewById(R.id.etAnswer);
            btnSubmit = v.findViewById(R.id.btnSubmit);
            tvFeedback = v.findViewById(R.id.tvFeedback);
        }
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