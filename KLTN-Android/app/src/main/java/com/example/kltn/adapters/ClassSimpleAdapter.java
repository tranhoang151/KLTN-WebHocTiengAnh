package com.example.kltn.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.models.ClassInfo;

import java.util.List;

public class ClassSimpleAdapter extends RecyclerView.Adapter<ClassSimpleAdapter.ViewHolder> {
    
    private List<ClassInfo> classList;
    private Context context;
    private OnClassClickListener listener;
    
    public interface OnClassClickListener {
        void onClassClick(ClassInfo classInfo);
        void onEditClick(ClassInfo classInfo);
    }
    
    public ClassSimpleAdapter(Context context, List<ClassInfo> classList, OnClassClickListener listener) {
        this.context = context;
        this.classList = classList;
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_class_simple, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ClassInfo classInfo = classList.get(position);
        
        holder.tvClassName.setText(classInfo.getName());
        holder.tvClassInfo.setText(classInfo.getStudentInfo());
        
        // Set click listeners
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onClassClick(classInfo);
            }
        });
        
        holder.btnEdit.setOnClickListener(v -> {
            if (listener != null) {
                listener.onEditClick(classInfo);
            }
        });

        if (holder.tvCreatedOn != null) {
            holder.tvCreatedOn.setText("Created on: " + classInfo.getFormattedCreationDate());
        }
    }
    
    @Override
    public int getItemCount() {
        return classList.size();
    }
    
    public void updateData(List<ClassInfo> newClassList) {
        this.classList = newClassList;
        notifyDataSetChanged();
    }
    
    public void filterData(List<ClassInfo> filteredList) {
        this.classList = filteredList;
        notifyDataSetChanged();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvClassName;
        TextView tvClassInfo;
        ImageButton btnEdit;
        TextView tvCreatedOn; // Added for creation date
        
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvClassName = itemView.findViewById(R.id.tv_class_name);
            tvClassInfo = itemView.findViewById(R.id.tv_class_info);
            btnEdit = itemView.findViewById(R.id.btn_edit);
            tvCreatedOn = itemView.findViewById(R.id.tv_created_on); // Bỏ comment để hiển thị ngày tạo
        }
    }
} 