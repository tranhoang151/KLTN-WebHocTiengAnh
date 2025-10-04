package com.example.kltn.fragments;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import com.example.kltn.R;
import com.example.kltn.activities.ExerciseQuestionListActivity;
import com.example.kltn.adapters.ExerciseSetAdapter;
import com.example.kltn.models.ExerciseSet;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;

public class ExerciseSetListFragment extends Fragment {
    private static final String ARG_TYPE = "type";
    private static final String ARG_USER_ID = "user_id";
    private static final String ARG_COURSE_ID = "course_id";
    private String type;
    private String userId;
    private String courseId;

    public static ExerciseSetListFragment newInstance(String type, String userId, String courseId) {
        ExerciseSetListFragment fragment = new ExerciseSetListFragment();
        Bundle args = new Bundle();
        args.putString(ARG_TYPE, type);
        args.putString(ARG_USER_ID, userId);
        args.putString(ARG_COURSE_ID, courseId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            type = getArguments().getString(ARG_TYPE);
            userId = getArguments().getString(ARG_USER_ID);
            courseId = getArguments().getString(ARG_COURSE_ID);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.fragment_exercise_set_list, container, false);
        RecyclerView rv = v.findViewById(R.id.rvExerciseSets);
        rv.setLayoutManager(new LinearLayoutManager(getContext()));
        List<ExerciseSet> sets = new ArrayList<>();
        ExerciseSetAdapter adapter = new ExerciseSetAdapter(sets, set -> {
            Intent intent = new Intent(getActivity(), ExerciseQuestionListActivity.class);
            intent.putExtra("topic", set.title);
            intent.putExtra("type", set.type);
            intent.putExtra("set_id", set.id);
            intent.putExtra("user_id", userId);
            startActivity(intent);
        });
        rv.setAdapter(adapter);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("exercises")
                .whereEqualTo("type", type)
                .whereEqualTo("course_id", courseId)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    sets.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        String id = doc.getId();
                        String title = doc.getString("title");
                        List<?> questions = (List<?>) doc.get("questions");
                        int questionCount = questions != null ? questions.size() : 0;
                        sets.add(new ExerciseSet(id, title, questionCount, type));
                    }
                    adapter.notifyDataSetChanged();
                });
        return v;
    }
}