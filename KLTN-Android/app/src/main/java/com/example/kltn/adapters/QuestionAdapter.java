package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.models.Question;

import java.util.List;
import java.util.Map;

public class QuestionAdapter extends RecyclerView.Adapter<QuestionAdapter.QuestionViewHolder> {

    private List<Question> questionList;
    private OnQuestionClickListener onQuestionClickListener;
    private OnQuestionEditListener onQuestionEditListener;
    private OnQuestionDeleteListener onQuestionDeleteListener;
    private Map<String, String> courseIdToName;

    public interface OnQuestionClickListener {
        void onQuestionClick(Question question);
    }

    public interface OnQuestionEditListener {
        void onQuestionEdit(Question question);
    }

    public interface OnQuestionDeleteListener {
        void onQuestionDelete(Question question);
    }

    public QuestionAdapter(List<Question> questionList, OnQuestionClickListener onQuestionClickListener,
                          OnQuestionEditListener onQuestionEditListener, OnQuestionDeleteListener onQuestionDeleteListener,
                          Map<String, String> courseIdToName) {
        this.questionList = questionList;
        this.onQuestionClickListener = onQuestionClickListener;
        this.onQuestionEditListener = onQuestionEditListener;
        this.onQuestionDeleteListener = onQuestionDeleteListener;
        this.courseIdToName = courseIdToName;
    }

    @NonNull
    @Override
    public QuestionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_question, parent, false);
        return new QuestionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull QuestionViewHolder holder, int position) {
        Question question = questionList.get(position);
        holder.bind(question);
    }

    @Override
    public int getItemCount() {
        return questionList.size();
    }

    public void updateQuestions(List<Question> newQuestions) {
        this.questionList = newQuestions;
        notifyDataSetChanged();
    }

    class QuestionViewHolder extends RecyclerView.ViewHolder {
        private TextView tvQuestionContent;
        private TextView tvQuestionType;
        private TextView tvDifficulty;
        private TextView tvCourse;
        private ImageView btnEdit;
        private ImageView btnDelete;

        public QuestionViewHolder(@NonNull View itemView) {
            super(itemView);
            tvQuestionContent = itemView.findViewById(R.id.tvQuestionContent);
            tvQuestionType = itemView.findViewById(R.id.tvQuestionType);
            tvDifficulty = itemView.findViewById(R.id.tvDifficulty);
            tvCourse = itemView.findViewById(R.id.tvCourse);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(Question question) {
            tvQuestionContent.setText(question.getContent() != null ? question.getContent() : "-");
            tvQuestionType.setText(getTypeDisplayName(question.getType()));
            tvDifficulty.setText(getDifficultyDisplayName(question.getDifficulty()));
            String courseName = courseIdToName != null ? courseIdToName.get(question.getCourse_id()) : null;
            tvCourse.setText(courseName != null ? courseName : (question.getCourse_id() != null ? question.getCourse_id() : "-"));

            // Set click listeners
            itemView.setOnClickListener(v -> {
                if (onQuestionClickListener != null) {
                    onQuestionClickListener.onQuestionClick(question);
                }
            });

            btnEdit.setOnClickListener(v -> {
                if (onQuestionEditListener != null) {
                    onQuestionEditListener.onQuestionEdit(question);
                }
            });

            btnDelete.setOnClickListener(v -> {
                if (onQuestionDeleteListener != null) {
                    onQuestionDeleteListener.onQuestionDelete(question);
                }
            });
        }

        private String getTypeDisplayName(String type) {
            if (type == null) return "-";
            switch (type) {
                case "multiple_choice": return "Trắc nghiệm";
                case "true_false": return "Đúng/Sai";
                case "fill_blank": return "Điền vào chỗ trống";
                case "essay": return "Tự luận";
                default: return type;
            }
        }

        private String getDifficultyDisplayName(String difficulty) {
            switch (difficulty) {
                case "easy": return "Dễ";
                case "medium": return "Trung bình";
                case "hard": return "Khó";
                default: return difficulty;
            }
        }
    }
} 