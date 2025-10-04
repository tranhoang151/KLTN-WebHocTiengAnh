package com.example.kltn.fragments;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.PopupMenu;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.models.ContentItem;
import java.util.List;

public class TestsManageAdapter extends RecyclerView.Adapter<TestsManageAdapter.ViewHolder> {
    private List<ContentItem> tests;
    private Context context;
    private OnTestActionListener actionListener;

    public interface OnTestActionListener {
        void onEdit(ContentItem test);
        void onDelete(ContentItem test);
    }

    public void setOnTestActionListener(OnTestActionListener listener) {
        this.actionListener = listener;
    }

    public TestsManageAdapter(Context context, List<ContentItem> tests) {
        this.context = context;
        this.tests = tests;
    }
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_test_manage, parent, false);
        return new ViewHolder(view);
    }
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ContentItem test = tests.get(position);
        holder.tvTitle.setText(test.getTitle());
        holder.tvDuration.setText("Duration: " + test.getDuration() + " min");
        holder.tvMaxScore.setText("Max Score: " + test.getMaxScore());

        holder.itemView.setOnLongClickListener(v -> {
            int currentPosition = holder.getAdapterPosition();
            if (currentPosition == RecyclerView.NO_POSITION) {
                return true;
            }
            final ContentItem clickedItem = tests.get(currentPosition);

            if (actionListener == null) return false;
            PopupMenu popup = new PopupMenu(context, v);
            popup.getMenu().add("Sửa");
            popup.getMenu().add("Xoá");
            popup.setOnMenuItemClickListener(item -> {
                if (item.getTitle().equals("Sửa")) {
                    actionListener.onEdit(clickedItem);
                    return true;
                } else if (item.getTitle().equals("Xoá")) {
                    actionListener.onDelete(clickedItem);
                    return true;
                }
                return false;
            });
            popup.show();
            return true;
        });
    }
    @Override
    public int getItemCount() { return tests.size(); }
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDuration, tvMaxScore;
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTestTitle);
            tvDuration = itemView.findViewById(R.id.tvTestDuration);
            tvMaxScore = itemView.findViewById(R.id.tvTestMaxScore);
        }
    }
} 