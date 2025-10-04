package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.ActivityItem;
import com.example.kltn.R;
import java.util.List;

public class ActivityAdapter extends RecyclerView.Adapter<ActivityAdapter.ActivityViewHolder> {
    private List<ActivityItem> activities;

    public ActivityAdapter(List<ActivityItem> activities) {
        this.activities = activities;
    }

    @NonNull
    @Override
    public ActivityViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_activity_card, parent, false);
        return new ActivityViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ActivityViewHolder holder, int position) {
        ActivityItem activity = activities.get(position);
        holder.bind(activity);
    }

    @Override
    public int getItemCount() {
        return activities.size();
    }

    public class ActivityViewHolder extends RecyclerView.ViewHolder {
        private TextView tvActivityDescription, tvActivityTime;

        public ActivityViewHolder(@NonNull View itemView) {
            super(itemView);
            tvActivityDescription = itemView.findViewById(R.id.tv_description);
            tvActivityTime = itemView.findViewById(R.id.tv_time_ago);
        }

        public void bind(ActivityItem activity) {
            tvActivityDescription.setText(activity.getDescription() + " - " + activity.getTopic() + " (" + activity.getStatus() + ")");
            tvActivityTime.setText(activity.getTimeAgo());
        }
    }
} 