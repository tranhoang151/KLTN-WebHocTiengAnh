package com.example.kltn.adapters;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.Student;

import java.util.List;

public class StudentAdapter extends RecyclerView.Adapter<StudentAdapter.ViewHolder> {
    private List<Student> students;
    private OnStudentActionListener listener;

    public interface OnStudentActionListener {
        void onStudentAction(Student student, String action);
    }

    public StudentAdapter(List<Student> students, OnStudentActionListener listener) {
        this.students = students;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_student, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Student student = students.get(position);
        holder.bind(student);
    }

    @Override
    public int getItemCount() {
        return students.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        private android.widget.ImageView ivStudentAvatar;
        private TextView tvStudentName, tvStudentGrade, tvStudentAge;
        private android.widget.ImageButton btnEditStudent;
        private TextView tvStudentEmail, tvStudentGender, tvStudentStatus;

        public ViewHolder(View itemView) {
            super(itemView);
            ivStudentAvatar = itemView.findViewById(R.id.ivStudentAvatar);
            tvStudentName = itemView.findViewById(R.id.tvStudentName);
            btnEditStudent = itemView.findViewById(R.id.btnEditStudent);
            tvStudentEmail = itemView.findViewById(R.id.tvStudentEmail);
            tvStudentGender = itemView.findViewById(R.id.tvStudentGender);
            tvStudentStatus = itemView.findViewById(R.id.tvStudentStatus);
        }

        void bind(Student student) {
            tvStudentName.setText(student.getFullName());
            tvStudentEmail.setText(student.getEmail());
            tvStudentGender.setText("Gender: " + (student.getGender() != null ? student.getGender() : "N/A"));
            // Trạng thái: đã ở lớp nào
            String status = (student.getClassIds() != null && !student.getClassIds().isEmpty()) ? "Đã có lớp" : "Chưa có lớp";
            tvStudentStatus.setText("Status: " + status);
            // Avatar: ưu tiên base64, fallback url, cuối cùng là default
            if (student.getAvatarBase64() != null && !student.getAvatarBase64().isEmpty()) {
                try {
                    byte[] decodedString = Base64.decode(student.getAvatarBase64(), Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    ivStudentAvatar.setImageBitmap(decodedByte);
                } catch (Exception e) {
                    ivStudentAvatar.setImageResource(R.drawable.user);
                }
            } else if (student.getAvatarUrl() != null && !student.getAvatarUrl().isEmpty()) {
                Glide.with(ivStudentAvatar.getContext())
                        .load(student.getAvatarUrl())
                        .placeholder(R.drawable.user)
                        .error(R.drawable.user)
                        .into(ivStudentAvatar);
            } else {
                ivStudentAvatar.setImageResource(R.drawable.user);
            }
            btnEditStudent.setOnClickListener(v -> {
                if (listener != null) listener.onStudentAction(student, "delete");
            });
        }
    }
} 