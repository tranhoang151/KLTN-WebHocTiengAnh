package com.example.kltn.dialogs;

import android.app.Dialog;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;
import com.bumptech.glide.Glide;
import com.example.kltn.R;

public class BadgeAwardedDialogFragment extends DialogFragment {
    private String badgeName;
    private String badgeDesc;
    private String imageUrl;
    private OnOkClickListener okClickListener;

    public interface OnOkClickListener {
        void onOkClicked();
    }

    public static BadgeAwardedDialogFragment newInstance(String badgeName, String badgeDesc, String imageUrl) {
        BadgeAwardedDialogFragment frag = new BadgeAwardedDialogFragment();
        Bundle args = new Bundle();
        args.putString("badgeName", badgeName);
        args.putString("badgeDesc", badgeDesc);
        args.putString("imageUrl", imageUrl);
        frag.setArguments(args);
        return frag;
    }

    public void setOnOkClickListener(OnOkClickListener listener) {
        this.okClickListener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.dialog_badge_awarded, container, false);
        if (getArguments() != null) {
            badgeName = getArguments().getString("badgeName");
            badgeDesc = getArguments().getString("badgeDesc");
            imageUrl = getArguments().getString("imageUrl");
        }
        ImageView imgBadge = view.findViewById(R.id.imgBadgeDialog);
        TextView tvBadgeName = view.findViewById(R.id.tvBadgeNameDialog);
        TextView tvBadgeDesc = view.findViewById(R.id.tvBadgeDescDialog);
        Button btnOk = view.findViewById(R.id.btnOkBadgeDialog);

        tvBadgeName.setText(badgeName);
        tvBadgeDesc.setText(badgeDesc);
        if (imageUrl != null && !imageUrl.isEmpty()) {
            Glide.with(requireContext()).load(imageUrl).placeholder(R.drawable.bad1).into(imgBadge);
        } else {
            imgBadge.setImageResource(R.drawable.bad1);
        }

        btnOk.setOnClickListener(v -> {
            if (okClickListener != null) okClickListener.onOkClicked();
            dismiss();
        });
        setCancelable(false);
        return view;
    }

    @Override
    public void onStart() {
        super.onStart();
        Dialog dialog = getDialog();
        if (dialog != null && dialog.getWindow() != null) {
            dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        }
    }
} 