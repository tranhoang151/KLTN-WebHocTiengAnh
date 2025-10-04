package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.TestSet;
import com.google.android.material.imageview.ShapeableImageView;
import java.util.List;
import java.util.Random;

public class TestSetAdapter extends RecyclerView.Adapter<TestSetAdapter.VH> {
    public interface OnItemClickListener {
        void onStartClick(TestSet test);
    }
    private List<TestSet> tests;
    private OnItemClickListener listener;
    private int[] images = {R.drawable.test1, R.drawable.test2, R.drawable.test3};
    private Random random = new Random();
    public TestSetAdapter(List<TestSet> tests, OnItemClickListener listener) {
        this.tests = tests;
        this.listener = listener;
    }
    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_test_set, parent, false);
        return new VH(v);
    }
    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        TestSet test = tests.get(position);
        holder.tvTitle.setText(test.title);
        holder.tvDuration.setText("Thời gian: " + test.duration + " phút");
        holder.tvScore.setText("Điểm tối đa: " + test.maxScore);
        int imgRes = images[random.nextInt(images.length)];
        holder.imgTest.setImageResource(imgRes);
        holder.btnStart.setOnClickListener(v -> listener.onStartClick(test));
    }
    @Override
    public int getItemCount() { return tests.size(); }
    public static class VH extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDuration, tvScore, tvStart;
        LinearLayout btnStart;
        ShapeableImageView imgTest;
        public VH(View v) {
            super(v);
            tvTitle = v.findViewById(R.id.tv_beginner_title);
            tvDuration = v.findViewById(R.id.tv_beginner_time);
            tvScore = v.findViewById(R.id.tv_beginner_score);
            btnStart = v.findViewById(R.id.btn_start_beginner);
            tvStart = v.findViewById(R.id.tv_start_beginner);
            imgTest = v.findViewById(R.id.img_test1);
        }
    }
} 