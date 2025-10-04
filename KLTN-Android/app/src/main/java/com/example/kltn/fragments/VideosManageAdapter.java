package com.example.kltn.fragments;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.VideoLesson;
import java.util.List;

public class VideosManageAdapter extends RecyclerView.Adapter<VideosManageAdapter.ViewHolder> {
    private List<VideoLesson> videos;
    private OnVideoActionListener actionListener;
    public void setOnVideoActionListener(OnVideoActionListener listener) {
        this.actionListener = listener;
    }
    public VideosManageAdapter(List<VideoLesson> videos) {
        this.videos = videos;
    }
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_video_manage, parent, false);
        return new ViewHolder(view);
    }
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        VideoLesson v = videos.get(position);
        holder.tvTitle.setText(v.title);
        holder.tvDesc.setText(v.description);
        holder.tvDuration.setText("Duration: " + v.duration);
        holder.tvTopic.setText("Topic: " + v.topic);
        holder.itemView.setOnLongClickListener(view -> {
            if (actionListener != null) actionListener.onLongClick(v, view);
            return true;
        });
    }
    @Override
    public int getItemCount() { return videos.size(); }
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDesc, tvDuration, tvTopic;
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvVideoTitle);
            tvDesc = itemView.findViewById(R.id.tvVideoDesc);
            tvDuration = itemView.findViewById(R.id.tvVideoDuration);
            tvTopic = itemView.findViewById(R.id.tvVideoTopic);
        }
    }
    public interface OnVideoActionListener {
        void onLongClick(VideoLesson video, View anchorView);
    }
} 