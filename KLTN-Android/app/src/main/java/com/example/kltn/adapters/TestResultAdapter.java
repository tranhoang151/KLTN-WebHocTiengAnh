package com.example.kltn.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.models.TestResult;
import com.example.kltn.R;
import java.util.List;

public class TestResultAdapter extends RecyclerView.Adapter<TestResultAdapter.TestResultViewHolder> {
    private List<TestResult> testResults;

    public TestResultAdapter(List<TestResult> testResults) {
        this.testResults = testResults;
    }

    @NonNull
    @Override
    public TestResultViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_test_result, parent, false);
        return new TestResultViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TestResultViewHolder holder, int position) {
        TestResult testResult = testResults.get(position);
        holder.bind(testResult);
    }

    @Override
    public int getItemCount() {
        return testResults.size();
    }

    public class TestResultViewHolder extends RecyclerView.ViewHolder {
        private TextView tvTestName, tvTestDate, tvTestDuration, tvTestScore;

        public TestResultViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTestName = itemView.findViewById(R.id.tvTestName);
            tvTestDate = itemView.findViewById(R.id.tvTestDate);
            tvTestDuration = itemView.findViewById(R.id.tvTestDuration);
            tvTestScore = itemView.findViewById(R.id.tvTestScore);
        }

        public void bind(TestResult testResult) {
            tvTestName.setText(testResult.getTestName());
            tvTestDate.setText(testResult.getDate());
            tvTestDuration.setText("Duration: " + testResult.getDuration());
            tvTestScore.setText(testResult.getScore() + "%");

            // Set score color based on performance
            if (testResult.getScore() >= 90) {
                tvTestScore.setTextColor(itemView.getContext().getColor(R.color.success_green));
            } else if (testResult.getScore() >= 80) {
                tvTestScore.setTextColor(itemView.getContext().getColor(R.color.warning_orange));
            } else {
                tvTestScore.setTextColor(itemView.getContext().getColor(R.color.error_red));
            }
        }
    }
} 