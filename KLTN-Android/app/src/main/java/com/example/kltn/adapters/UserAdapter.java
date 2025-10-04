package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.User;
import com.example.kltn.R;
import java.util.List;
import android.util.Base64;
import com.bumptech.glide.Glide;
import android.widget.ImageView;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

public class UserAdapter extends RecyclerView.Adapter<UserAdapter.ViewHolder> {
    private List<User> users;
    private OnUserActionListener listener;

    public interface OnUserActionListener {
        void onUserAction(User user, String action);
    }

    public UserAdapter(List<User> users, OnUserActionListener listener) {
        this.users = users;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_user, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        User user = users.get(position);
        holder.tvUserName.setText(user.getFull_name());
        holder.tvUserEmail.setText(user.getEmail()); // Hiển thị email
        // Hiển thị vai trò tiếng Việt
        String role = user.getRole();
        if (role != null) {
            if (role.equals("teacher")) {
                holder.tvUserRole.setText("Giáo viên");
            } else if (role.equals("student")) {
                holder.tvUserRole.setText("Học sinh");
            } else {
                holder.tvUserRole.setText(role);
            }
        } else {
            holder.tvUserRole.setText("");
        }
        // Hiển thị avatar
        String avatarBase64 = user.getAvatar_base64();
        String avatarUrl = user.getAvatar_url();
        boolean loaded = false;
        if (avatarBase64 != null && !avatarBase64.isEmpty()) {
            try {
                byte[] decodedString = Base64.decode(avatarBase64, Base64.DEFAULT);
                if (decodedString != null && decodedString.length > 0) {
                    Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    if (bitmap != null) {
                        Glide.with(holder.itemView.getContext()).load(bitmap).circleCrop().into(holder.ivUserAvatar);
                        loaded = true;
                    }
                }
            } catch (Exception e) {
                // ignore
            }
        }
        if (!loaded && avatarUrl != null && !avatarUrl.isEmpty()) {
            try {
                Glide.with(holder.itemView.getContext()).load(avatarUrl).circleCrop().into(holder.ivUserAvatar);
                loaded = true;
            } catch (Exception e) {
                // ignore
            }
        }
        if (!loaded) {
            holder.ivUserAvatar.setImageResource(R.drawable.user);
        }


        holder.btnEdit.setOnClickListener(v -> {
                if (listener != null) listener.onUserAction(user, "edit");
            });
    }

    @Override
    public int getItemCount() {
        return users.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvUserName, tvUserRole, tvUserEmail;
        ImageButton btnEdit;
        ImageView ivUserAvatar;

        public ViewHolder(View itemView) {
            super(itemView);
            tvUserName = itemView.findViewById(R.id.tvUserName);
            tvUserRole = itemView.findViewById(R.id.tvUserRole);
            tvUserEmail = itemView.findViewById(R.id.tvUserEmail);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            ivUserAvatar = itemView.findViewById(R.id.ivUserAvatar);
        }

    }
} 