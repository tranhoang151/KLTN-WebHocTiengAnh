package com.example.kltn.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.app.AlertDialog;
import android.view.LayoutInflater;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.Course;
import androidx.appcompat.view.menu.MenuBuilder;

import java.util.List;

public class CourseAdapter extends RecyclerView.Adapter<CourseAdapter.CourseViewHolder> {
    private List<Course> courseList;
    private Context context;
    private OnCourseActionListener listener;

    public interface OnCourseActionListener {
        void onAddClass(Course course);
        void onDeleteCourse(Course course);
        void onEditCourse(Course course);
    }

    public CourseAdapter(Context context, List<Course> courseList, OnCourseActionListener listener) {
        this.context = context;
        this.courseList = courseList;
        this.listener = listener;
    }

    public void updateData(List<Course> newList) {
        this.courseList = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CourseViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_course, parent, false);
        return new CourseViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CourseViewHolder holder, int position) {
        Course course = courseList.get(position);
        holder.bind(course);
    }

    @Override
    public int getItemCount() {
        return courseList != null ? courseList.size() : 0;
    }

    class CourseViewHolder extends RecyclerView.ViewHolder {
        private ImageView imgCourseAvatar;
        private TextView tvCourseName, tvCourseDesc;
        private ImageButton btnAddClass;

        public CourseViewHolder(@NonNull View itemView) {
            super(itemView);
            imgCourseAvatar = itemView.findViewById(R.id.imgCourseAvatar);
            tvCourseName = itemView.findViewById(R.id.tvCourseName);
            tvCourseDesc = itemView.findViewById(R.id.tvCourseDesc);
            btnAddClass = itemView.findViewById(R.id.btnAddClass);
        }

        public void bind(Course course) {
            tvCourseName.setText(course.getName());
            tvCourseDesc.setText(course.getDescription());
            if (course.getImage_url() != null && !course.getImage_url().isEmpty()) {
                Glide.with(context)
                        .load(course.getImage_url())
                        .placeholder(R.drawable.ic_course)
                        .error(R.drawable.ic_course)
                        .centerCrop()
                        .into(imgCourseAvatar);
            } else {
                imgCourseAvatar.setImageResource(R.drawable.ic_course);
            }
            if (btnAddClass != null) {
                btnAddClass.setOnClickListener(v -> {
                    // Custom dialog với icon
                    AlertDialog.Builder builder = new AlertDialog.Builder(context);
                    LayoutInflater inflater = LayoutInflater.from(context);
                    View dialogView = inflater.inflate(R.layout.dialog_course_action, null);
                    builder.setView(dialogView);
                    AlertDialog dialog = builder.create();
                    LinearLayout btnAdd = dialogView.findViewById(R.id.layoutAddClass);
                    LinearLayout btnDelete = dialogView.findViewById(R.id.layoutDeleteCourse);
                    LinearLayout btnEdit = dialogView.findViewById(R.id.layoutEditCourse);
                    btnAdd.setOnClickListener(view -> {
                        if (listener != null) listener.onAddClass(course);
                        dialog.dismiss();
                    });
                    btnDelete.setOnClickListener(view -> {
                        if (listener != null) listener.onDeleteCourse(course);
                        dialog.dismiss();
                    });
                    btnEdit.setOnClickListener(view -> {
                        if (listener != null) listener.onEditCourse(course);
                        dialog.dismiss();
                    });
                    dialog.show();
                });
            }
            // Thêm click vào card để xem chi tiết khóa học
            itemView.setOnClickListener(v -> {
                android.content.Intent intent = new android.content.Intent(context, com.example.kltn.activities.CourseDetailActivity.class);
                intent.putExtra("course_id", course.getId());
                context.startActivity(intent);
            });
        }
    }
} 