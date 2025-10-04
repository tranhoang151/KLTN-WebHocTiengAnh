package com.example.kltn.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.activities.FlashcardDetailActivity;
import com.example.kltn.models.ContentItem;
import java.util.List;

public class FlashcardSetAdapter extends RecyclerView.Adapter<FlashcardSetAdapter.ViewHolder> {
    private List<ContentItem> flashcardSets;
    private Context context;
    private OnFlashcardSetActionListener actionListener;

    public interface OnFlashcardSetActionListener {
        void onEdit(ContentItem flashcardSet);
        void onDelete(ContentItem flashcardSet);
    }

    public void setOnFlashcardSetActionListener(OnFlashcardSetActionListener listener) {
        this.actionListener = listener;
    }

    public FlashcardSetAdapter(List<ContentItem> flashcardSets) {
        this.flashcardSets = flashcardSets;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        context = parent.getContext();
        View view = LayoutInflater.from(context).inflate(R.layout.item_flashcard_set, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ContentItem flashcardSet = flashcardSets.get(position);
        
        holder.tvTitle.setText(flashcardSet.getTitle());
        holder.tvDescription.setText(flashcardSet.getDescription());
        
        // Click listener để mở màn chi tiết
        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, FlashcardDetailActivity.class);
            intent.putExtra("flashcard_set_id", flashcardSet.getId());
            intent.putExtra("flashcard_set_title", flashcardSet.getTitle());
            intent.putExtra("flashcard_set_description", flashcardSet.getDescription());
            context.startActivity(intent);
        });

        // Long click để hiện menu sửa/xoá
        holder.itemView.setOnLongClickListener(v -> {
            if (actionListener == null) return false;
            android.widget.PopupMenu popup = new android.widget.PopupMenu(context, v);
            popup.getMenu().add("Sửa");
            popup.getMenu().add("Xoá");
            popup.setOnMenuItemClickListener(item -> {
                if (item.getTitle().equals("Sửa")) {
                    actionListener.onEdit(flashcardSet);
                    return true;
                } else if (item.getTitle().equals("Xoá")) {
                    actionListener.onDelete(flashcardSet);
                    return true;
                }
                return false;
            });
            popup.show();
            return true;
        });
    }

    @Override
    public int getItemCount() {
        return flashcardSets.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvDescription;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDescription = itemView.findViewById(R.id.tvDescription);
        }
    }
} 