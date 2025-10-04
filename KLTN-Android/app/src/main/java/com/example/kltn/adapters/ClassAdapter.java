package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.ClassInfo;
import com.example.kltn.R;
import java.util.List;

public class ClassAdapter extends RecyclerView.Adapter<ClassAdapter.ViewHolder> {
    private List<ClassInfo> classes;
    private OnClassActionListener listener;

    public interface OnClassActionListener {
        void onClassAction(ClassInfo classInfo, String action);
    }

    public ClassAdapter(List<ClassInfo> classes, OnClassActionListener listener) {
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
        ClassInfo classInfo = classes.get(position);
        holder.bind(classInfo);
    }

    @Override
    public int getItemCount() {
        return classes.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvClassName, tvDescription, tvCapacity, tvTeacher, tvStatus;
        Button btnEdit, btnDelete, btnToggle;

        public ViewHolder(View itemView) {
            super(itemView);
            tvClassName = itemView.findViewById(R.id.tvClassName);
            tvDescription = itemView.findViewById(R.id.tvDescription);
            tvCapacity = itemView.findViewById(R.id.tvCapacity);
            tvTeacher = itemView.findViewById(R.id.tvTeacher);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
            btnToggle = itemView.findViewById(R.id.btnToggleStatus);
        }

        void bind(ClassInfo classInfo) {
            tvClassName.setText(classInfo.getName());
            tvDescription.setText(classInfo.getDescription());
            tvCapacity.setText(classInfo.getCurrentStudents() + "/" + classInfo.getCapacity() + " students");
            tvTeacher.setText(classInfo.getTeacherName());
            tvStatus.setText(classInfo.isActive() ? "Active" : "Inactive");

            btnEdit.setOnClickListener(v -> {
                if (listener != null) listener.onClassAction(classInfo, "edit");
            });
            btnDelete.setOnClickListener(v -> {
                if (listener != null) listener.onClassAction(classInfo, "delete");
            });
            btnToggle.setOnClickListener(v -> {
                if (listener != null) listener.onClassAction(classInfo, "toggle");
            });
        }
    }
} 