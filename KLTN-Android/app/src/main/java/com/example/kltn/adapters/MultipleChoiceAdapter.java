package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.Question;
import com.example.kltn.R;
import java.util.List;
import com.example.kltn.managers.BadgeManager;
import com.google.firebase.firestore.FirebaseFirestore;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;

public class MultipleChoiceAdapter extends RecyclerView.Adapter<MultipleChoiceAdapter.VH> {
    List<Question> questions;
    private String userId;
    private String exerciseId;
    public MultipleChoiceAdapter(List<Question> q, String userId, String exerciseId) {
        questions = q;
        this.userId = userId;
        this.exerciseId = exerciseId;
    }
    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_multiple_choice_question, parent, false);
        return new VH(v);
    }
    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        Question q = questions.get(position);

        holder.tvQ.setText(q.getContent());
        holder.rg.clearCheck();
        holder.tvFeedback.setVisibility(View.GONE);
        holder.btnSubmit.setEnabled(true);
        for (int i = 0; i < 4; i++) {
            RadioButton rb = holder.rb[i];
            rb.setText(q.getOptions().get(i));
            rb.setChecked(false);
            rb.setEnabled(true);
        }
        holder.rg.setEnabled(true);
        holder.btnSubmit.setOnClickListener(v -> {
            int checkedId = holder.rg.getCheckedRadioButtonId();
            if (checkedId == -1) {
                holder.tvFeedback.setText("Vui lòng chọn đáp án!");
                holder.tvFeedback.setTextColor(0xFFD32F2F);
                holder.tvFeedback.setVisibility(View.VISIBLE);
            } else {
                RadioButton rb = holder.itemView.findViewById(checkedId);
                String ans = rb.getText().toString().trim();
                if (ans.equalsIgnoreCase(q.getCorrect_answer())) {
                    holder.tvFeedback.setText("Chính xác!");
                    holder.tvFeedback.setTextColor(0xFF388E3C);
                    holder.tvFeedback.setVisibility(View.VISIBLE);
                    holder.btnSubmit.setEnabled(false);
                    for (int i = 0; i < 4; i++) holder.rb[i].setEnabled(false);
                } else {
                    holder.tvFeedback.setText("Sai! Đáp án đúng: " + q.getCorrect_answer());
                    holder.tvFeedback.setTextColor(0xFFD32F2F);
                    holder.tvFeedback.setVisibility(View.VISIBLE);
                    holder.btnSubmit.setEnabled(false);
                    for (int i = 0; i < 4; i++) holder.rb[i].setEnabled(false);
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
            }
        });
    }
    @Override
    public int getItemCount() { return questions.size(); }
    public static class VH extends RecyclerView.ViewHolder {

        TextView tvQ, tvFeedback;
        RadioGroup rg;
        RadioButton[] rb = new RadioButton[4];
        Button btnSubmit;
        public VH(View v) {
            super(v);

            tvQ = v.findViewById(R.id.tvQuestion);
            rg = v.findViewById(R.id.rgAnswers);
            rb[0] = v.findViewById(R.id.rbAnswer1);
            rb[1] = v.findViewById(R.id.rbAnswer2);
            rb[2] = v.findViewById(R.id.rbAnswer3);
            rb[3] = v.findViewById(R.id.rbAnswer4);
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