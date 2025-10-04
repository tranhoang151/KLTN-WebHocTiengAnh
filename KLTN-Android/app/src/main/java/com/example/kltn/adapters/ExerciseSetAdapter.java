package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.ExerciseSet;
import java.util.List;

public class ExerciseSetAdapter extends RecyclerView.Adapter<ExerciseSetAdapter.SetViewHolder> {
    public interface OnItemClickListener {
        void onItemClick(ExerciseSet set);
    }

    private List<ExerciseSet> sets;
    private OnItemClickListener listener;

    public ExerciseSetAdapter(List<ExerciseSet> sets, OnItemClickListener listener) {
        this.sets = sets;
        this.listener = listener;
    }

    @NonNull
    @Override
    public SetViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_exercise_set, parent, false);
        return new SetViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull SetViewHolder holder, int position) {
        ExerciseSet set = sets.get(position);
        holder.tvTitle.setText(set.title);
        holder.tvCount.setText("Số câu hỏi: " + set.questionCount);
        holder.itemView.setOnClickListener(v -> listener.onItemClick(set));
    }

    @Override
    public int getItemCount() {
        return sets.size();
    }

    public static class SetViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvCount;
        public SetViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvSetTitle);
            tvCount = itemView.findViewById(R.id.tvSetCount);
        }
    }
} 