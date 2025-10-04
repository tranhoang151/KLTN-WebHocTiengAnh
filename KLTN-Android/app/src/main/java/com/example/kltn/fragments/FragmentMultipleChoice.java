package com.example.kltn.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.widget.LinearLayout;

import com.example.kltn.R;
import com.example.kltn.activities.ExerciseQuestionListActivity;

public class FragmentMultipleChoice extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        LinearLayout layout = new LinearLayout(getContext());
        layout.setOrientation(LinearLayout.VERTICAL);
        String[] topics = {"Animal", "Color", "Shape"};
        int[] icons = {R.drawable.animals, R.drawable.color, R.drawable.shapes};
        int[] counts = {10, 8, 12};
        for (int i = 0; i < topics.length; i++) {
            View card = inflater.inflate(R.layout.item_topic_card, layout, false);
            card.findViewById(R.id.imgTopicIcon).setBackgroundResource(icons[i]);
            ((android.widget.TextView)card.findViewById(R.id.tvTopicName)).setText(topics[i]);
            ((android.widget.TextView)card.findViewById(R.id.tvTopicCount)).setText(counts[i] + " questions");
            int finalI = i;
            card.setOnClickListener(v -> {
                Intent intent = new Intent(getActivity(), ExerciseQuestionListActivity.class);
                intent.putExtra("topic", topics[finalI]);
                intent.putExtra("type", "Multiple choice");
                startActivity(intent);
            });
            layout.addView(card);
        }
        return layout;
    }
} 