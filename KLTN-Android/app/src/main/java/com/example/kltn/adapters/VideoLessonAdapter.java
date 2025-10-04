package com.example.kltn.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.VideoLesson;
import com.google.android.material.imageview.ShapeableImageView;
import java.util.List;
import java.util.Random;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class VideoLessonAdapter extends RecyclerView.Adapter<VideoLessonAdapter.VH> {
    public interface OnItemClickListener {
        void onVideoClick(VideoLesson video);
    }
    private List<VideoLesson> videos;
    private OnItemClickListener listener;
    private Context context;
    private int[] images = {R.drawable.video1, R.drawable.video2, R.drawable.video3};
    private Random random = new Random();
    public VideoLessonAdapter(Context context, List<VideoLesson> videos, OnItemClickListener listener) {
        this.context = context;
        this.videos = videos;
        this.listener = listener;
    }
    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_video_lesson, parent, false);
        return new VH(v);
    }
    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        VideoLesson video = videos.get(position);
        holder.tvTitle.setText(video.title);
        holder.tvDesc.setText(video.description);
        holder.tvDuration.setText("Duration: " + video.duration);
        holder.tvTopic.setText("Topic: " + video.topic);
        // Load thumbnail
        if (video.thumbnailUrl != null && !video.thumbnailUrl.isEmpty()) {
            Glide.with(context).load(video.thumbnailUrl).placeholder(images[random.nextInt(images.length)]).into(holder.imgThumb);
        } else {
            int imgRes = images[random.nextInt(images.length)];
            holder.imgThumb.setImageResource(imgRes);
        }
        holder.itemView.setOnClickListener(v -> listener.onVideoClick(video));
    }
    @Override
    public int getItemCount() { return videos.size(); }
    public static class VH extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDesc, tvDuration, tvTopic;
        ShapeableImageView imgThumb;
        public VH(View v) {
            super(v);
            tvTitle = v.findViewById(R.id.tvVideoTitle);
            tvDesc = v.findViewById(R.id.tvVideoDesc);
            tvDuration = v.findViewById(R.id.tvVideoDuration);
            tvTopic = v.findViewById(R.id.tvVideoTopic);
            imgThumb = v.findViewById(R.id.imgVideoThumb);
        }
    }
} 