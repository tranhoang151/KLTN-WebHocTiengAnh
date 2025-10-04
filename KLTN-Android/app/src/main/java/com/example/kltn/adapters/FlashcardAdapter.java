package com.example.kltn.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.Flashcard;
import java.util.List;

public class FlashcardAdapter extends RecyclerView.Adapter<FlashcardAdapter.ViewHolder> {
    private List<Flashcard> flashcards;
    private Context context;
    private OnFlashcardActionListener actionListener;

    public interface OnFlashcardActionListener {
        void onEdit(Flashcard flashcard);
        void onDelete(Flashcard flashcard);
    }

    public void setOnFlashcardActionListener(OnFlashcardActionListener listener) {
        this.actionListener = listener;
    }

    public FlashcardAdapter(List<Flashcard> flashcards) {
        this.flashcards = flashcards;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        context = parent.getContext();
        View view = LayoutInflater.from(context).inflate(R.layout.item_flashcard, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Flashcard flashcard = flashcards.get(position);
        
        holder.tvCardNumber.setText("Card " + (position + 1));
        holder.tvFrontText.setText(flashcard.getFrontText());
        holder.tvBackText.setText(flashcard.getBackText());
        
        // Hiển thị câu ví dụ nếu có
        if (flashcard.getExampleSentence() != null && !flashcard.getExampleSentence().isEmpty()) {
            holder.tvExampleSentence.setText(flashcard.getExampleSentence());
        } else {
            holder.tvExampleSentence.setVisibility(View.GONE);
        }
        
        // Hiển thị hình ảnh nếu có
        if (flashcard.getImageBase64() != null && !flashcard.getImageBase64().isEmpty()) {
            // Decode base64 và hiển thị
            byte[] decodedString = android.util.Base64.decode(flashcard.getImageBase64(), android.util.Base64.DEFAULT);
            android.graphics.Bitmap decodedByte = android.graphics.BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            holder.ivFlashcardImage.setVisibility(View.VISIBLE);
            holder.ivFlashcardImage.setImageBitmap(decodedByte);
        } else if (flashcard.getImageUrl() != null && !flashcard.getImageUrl().isEmpty()) {
            holder.ivFlashcardImage.setVisibility(View.VISIBLE);
            com.bumptech.glide.Glide.with(context)
                .load(flashcard.getImageUrl())
                .placeholder(R.drawable.flashcard)
                .error(R.drawable.flashcard)
                .into(holder.ivFlashcardImage);
        } else {
            holder.ivFlashcardImage.setVisibility(View.GONE);
        }
        
        // Click listener để flip card
        holder.itemView.setOnClickListener(v -> {
            if (holder.tvBackText.getVisibility() == View.VISIBLE) {
                // Flip back to front
                holder.tvBackText.setVisibility(View.GONE);
                holder.tvExampleSentence.setVisibility(View.GONE);
                holder.tvFrontText.setVisibility(View.VISIBLE);
                if ((flashcard.getImageBase64() != null && !flashcard.getImageBase64().isEmpty()) || (flashcard.getImageUrl() != null && !flashcard.getImageUrl().isEmpty())) {
                    holder.ivFlashcardImage.setVisibility(View.VISIBLE);
                }
            } else {
                // Flip to back
                holder.tvFrontText.setVisibility(View.GONE);
                holder.ivFlashcardImage.setVisibility(View.GONE);
                holder.tvBackText.setVisibility(View.VISIBLE);
                if (flashcard.getExampleSentence() != null && !flashcard.getExampleSentence().isEmpty()) {
                    holder.tvExampleSentence.setVisibility(View.VISIBLE);
                }
            }
        });

        // Long click để hiện menu sửa/xoá
        holder.itemView.setOnLongClickListener(v -> {
            if (actionListener == null) return false;
            android.widget.PopupMenu popup = new android.widget.PopupMenu(context, v);
            popup.getMenu().add("Sửa");
            popup.getMenu().add("Xoá");
            popup.setOnMenuItemClickListener(item -> {
                if (item.getTitle().equals("Sửa")) {
                    actionListener.onEdit(flashcard);
                    return true;
                } else if (item.getTitle().equals("Xoá")) {
                    actionListener.onDelete(flashcard);
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
        return flashcards.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvCardNumber, tvFrontText, tvBackText, tvExampleSentence;
        ImageView ivFlashcardImage;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCardNumber = itemView.findViewById(R.id.tvCardNumber);
            tvFrontText = itemView.findViewById(R.id.tvFrontText);
            tvBackText = itemView.findViewById(R.id.tvBackText);
            tvExampleSentence = itemView.findViewById(R.id.tvExampleSentence);
            ivFlashcardImage = itemView.findViewById(R.id.ivFlashcardImage);
        }
    }
} 