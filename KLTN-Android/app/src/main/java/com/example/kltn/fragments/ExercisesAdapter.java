package com.example.kltn.fragments;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.ContentItem;
import java.util.List;

public class ExercisesAdapter extends RecyclerView.Adapter<ExercisesAdapter.ViewHolder> {
    private List<ContentItem> exercises;
    private OnExerciseActionListener actionListener;

    public interface OnExerciseActionListener {
        void onEdit(ContentItem exercise);
        void onDelete(ContentItem exercise);
    }

    public void setOnExerciseActionListener(OnExerciseActionListener listener) {
        this.actionListener = listener;
    }

    public ExercisesAdapter(List<ContentItem> exercises) {
        this.exercises = exercises;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_exercise, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ContentItem item = exercises.get(position);
        holder.tvTitle.setText(item.getTitle());
        holder.tvDescription.setText("Type: " + item.getDescription());
        // Long click để hiện menu sửa/xoá
        holder.itemView.setOnLongClickListener(v -> {
            if (actionListener == null) return false;
            android.widget.PopupMenu popup = new android.widget.PopupMenu(holder.itemView.getContext(), v);
            popup.getMenu().add("Sửa");
            popup.getMenu().add("Xoá");
            popup.setOnMenuItemClickListener(itemMenu -> {
                if (itemMenu.getTitle().equals("Sửa")) {
                    actionListener.onEdit(item);
                    return true;
                } else if (itemMenu.getTitle().equals("Xoá")) {
                    actionListener.onDelete(item);
                    return true;
                }
                return false;
            });
            popup.show();
            return true;
        });
    }

    @Override
    public int getItemCount() {
        return exercises.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDescription;
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvExerciseTitle);
            tvDescription = itemView.findViewById(R.id.tvExerciseDescription);
        }
    }
} 