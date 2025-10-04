package com.example.kltn.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;
import android.widget.Spinner;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ArrayAdapter;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.CheckBox;
import com.google.android.material.tabs.TabLayout;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.adapters.QuestionAdapter;
import com.example.kltn.models.Question;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class QuestionBankActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private QuestionAdapter adapter;
    private List<Question> questionList;
    private ImageView fabAddQuestion;
    private EditText etSearch;
    private Spinner spinnerCourse, spinnerDifficulty;
    private String selectedCourseId = "";
    private String selectedDifficulty = "";
    private FirebaseFirestore db;
    private TabLayout tabLayout;
    private String selectedTabType = ""; // "" for all, "multiple_choice", "fill_blank"
    private List<String> courseIdList = new ArrayList<>();
    private Map<String, String> courseIdToName = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_question_bank);

        db = FirebaseFirestore.getInstance();
        initViews();
        setupTabLayout();
        setupRecyclerView(); // Khôi phục lại thứ tự ban đầu
        loadCoursesThenQuestions();
        setupClickListeners();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerView);
        fabAddQuestion = findViewById(R.id.fabAddQuestion);
        etSearch = findViewById(R.id.etSearch);
        spinnerCourse = findViewById(R.id.spinnerCourse);
        spinnerDifficulty = findViewById(R.id.spinnerDifficulty);
        ImageView btnBack = findViewById(R.id.btnBack);
        tabLayout = findViewById(R.id.tabLayout);

        // Khởi tạo questionList trước khi setup listeners
        questionList = new ArrayList<>();

        btnBack.setOnClickListener(v -> finish());

        // Setup spinners
        setupSpinners();
        
        // Setup search listener
        etSearch.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterQuestions();
            }

            @Override
            public void afterTextChanged(android.text.Editable s) {}
        });
    }

    private void setupTabLayout() {
        tabLayout.addTab(tabLayout.newTab().setText("Tất cả"));
        tabLayout.addTab(tabLayout.newTab().setText("Trắc nghiệm"));
        tabLayout.addTab(tabLayout.newTab().setText("Điền từ"));
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                switch (tab.getPosition()) {
                    case 0:
                        selectedTabType = "";
                        break;
                    case 1:
                        selectedTabType = "multiple_choice";
                        break;
                    case 2:
                        selectedTabType = "fill_blank";
                        break;
                }
                filterQuestions();
            }
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }

    private void setupSpinners() {
        // Course spinner
        loadCoursesToSpinner();

        // Difficulty spinner
        String[] difficulties = {"Tất cả độ khó", "Dễ", "Trung bình", "Khó"};
        ArrayAdapter<String> difficultyAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, difficulties);
        difficultyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDifficulty.setAdapter(difficultyAdapter);

        // Setup listeners sau khi đã load xong dữ liệu
        setupSpinnerListeners();
    }

    private void setupSpinnerListeners() {
        // Course spinner listener
        spinnerCourse.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                
                if (position >= 0 && position < courseIdList.size()) {
                    selectedCourseId = courseIdList.get(position);
                    String courseName = courseIdToName.get(selectedCourseId);
                } else {
                    selectedCourseId = "";
                }
                filterQuestions();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });

        // Difficulty spinner listener
        spinnerDifficulty.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                if (position > 0) {
                    selectedDifficulty = getDifficultyFromPosition(position);
                } else {
                    selectedDifficulty = "";
                }
                filterQuestions();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
    }

    private void loadCoursesToSpinner() {
        db.collection("courses").get().addOnSuccessListener(queryDocumentSnapshots -> {
            List<String> courseNames = new ArrayList<>();
            courseIdToName.clear();
            
            // Thêm "Tất cả khóa học" ở đầu
            courseNames.add("Tất cả khóa học");
            courseIdList.add("");
            
            // Thêm các khóa học
            for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                String name = doc.getString("name");
                String id = doc.getId();
                courseNames.add(name);
                courseIdList.add(id);
                courseIdToName.put(id, name);
            }
            
            ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, courseNames);
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinnerCourse.setAdapter(adapter);
            // Đảm bảo chọn "Tất cả khóa học" mặc định
            spinnerCourse.setSelection(0);
            selectedCourseId = "";
            if (this.adapter != null) this.adapter.notifyDataSetChanged();
        });
    }

    private String getDifficultyFromPosition(int position) {
        switch (position) {
            case 1: return "easy";
            case 2: return "medium";
            case 3: return "hard";
            default: return "";
        }
    }

    private void loadCoursesThenQuestions() {
        db.collection("courses").get().addOnSuccessListener(queryDocumentSnapshots -> {
            courseIdToName.clear();
            // Không clear courseIdList nữa vì đã được setup trong loadCoursesToSpinner
            for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                String id = doc.getId();
                String name = doc.getString("name");
                courseIdToName.put(id, name);
            }
            // Cập nhật adapter để hiển thị tên khóa học
            if (adapter != null) {
                adapter.notifyDataSetChanged();
            }
            loadQuestions();
        });
    }

    private void setupRecyclerView() {
        questionList = new ArrayList<>();
        adapter = new QuestionAdapter(questionList, this::onQuestionClick, this::onQuestionEdit, this::onQuestionDelete, courseIdToName);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(adapter);
    }

    private void setupClickListeners() {
        fabAddQuestion.setOnClickListener(v -> showAddQuestionDialog());
    }

    private void loadQuestions() {
        db.collection("questions").get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                questionList.clear();
                for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                    Question question = new Question();
                    question.setId(doc.getId());
                    question.setContent(doc.getString("content"));
                    question.setType(doc.getString("type"));
                    question.setCorrect_answer(doc.getString("correct_answer")); // Sửa từ correctAnswer thành correct_answer
                    question.setExplanation(doc.getString("explanation"));
                    question.setDifficulty(doc.getString("difficulty"));
                    question.setCourse_id(doc.getString("course_id"));
                    question.setTags((List<String>) doc.get("tags"));
                    question.setOptions((List<String>) doc.get("options"));
                    question.setCreated_by(doc.getString("created_by")); // Sửa từ createdBy thành created_by
                    question.setCreated_at(doc.contains("created_at") ? doc.getLong("created_at") : 0); // Sửa từ createdAt thành created_at
                    question.setIs_active(doc.contains("is_active") ? Boolean.TRUE.equals(doc.getBoolean("is_active")) : true); // Sửa từ isActive thành is_active
                    questionList.add(question);
                }
                // Đảm bảo selectedCourseId là "" khi khởi động
                selectedCourseId = "";
                filterQuestions();
            })
            .addOnFailureListener(e -> {
                Toast.makeText(this, "Lỗi tải dữ liệu: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            });
    }

    private void filterQuestions() {
        if (questionList == null) return;
        
        String searchQuery = etSearch.getText().toString().toLowerCase();
        List<Question> filteredList = new ArrayList<>();
        
        for (Question question : questionList) {
            String content = question.getContent();
            boolean matchesSearch = (content != null ? content.toLowerCase() : "").contains(searchQuery);
            boolean matchesCourse = selectedCourseId.isEmpty() || (question.getCourse_id() != null && question.getCourse_id().equals(selectedCourseId));
            boolean matchesDifficulty = selectedDifficulty.isEmpty() || (question.getDifficulty() != null && question.getDifficulty().equals(selectedDifficulty));
            boolean matchesTab = selectedTabType.isEmpty() || (question.getType() != null && question.getType().equals(selectedTabType));
            
            if (matchesSearch && matchesCourse && matchesDifficulty && matchesTab) {
                filteredList.add(question);
            }
        }
        if (adapter != null) {
            adapter.updateQuestions(filteredList);
        }
    }

    private void showAddQuestionDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_question, null);
        builder.setView(dialogView);

        AlertDialog dialog = builder.create();
        dialog.show();

        // Initialize views
        EditText etQuestionContent = dialogView.findViewById(R.id.etQuestionContent);
        Spinner spinnerQuestionType = dialogView.findViewById(R.id.spinnerQuestionType);
        Spinner spinnerQuestionDifficulty = dialogView.findViewById(R.id.spinnerQuestionDifficulty);
        Spinner spinnerQuestionCourse = dialogView.findViewById(R.id.spinnerQuestionCourse);
        LinearLayout containerOptions = dialogView.findViewById(R.id.containerOptions);
        EditText etCorrectAnswer = dialogView.findViewById(R.id.etCorrectAnswer);
        EditText etExplanation = dialogView.findViewById(R.id.etExplanation);
        EditText etTags = dialogView.findViewById(R.id.etTags);
        Button btnAddOption = dialogView.findViewById(R.id.btnAddOption);
        Button btnSave = dialogView.findViewById(R.id.btnSave);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);

        // Setup spinners
        setupQuestionDialogSpinners(spinnerQuestionType, spinnerQuestionDifficulty, spinnerQuestionCourse, containerOptions);

        // Add option button
        btnAddOption.setOnClickListener(v -> addOptionItem(containerOptions));

        // Save button
        btnSave.setOnClickListener(v -> {
            String content = etQuestionContent != null ? etQuestionContent.getText().toString().trim() : "";
            String type = getSelectedQuestionType(spinnerQuestionType);
            String difficulty = getSelectedQuestionDifficulty(spinnerQuestionDifficulty);
            String courseId = getSelectedQuestionCourseId(spinnerQuestionCourse);
            String correctAnswer = etCorrectAnswer != null ? etCorrectAnswer.getText().toString().trim() : "";
            String explanation = etExplanation != null ? etExplanation.getText().toString().trim() : "";
            String tags = etTags != null ? etTags.getText().toString().trim() : "";

            if (content.isEmpty()) {
                etQuestionContent.setError("Nội dung câu hỏi không được để trống");
                return;
            }

            if (correctAnswer.isEmpty()) {
                etCorrectAnswer.setError("Đáp án không được để trống");
                return;
            }

            // Get options for multiple choice
            List<String> options = new ArrayList<>();
            if (type.equals("multiple_choice")) {
                for (int i = 0; i < containerOptions.getChildCount(); i++) {
                    View optionView = containerOptions.getChildAt(i);
                    if (optionView != null) {
                        EditText etOption = optionView.findViewById(R.id.etOption);
                        if (etOption != null) {
                            String option = etOption.getText().toString().trim();
                            if (!option.isEmpty()) {
                                options.add(option);
                            }
                        }
                    }
                }
                if (options.size() < 2) {
                    Toast.makeText(this, "Cần ít nhất 2 lựa chọn cho câu hỏi trắc nghiệm", Toast.LENGTH_SHORT).show();
                    return;
                }
            }

            // Create question
            Question question = new Question();
            question.setContent(content);
            question.setType(type);
            question.setDifficulty(difficulty); // Use the difficulty selected in the dialog
            question.setCourse_id(courseId);
            question.setCorrect_answer(correctAnswer);
            question.setExplanation(explanation);
            question.setOptions(options);
            
            // Process tags
            List<String> tagsList = new ArrayList<>();
            if (!tags.isEmpty()) {
                String[] tagArray = tags.split(",");
                for (String tag : tagArray) {
                    String trimmedTag = tag.trim();
                    if (!trimmedTag.isEmpty()) {
                        tagsList.add(trimmedTag);
                    }
                }
            }
            if (tagsList.isEmpty()) {
                tagsList.add("auto_generated"); // Default tag
            }
            question.setTags(tagsList);
            
            question.setCreated_by("admin"); // Replace with actual user ID

            // Save to Firestore
            db.collection("questions").add(question)
                .addOnSuccessListener(documentReference -> {
                    question.setId(documentReference.getId());
                    questionList.add(question);
                    adapter.notifyDataSetChanged();
                    Toast.makeText(this, "Thêm câu hỏi thành công!", Toast.LENGTH_SHORT).show();
                    dialog.dismiss();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Lỗi thêm câu hỏi: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
        });

        btnCancel.setOnClickListener(v -> dialog.dismiss());
    }

    private void setupQuestionDialogSpinners(Spinner typeSpinner, Spinner difficultySpinner, Spinner courseSpinner, LinearLayout optionsContainer) {
        // Type spinner
        String[] types = {"Multiple Choice", "True/False", "Fill in the Blank", "Essay"};
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeSpinner.setAdapter(typeAdapter);

        // Difficulty spinner
        String[] difficulties = {"Dễ", "Trung bình", "Khó"};
        ArrayAdapter<String> difficultyAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, difficulties);
        difficultyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        difficultySpinner.setAdapter(difficultyAdapter);

        // Course spinner - sử dụng courseIdList đã có sẵn
        List<String> courseNames = new ArrayList<>();
        for (int i = 1; i < courseIdList.size(); i++) { // Bỏ qua "Tất cả khóa học" ở position 0
            String courseId = courseIdList.get(i);
            String courseName = courseIdToName.get(courseId);
            courseNames.add(courseName);
        }
        ArrayAdapter<String> courseAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, courseNames);
        courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        courseSpinner.setAdapter(courseAdapter);

        // Type change listener
        typeSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) { // Multiple Choice
                    optionsContainer.setVisibility(View.VISIBLE);
                } else {
                    optionsContainer.setVisibility(View.GONE);
                }
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
    }

    private String getSelectedQuestionType(Spinner spinner) {
        String selected = spinner.getSelectedItem().toString();
        switch (selected) {
            case "Multiple Choice": return "multiple_choice";
            case "True/False": return "true_false";
            case "Fill in the Blank": return "fill_blank";
            case "Essay": return "essay";
            default: return "multiple_choice";
        }
    }

    private String getSelectedQuestionDifficulty(Spinner spinner) {
        String selected = spinner.getSelectedItem().toString();
        switch (selected) {
            case "Dễ": return "easy";
            case "Trung bình": return "medium";
            case "Khó": return "hard";
            default: return "medium";
        }
    }

    private String getSelectedQuestionCourseId(Spinner spinner) {
        int position = spinner.getSelectedItemPosition();
        if (position >= 0 && position < courseIdList.size() - 1) { // -1 vì bỏ qua "Tất cả khóa học" ở position 0
            return courseIdList.get(position + 1); // +1 vì bỏ qua position 0
        }
        return "";
    }

    private void addOptionItem(LinearLayout container) {
        View optionView = getLayoutInflater().inflate(R.layout.item_question_option, container, false);
        EditText etOption = optionView.findViewById(R.id.etOption);
        ImageView btnRemoveOption = optionView.findViewById(R.id.btnRemoveOption);

        btnRemoveOption.setOnClickListener(v -> container.removeView(optionView));

        container.addView(optionView);
    }

    private void onQuestionClick(Question question) {
        db.collection("questions").document(question.getId()).get()
            .addOnSuccessListener(doc -> {
                if (doc.exists()) {
                    Question detail = new Question();
                    detail.setId(doc.getId());
                    detail.setContent(doc.getString("content"));
                    detail.setType(doc.getString("type"));
                    detail.setCorrect_answer(doc.getString("correctAnswer")); // Sửa từ correctAnswer thành correct_answer
                    detail.setExplanation(doc.getString("explanation"));
                    detail.setDifficulty(doc.getString("difficulty"));
                    detail.setCourse_id(doc.getString("course_id"));
                    detail.setTags((List<String>) doc.get("tags"));
                    detail.setOptions((List<String>) doc.get("options"));
                    detail.setCreated_by(doc.getString("created_by")); // Sửa từ createdBy thành created_by
                    detail.setCreated_at(doc.contains("created_at") ? doc.getLong("created_at") : 0); // Sửa từ createdAt thành created_at
                    detail.setIs_active(doc.contains("is_active") ? Boolean.TRUE.equals(doc.getBoolean("is_active")) : true); // Sửa từ isActive thành is_active
                    showQuestionDetailDialog(detail);
                }
            });
    }

    private void onQuestionEdit(Question question) {
        // Show edit dialog
        showEditQuestionDialog(question);
    }

    private void onQuestionDelete(Question question) {
        // Show delete confirmation
        new AlertDialog.Builder(this)
            .setTitle("Xác nhận xóa")
            .setMessage("Bạn có chắc chắn muốn xóa câu hỏi này?")
            .setPositiveButton("Xóa", (dialog, which) -> {
                db.collection("questions").document(question.getId()).delete()
                    .addOnSuccessListener(aVoid -> {
                        questionList.remove(question);
                        adapter.notifyDataSetChanged();
                        Toast.makeText(this, "Đã xóa câu hỏi", Toast.LENGTH_SHORT).show();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi xóa câu hỏi: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void showQuestionDetailDialog(Question question) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_question_detail, null);
        builder.setView(dialogView);

        TextView tvQuestionContent = dialogView.findViewById(R.id.tvQuestionContent);
        TextView tvQuestionType = dialogView.findViewById(R.id.tvQuestionType);
        TextView tvCorrectAnswer = dialogView.findViewById(R.id.tvCorrectAnswer);
        TextView tvExplanation = dialogView.findViewById(R.id.tvExplanation);
        TextView tvCourseName = dialogView.findViewById(R.id.tvCourseName);
        LinearLayout containerOptions = dialogView.findViewById(R.id.containerOptions);
        Button btnClose = dialogView.findViewById(R.id.btnClose);

        // Set text cho tất cả các trường, nếu null thì set "-"
        tvQuestionContent.setText(question.getContent() != null ? question.getContent() : "-");
        tvQuestionType.setText(getTypeDisplayName(question.getType() != null ? question.getType() : "-"));
        tvCorrectAnswer.setText(question.getCorrect_answer() != null ? question.getCorrect_answer() : "-");
        tvExplanation.setText(question.getExplanation() != null ? question.getExplanation() : "-");

        // Hiển thị tên khóa học
        String courseId = question.getCourse_id();
        if (courseId != null && !courseId.isEmpty()) {
            FirebaseFirestore.getInstance().collection("courses").document(courseId).get()
                .addOnSuccessListener(doc -> {
                    String courseName = doc.getString("name");
                    if (courseName != null && !courseName.isEmpty()) {
                        tvCourseName.setText(courseName);
                    } else {
                        tvCourseName.setText(courseId);
                    }
                })
                .addOnFailureListener(e -> tvCourseName.setText(courseId));
        } else {
            tvCourseName.setText("-");
        }

        // Reset containerOptions trước khi addView
        containerOptions.removeAllViews();
        if (question.getType() != null && question.getType().equals("multiple_choice") && question.getOptions() != null) {
            containerOptions.setVisibility(View.VISIBLE);
            // Thêm label "Các lựa chọn"
            TextView tvLabel = new TextView(this);
            tvLabel.setText("Các lựa chọn");
            tvLabel.setTextSize(14);
            tvLabel.setTextColor(getResources().getColor(R.color.black));
            tvLabel.setTypeface(null, android.graphics.Typeface.BOLD);
            tvLabel.setPadding(0, 0, 0, 8);
            containerOptions.addView(tvLabel);
            for (String option : question.getOptions()) {
                TextView tvOption = new TextView(this);
                tvOption.setText("• " + option);
                tvOption.setPadding(20, 10, 20, 10);
                containerOptions.addView(tvOption);
            }
        } else {
            containerOptions.setVisibility(View.GONE);
        }

        AlertDialog dialog = builder.create();
        btnClose.setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }

    private void showEditQuestionDialog(Question question) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_question, null);
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();

        EditText etQuestionContent = dialogView.findViewById(R.id.etQuestionContent);
        Spinner spinnerQuestionType = dialogView.findViewById(R.id.spinnerQuestionType);
        Spinner spinnerQuestionDifficulty = dialogView.findViewById(R.id.spinnerQuestionDifficulty);
        Spinner spinnerQuestionCourse = dialogView.findViewById(R.id.spinnerQuestionCourse);
        LinearLayout containerOptions = dialogView.findViewById(R.id.containerOptions);
        EditText etCorrectAnswer = dialogView.findViewById(R.id.etCorrectAnswer);
        EditText etExplanation = dialogView.findViewById(R.id.etExplanation);
        Button btnSave = dialogView.findViewById(R.id.btnSave);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);

        // Pre-fill dữ liệu
        etQuestionContent.setText(question.getContent());
        etCorrectAnswer.setText(question.getCorrect_answer());
        etExplanation.setText(question.getExplanation());

        // Setup spinner type
        String[] types = {"Multiple Choice", "True/False", "Fill in the Blank", "Essay"};
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerQuestionType.setAdapter(typeAdapter);
        int typePos = 0;
        switch (question.getType()) {
            case "multiple_choice": typePos = 0; break;
            case "true_false": typePos = 1; break;
            case "fill_blank": typePos = 2; break;
            case "essay": typePos = 3; break;
        }
        spinnerQuestionType.setSelection(typePos);

        // Setup spinner difficulty
        String[] difficulties = {"Dễ", "Trung bình", "Khó"};
        ArrayAdapter<String> difficultyAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, difficulties);
        difficultyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerQuestionDifficulty.setAdapter(difficultyAdapter);
        int diffPos = 0;
        switch (question.getDifficulty()) {
            case "easy": diffPos = 0; break;
            case "medium": diffPos = 1; break;
            case "hard": diffPos = 2; break;
        }
        spinnerQuestionDifficulty.setSelection(diffPos);

        // Setup spinner course
        db.collection("courses").get().addOnSuccessListener(courseSnapshots -> {
            List<String> courseNames = new ArrayList<>();
            final List<String> courseIds = new ArrayList<>();
            int selectedCourseIdx = 0;
            int idx = 0;
            for (QueryDocumentSnapshot doc : courseSnapshots) {
                String name = doc.getString("name");
                String id = doc.getId();
                courseNames.add(name);
                courseIds.add(id);
                if (id.equals(question.getCourse_id())) selectedCourseIdx = idx;
                idx++;
            }
            ArrayAdapter<String> courseAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, courseNames);
            courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinnerQuestionCourse.setAdapter(courseAdapter);
            spinnerQuestionCourse.setSelection(selectedCourseIdx);
            
            // Store courseIds for later use
            spinnerQuestionCourse.setTag(courseIds);
        });

        // Options (for multiple choice)
        if (question.getType() != null && question.getType().equals("multiple_choice") && question.getOptions() != null) {
            containerOptions.setVisibility(View.VISIBLE);
            containerOptions.removeAllViews();
            for (String option : question.getOptions()) {
                View optionView = getLayoutInflater().inflate(R.layout.item_question_option, containerOptions, false);
                EditText etOption = optionView.findViewById(R.id.etOption);
                etOption.setText(option);
                ImageView btnRemoveOption = optionView.findViewById(R.id.btnRemoveOption);
                btnRemoveOption.setOnClickListener(v -> containerOptions.removeView(optionView));
                containerOptions.addView(optionView);
            }
        } else {
            containerOptions.setVisibility(View.GONE);
        }

        // Type change listener
        spinnerQuestionType.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) { // Multiple Choice
                    containerOptions.setVisibility(View.VISIBLE);
                } else {
                    containerOptions.setVisibility(View.GONE);
                }
            }
            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });

        btnSave.setOnClickListener(v -> {
            String content = etQuestionContent != null ? etQuestionContent.getText().toString().trim() : "";
            String type = getSelectedQuestionType(spinnerQuestionType);
            String difficulty = getSelectedQuestionDifficulty(spinnerQuestionDifficulty);
            String correctAnswer = etCorrectAnswer != null ? etCorrectAnswer.getText().toString().trim() : "";
            String explanation = etExplanation != null ? etExplanation.getText().toString().trim() : "";
            String courseId = question.getCourse_id(); // Default to current course
            if (spinnerQuestionCourse != null && spinnerQuestionCourse.getSelectedItemPosition() >= 0) {
                List<String> courseIds = (List<String>) spinnerQuestionCourse.getTag();
                if (courseIds != null && spinnerQuestionCourse.getSelectedItemPosition() < courseIds.size()) {
                    courseId = courseIds.get(spinnerQuestionCourse.getSelectedItemPosition());
                }
            }
            List<String> options = new ArrayList<>();
            if (type.equals("multiple_choice")) {
                for (int i = 0; i < containerOptions.getChildCount(); i++) {
                    View optionView = containerOptions.getChildAt(i);
                    EditText etOption = optionView.findViewById(R.id.etOption);
                    String option = etOption.getText().toString().trim();
                    if (!option.isEmpty()) options.add(option);
                }
            }
            // Validate
            if (content.isEmpty() || correctAnswer.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập đủ nội dung và đáp án!", Toast.LENGTH_SHORT).show();
                return;
            }
            // Update Firestore
            Map<String, Object> updates = new HashMap<>();
            updates.put("content", content);
            updates.put("type", type);
            updates.put("correct_answer", correctAnswer); // Sửa từ correctAnswer thành correct_answer
            updates.put("explanation", explanation);
            updates.put("difficulty", difficulty);
            updates.put("course_id", courseId);
            updates.put("options", options);
            db.collection("questions").document(question.getId()).update(updates)
                .addOnSuccessListener(aVoid -> {
                    Toast.makeText(this, "Cập nhật thành công!", Toast.LENGTH_SHORT).show();
                    dialog.dismiss();
                    loadQuestions();
                })
                .addOnFailureListener(e -> Toast.makeText(this, "Lỗi cập nhật: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        });
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }

    private String getTypeDisplayName(String type) {
        switch (type) {
            case "multiple_choice": return "Trắc nghiệm";
            case "true_false": return "Đúng/Sai";
            case "fill_blank": return "Điền vào chỗ trống";
            case "essay": return "Tự luận";
            default: return type;
        }
    }
} 