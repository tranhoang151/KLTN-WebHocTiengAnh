package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.Badge;
import com.example.kltn.R;
import java.util.List;
import com.bumptech.glide.Glide;

public class BadgeAdapter extends RecyclerView.Adapter<BadgeAdapter.ViewHolder> {
    private List<Badge> badges;

    public BadgeAdapter(List<Badge> badges) {
        this.badges = badges;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_badge, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Badge badge = badges.get(position);
        holder.tvBadgeTitle.setText(badge.getName());
        holder.tvBadgeDesc.setText(badge.getDescription());
        // Load image (nếu có imageUrl)
        if (badge.getImageUrl() != null && !badge.getImageUrl().isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(badge.getImageUrl())
                    .placeholder(R.drawable.bad1)
                    .into(holder.imgBadge);
        } else {
            holder.imgBadge.setImageResource(R.drawable.bad1);
        }
        // Hiệu ứng sáng/tối
        if (badge.isEarned()) {
            holder.imgBadge.setAlpha(1.0f);
        } else {
            holder.imgBadge.setAlpha(0.3f); // Tối màu nếu chưa đạt
        }
    }

    @Override
    public int getItemCount() {
        return badges.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgBadge;
        TextView tvBadgeTitle, tvBadgeDesc;

        public ViewHolder(View itemView) {
            super(itemView);
            imgBadge = itemView.findViewById(R.id.imgBadge);
            tvBadgeTitle = itemView.findViewById(R.id.tvBadgeTitle);
            tvBadgeDesc = itemView.findViewById(R.id.tvBadgeDesc);
        }
    }
} 