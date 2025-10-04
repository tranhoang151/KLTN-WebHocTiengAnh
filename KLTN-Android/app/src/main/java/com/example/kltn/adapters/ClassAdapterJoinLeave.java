package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.ClassItem;
import com.example.kltn.R;
import java.util.List;

public class ClassAdapterJoinLeave extends RecyclerView.Adapter<ClassAdapterJoinLeave.ViewHolder> {
    private List<ClassItem> classes;
    private OnLeaveClickListener listener;

    public interface OnLeaveClickListener {
        void onLeaveClick(ClassItem classItem);
    }

    public ClassAdapterJoinLeave(List<ClassItem> classes, OnLeaveClickListener listener) {
        this.classes = classes;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_class_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ClassItem classItem = classes.get(position);
        holder.tvClassName.setText(classItem.getClassName());
        holder.tvDescription.setText("Code: " + classItem.getClassCode());
        holder.tvTeacher.setText(classItem.getTeacherInfo());

        holder.btnDelete.setOnClickListener(v -> {
            if (listener != null) {
                listener.onLeaveClick(classItem);
            }
        });
    }

    @Override
    public int getItemCount() {
        return classes.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvClassName, tvDescription, tvTeacher;
        Button btnDelete;

        public ViewHolder(View itemView) {
            super(itemView);
            tvClassName = itemView.findViewById(R.id.tvClassName);
            tvDescription = itemView.findViewById(R.id.tvDescription);
            tvTeacher = itemView.findViewById(R.id.tvTeacher);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }
    }
} 