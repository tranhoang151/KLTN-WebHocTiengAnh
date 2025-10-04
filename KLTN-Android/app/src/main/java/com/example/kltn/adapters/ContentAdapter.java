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
import com.example.kltn.models.ContentItem;

import java.util.List;

public class ContentAdapter extends RecyclerView.Adapter<ContentAdapter.ContentViewHolder> {

    private List<ContentItem> contentList;
    private Context context;
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(ContentItem item);
        void onEditClick(ContentItem item);
        void onDeleteClick(ContentItem item);
    }

    public ContentAdapter(Context context, List<ContentItem> contentList) {
        this.context = context;
        this.contentList = contentList;
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void updateData(List<ContentItem> newList) {
        this.contentList = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ContentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_content, parent, false);
        return new ContentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ContentViewHolder holder, int position) {
        ContentItem item = contentList.get(position);
        holder.bind(item);
    }

    @Override
    public int getItemCount() {
        return contentList != null ? contentList.size() : 0;
    }

    class ContentViewHolder extends RecyclerView.ViewHolder {
        private ImageView ivContent, btnEdit;
        private TextView tvTitle, tvDescription;

        public ContentViewHolder(@NonNull View itemView) {
            super(itemView);
            ivContent = itemView.findViewById(R.id.ivContent);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvDescription = itemView.findViewById(R.id.tvDescription);
        }

        public void bind(ContentItem item) {
            tvTitle.setText(item.getTitle());
            tvDescription.setText(item.getDescription());

            // Load image using Glide
            if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                Glide.with(context)
                        .load(item.getImageUrl())
                        .placeholder(R.drawable.content1) // Default placeholder
                        .error(R.drawable.content1) // Error placeholder
                        .centerCrop()
                        .into(ivContent);
            } else {
                // Use default drawable based on type
                int defaultDrawable = getDefaultDrawable(item.getType());
                ivContent.setImageResource(defaultDrawable);
            }

            // Set click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onItemClick(item);
                }
            });

            btnEdit.setOnClickListener(v -> {
                showEditDeletePopup(v, item);
            });
        }

        private int getDefaultDrawable(String type) {
            if ("flashcard".equals(type)) {
                // Return different drawables for flashcards
                switch (getAdapterPosition() % 4) {
                    case 0: return R.drawable.content1;
                    case 1: return R.drawable.content2;
                    case 2: return R.drawable.content3;
                    case 3: return R.drawable.content4;
                    default: return R.drawable.content1;
                }
            } else {
                // Return different drawables for tests
                switch (getAdapterPosition() % 3) {
                    case 0: return R.drawable.test1;
                    case 1: return R.drawable.test2;
                    case 2: return R.drawable.test3;
                    default: return R.drawable.test1;
                }
            }
        }

        private void showEditDeletePopup(View anchorView, ContentItem item) {
            android.widget.PopupWindow popupWindow = new android.widget.PopupWindow(context);
            
            // Inflate popup layout
            View popupView = LayoutInflater.from(context).inflate(R.layout.popup_edit_delete, null);
            popupWindow.setContentView(popupView);
            
            // Set popup properties
            popupWindow.setWidth(android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
            popupWindow.setHeight(android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
            popupWindow.setFocusable(true);
            popupWindow.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
            popupWindow.setElevation(8f);
            
            // Set click listeners
            View btnEdit = popupView.findViewById(R.id.btnEdit);
            View btnDelete = popupView.findViewById(R.id.btnDelete);
            
            btnEdit.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onEditClick(item);
                }
                popupWindow.dismiss();
            });
            
            btnDelete.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onDeleteClick(item);
                }
                popupWindow.dismiss();
            });
            
            // Show popup
            popupWindow.showAsDropDown(anchorView, 0, 0);
        }
    }
} 