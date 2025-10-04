package com.example.kltn.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.models.ContentItem;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ExercisesFragment extends Fragment {
    private ContentItem currentEditingExercise = null;
    private RecyclerView recyclerView;
    private ExercisesAdapter adapter;
    private List<ContentItem> exercises = new ArrayList<>();
    private String courseId = "";
    private String searchQuery = "";

    public void setCourseId(String courseId) {
        this.courseId = courseId;
        loadExercises();
    }

    public void setSearchQuery(String query) {
        this.searchQuery = query == null ? "" : query.trim().toLowerCase();
        filterAndShow();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_exercises, container, false);
        recyclerView = view.findViewById(R.id.rvExercises);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new ExercisesAdapter(exercises);
        recyclerView.setAdapter(adapter);
        loadExercises();

        // Đăng ký callback cho Adapter
        adapter.setOnExerciseActionListener(new ExercisesAdapter.OnExerciseActionListener() {
            @Override
            public void onEdit(ContentItem exercise) {
                showAddEditExerciseDialog(exercise);
            }

            @Override
            public void onDelete(ContentItem exercise) {
                confirmDeleteExercise(exercise);
            }
        });

        // Bắt sự kiện click nút thêm mới
        com.google.android.material.floatingactionbutton.FloatingActionButton fabAdd = view.findViewById(R.id.fabAddExercise);
        fabAdd.setOnClickListener(v -> showAddEditExerciseDialog(null));

        return view;
    }

    // --- Biến lưu câu hỏi đã chọn, giống TestsFragment ---
    private List<String> selectedQuestionIds = new ArrayList<>();
    private java.util.Map<String, String> selectedIdToTitle = new java.util.HashMap<>();
    private java.util.Map<String, java.util.Map<String, Object>> selectedIdToQuestionObj = new java.util.HashMap<>();
    private Runnable updateSelectedQuestionsView;

    // --- Hàm mở dialog thêm/sửa bài tập, giống TestsFragment ---
    public void showAddEditExerciseDialog(@Nullable ContentItem exercise) {
        currentEditingExercise = exercise;
        selectedQuestionIds.clear();
        selectedIdToTitle.clear();
        selectedIdToQuestionObj.clear();
        // Nếu đang sửa exercise, chỉ lấy các câu hỏi thuộc exercise đó
        if (exercise != null && exercise.getQuestions() != null) {
            for (Map<String, Object> q : exercise.getQuestions()) {
                String qId = q.get("id") != null ? q.get("id").toString() : null;
                if (qId != null) {
                    selectedQuestionIds.add(qId);
                    String title = q.get("content") != null ? q.get("content").toString() : (q.get("question_text") != null ? q.get("question_text").toString() : "");
                    selectedIdToTitle.put(qId, title);
                    selectedIdToQuestionObj.put(qId, q);
                }
            }
        }
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_add_edit_exercise, null);
        builder.setView(dialogView);
        android.app.AlertDialog dialog = builder.create();

        android.widget.EditText etTitle = dialogView.findViewById(R.id.etExerciseTitle);
        android.widget.Spinner spinnerKind = dialogView.findViewById(R.id.spinnerKind);
        android.widget.Spinner spinnerCourse = dialogView.findViewById(R.id.spinnerCourse);
        android.widget.Button btnPickQuestions = dialogView.findViewById(R.id.btnPickQuestions);
        android.widget.LinearLayout containerSelectedQuestions = dialogView.findViewById(R.id.containerSelectedQuestions);
        android.widget.Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        android.widget.Button btnSave = dialogView.findViewById(R.id.btnSave);
        updateSelectedQuestionsView = () -> {
            android.util.Log.d("DEBUG_EX_SELECTED", "selectedQuestionIds: " + selectedQuestionIds);
            android.util.Log.d("DEBUG_EX_SELECTED", "selectedIdToTitle: " + selectedIdToTitle);
            containerSelectedQuestions.removeAllViews();
            for (String qid : new java.util.ArrayList<>(selectedQuestionIds)) {
                android.widget.LinearLayout row = new android.widget.LinearLayout(getContext());
                row.setOrientation(android.widget.LinearLayout.VERTICAL);
                row.setPadding(0, 0, 0, 16);
                android.widget.TextView tvQuestion = new android.widget.TextView(getContext());
                String title = selectedIdToTitle.get(qid);
                tvQuestion.setText("Câu hỏi: " + (title != null ? title : qid));
                tvQuestion.setPadding(8, 8, 8, 4);
                android.widget.LinearLayout answerRow = new android.widget.LinearLayout(getContext());
                answerRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
                answerRow.setGravity(android.view.Gravity.CENTER_VERTICAL);
                android.widget.TextView tvAnswer = new android.widget.TextView(getContext());
                String answer = "";
                java.util.Map<String, Object> qObj = selectedIdToQuestionObj.get(qid);
                if (qObj != null) {
                    Object typeObj = qObj.get("type");
                    String type = (typeObj != null) ? String.valueOf(typeObj) : null;
                    Object ansObj = qObj.get("correct_answer");
                    if (ansObj == null) ansObj = qObj.get("correctAnswer");
                    if ("multiple_choice".equals(type) && ansObj instanceof Number && qObj.get("options") instanceof java.util.List) {
                        java.util.List options = (java.util.List) qObj.get("options");
                        int idx = ((Number) ansObj).intValue();
                        if (idx >= 0 && idx < options.size()) {
                            answer = String.valueOf(options.get(idx));
                        } else {
                            answer = "(Chỉ số đáp án không hợp lệ)";
                        }
                    } else if (ansObj != null) {
                        answer = String.valueOf(ansObj);
                    }
                }
                tvAnswer.setText("Đáp án: " + (answer != null ? answer : ""));
                tvAnswer.setTypeface(null, android.graphics.Typeface.BOLD);
                tvAnswer.setPadding(8, 0, 8, 8);
                android.widget.ImageButton btnDelete = new android.widget.ImageButton(getContext());
                btnDelete.setImageResource(android.R.drawable.ic_menu_delete);
                btnDelete.setBackgroundColor(android.graphics.Color.TRANSPARENT);
                btnDelete.setOnClickListener(v -> {
                    selectedQuestionIds.remove(qid);
                    selectedIdToTitle.remove(qid);
                    selectedIdToQuestionObj.remove(qid);
                    updateSelectedQuestionsView.run();
                });
                android.widget.LinearLayout.LayoutParams delParams = new android.widget.LinearLayout.LayoutParams(
                        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
                delParams.weight = 0;
                delParams.leftMargin = 16;
                btnDelete.setLayoutParams(delParams);
                answerRow.addView(tvAnswer);
                answerRow.addView(btnDelete);
                row.addView(tvQuestion);
                row.addView(answerRow);
                containerSelectedQuestions.addView(row);
            }
        };
        // Load kind
        String[] kinds = {"fill_blank", "multiple_choice"};
        android.widget.ArrayAdapter<String> kindAdapter = new android.widget.ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, kinds);
        kindAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerKind.setAdapter(kindAdapter);
        // Load courses
        java.util.List<String> courseNames = new java.util.ArrayList<>();
        java.util.List<String> courseIds = new java.util.ArrayList<>();
        com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("courses").get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    for (com.google.firebase.firestore.QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        courseNames.add(doc.getString("name"));
                        courseIds.add(doc.getId());
                    }
                    android.widget.ArrayAdapter<String> courseAdapter = new android.widget.ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseNames);
                    courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    spinnerCourse.setAdapter(courseAdapter);
                    if (exercise != null && exercise.getCourseId() != null) {
                        int idx = courseIds.indexOf(exercise.getCourseId());
                        if (idx >= 0) spinnerCourse.setSelection(idx);
                    }
                });
        if (exercise != null) {
            etTitle.setText(exercise.getTitle());
            for (int i = 0; i < kinds.length; i++) {
                if (kinds[i].equalsIgnoreCase(exercise.getDescription())) {
                    spinnerKind.setSelection(i);
                    break;
                }
            }
            com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("courses").get()
                    .addOnSuccessListener(queryDocumentSnapshots -> {
                        java.util.List<String> courseIdsLocal = new java.util.ArrayList<>();
                        for (com.google.firebase.firestore.QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                            courseIdsLocal.add(doc.getId());
                        }
                        int idx = courseIdsLocal.indexOf(exercise.getCourseId());
                        if (idx >= 0) spinnerCourse.setSelection(idx);
                    });
            // --- Đồng bộ logic như TestsFragment: duyệt cả object và id ---
            selectedQuestionIds.clear();
            selectedIdToTitle.clear();
            selectedIdToQuestionObj.clear();
            Object questionsObj = exercise.getQuestions();
android.util.Log.d("DEBUG_EX_SELECTED", "exercise.getQuestions(): " + questionsObj);
            if (questionsObj instanceof java.util.List && exercise.getQuestions() != null && !exercise.getQuestions().isEmpty()) {
                java.util.List<?> questions = (java.util.List<?>) questionsObj;
                java.util.List<String> idsToFetch = new java.util.ArrayList<>();
                java.util.List<java.util.Map<String, Object>> objectsToShow = new java.util.ArrayList<>();
                for (Object obj : questions) {
                    if (obj instanceof java.util.Map || (obj != null && obj.getClass().getName().contains("Map"))) {
                        @SuppressWarnings("unchecked")
                        java.util.Map<String, Object> qMap = (java.util.Map<String, Object>) obj;
                        java.util.Map<String, Object> norm = normalizeQuestionData(qMap, null);
android.util.Log.d("DEBUG_EX_SELECTED", "normalizeQuestionData result: " + norm);
objectsToShow.add(norm);
                    } else if (obj instanceof String) {
                        idsToFetch.add((String) obj);
                    }
                }
                for (java.util.Map<String, Object> norm : objectsToShow) {
                    String realId = norm.get("id") != null ? norm.get("id").toString() : null;
                    if (realId != null) {
                        selectedQuestionIds.add(realId);
                        selectedIdToTitle.put(realId, (String) norm.get("question_text"));
                        selectedIdToQuestionObj.put(realId, norm);
                    }
                }
                if (idsToFetch.isEmpty()) {
                    updateSelectedQuestionsView.run();
                }
                if (!idsToFetch.isEmpty()) {
                    com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("questions")
                            .whereIn(com.google.firebase.firestore.FieldPath.documentId(), idsToFetch)
                            .get().addOnSuccessListener(questionDocs -> {
                                for (com.google.firebase.firestore.QueryDocumentSnapshot doc : questionDocs) {
                                    java.util.Map<String, Object> rawData = doc.getData();
                                    java.util.Map<String, Object> norm = normalizeQuestionData(rawData, doc.getId());
                                    String realId = doc.getId();
                                    selectedQuestionIds.add(realId);
                                    selectedIdToTitle.put(realId, (String) norm.get("question_text"));
                                    selectedIdToQuestionObj.put(realId, norm);
                                }
                                updateSelectedQuestionsView.run();
                            });
                } else {
                    updateSelectedQuestionsView.run();
                }
            }

        }
        btnPickQuestions.setOnClickListener(v -> showQuestionPickerDialog());
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String title = etTitle.getText().toString().trim();
            int kindIdx = spinnerKind.getSelectedItemPosition();
            int courseIdx = spinnerCourse.getSelectedItemPosition();
            if (title.isEmpty()) {
                etTitle.setError("Vui lòng nhập tiêu đề");
                return;
            }
            if (kindIdx < 0 || courseIdx < 0) {
                Toast.makeText(getContext(), "Vui lòng chọn loại và khoá học", Toast.LENGTH_SHORT).show();
                return;
            }
            if (selectedQuestionIds.isEmpty()) {
                Toast.makeText(getContext(), "Vui lòng chọn ít nhất 1 câu hỏi", Toast.LENGTH_SHORT).show();
                return;
            }
            String kind = kinds[kindIdx];
            String courseId = courseIds.get(courseIdx);
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("title", title);
            data.put("type", kind);
            data.put("course_id", courseId);

            // Build questionsData đúng thứ tự
            java.util.List<java.util.Map<String, Object>> questionsData = new java.util.ArrayList<>();
            java.util.List<String> idsToQuery = new java.util.ArrayList<>();
            for (String qid : selectedQuestionIds) {
                java.util.Map<String, Object> obj = selectedIdToQuestionObj.get(qid);
                if (obj != null && obj.containsKey("question_text")) {
                    questionsData.add(obj);
                } else {
                    idsToQuery.add(qid);
                }
            }
            if (!idsToQuery.isEmpty()) {
                com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("questions")
                        .whereIn(com.google.firebase.firestore.FieldPath.documentId(), idsToQuery)
                        .get()
                        .addOnSuccessListener(qs -> {
                            java.util.Map<String, java.util.Map<String, Object>> idToObj = new java.util.HashMap<>();
                            for (com.google.firebase.firestore.DocumentSnapshot doc : qs.getDocuments()) {
                                java.util.Map<String, Object> qObj = new java.util.HashMap<>();
                                qObj.put("id", doc.getId());
                                qObj.put("question_text", doc.getString("content"));
                                if ("multiple_choice".equals(kind)) {
                                    Object optionsObj = doc.get("options");
                                    if (optionsObj instanceof java.util.List) {
                                        qObj.put("options", optionsObj);
                                    }
                                    Object correctAnswerObj = doc.get("correct_answer");
                                    if (correctAnswerObj == null)
                                        correctAnswerObj = doc.get("correctAnswer");
                                    if (correctAnswerObj == null)
                                        correctAnswerObj = doc.get("answer");
                                    if (correctAnswerObj instanceof Number) {
                                        qObj.put("correct_answer", ((Number) correctAnswerObj).intValue());
                                    } else if (correctAnswerObj instanceof String && optionsObj instanceof java.util.List) {
                                        java.util.List options = (java.util.List) optionsObj;
                                        int idx = options.indexOf(correctAnswerObj);
                                        qObj.put("correct_answer", idx);
                                    } else {
                                        qObj.put("correct_answer", correctAnswerObj);
                                    }
                                } else {
                                    Object correctAnswerObj = doc.get("correct_answer");
                                    if (correctAnswerObj == null)
                                        correctAnswerObj = doc.get("correctAnswer");
                                    if (correctAnswerObj == null)
                                        correctAnswerObj = doc.get("answer");
                                    qObj.put("correct_answer", correctAnswerObj);
                                }
                                idToObj.put(doc.getId(), qObj);
                            }
                            // Ghép lại đúng thứ tự
                            java.util.List<java.util.Map<String, Object>> finalQuestions = new java.util.ArrayList<>();
                            for (String qid : selectedQuestionIds) {
                                java.util.Map<String, Object> obj = selectedIdToQuestionObj.get(qid);
                                if (obj != null && obj.containsKey("question_text")) {
                                    finalQuestions.add(obj);
                                } else if (idToObj.containsKey(qid)) {
                                    finalQuestions.add(idToObj.get(qid));
                                }
                            }
                            data.put("questions", finalQuestions);
                            saveExerciseToFirestore(data, exercise, dialog);
                        })
                        .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi lấy chi tiết câu hỏi: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            } else {
                data.put("questions", questionsData);
                saveExerciseToFirestore(data, exercise, dialog);
            }
        });

// Hàm helper (đặt phía dưới)

        dialog.show();
    }

    private void saveExerciseToFirestore(Map<String, Object> data, ContentItem exercise, android.app.AlertDialog dialog) {
        if (exercise == null) {
            com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("exercises")
                    .add(data)
                    .addOnSuccessListener(docRef -> {
                        Toast.makeText(getContext(), "Đã thêm bài tập!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadExercises();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi thêm: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } else {
            com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("exercises")
                    .document(exercise.getId())
                    .update(data)
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(getContext(), "Đã cập nhật bài tập!", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadExercises();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi cập nhật: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }

    // --- Hàm chọn câu hỏi với 3 filter giống TestsFragment ---
    private void showQuestionPickerDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        builder.setTitle("Chọn Câu Hỏi");
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_select_questions, null);
        builder.setView(dialogView);
        android.widget.Spinner courseFilterSpinner = dialogView.findViewById(R.id.spinnerCourseFilter);
        android.widget.Spinner typeFilterSpinner = dialogView.findViewById(R.id.spinnerTypeFilter);
        android.widget.Spinner tagFilterSpinner = dialogView.findViewById(R.id.spinnerTagFilter);
        android.widget.ListView questionsListView = dialogView.findViewById(R.id.lvQuestions);
        java.util.List<String> courseFilterNames = new java.util.ArrayList<>();
        java.util.List<String> courseFilterIds = new java.util.ArrayList<>();
        android.widget.ArrayAdapter<String> courseFilterAdapter = new android.widget.ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseFilterNames);
        courseFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        courseFilterSpinner.setAdapter(courseFilterAdapter);
        java.util.List<String> typeFilterNames = new java.util.ArrayList<>();
        typeFilterNames.add("Tất cả kiểu");
        android.widget.ArrayAdapter<String> typeFilterAdapter = new android.widget.ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, typeFilterNames);
        typeFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeFilterSpinner.setAdapter(typeFilterAdapter);
        java.util.List<String> tagFilterNames = new java.util.ArrayList<>();
        tagFilterNames.add("Tất cả tag");
        android.widget.ArrayAdapter<String> tagFilterAdapter = new android.widget.ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, tagFilterNames);
        tagFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        tagFilterSpinner.setAdapter(tagFilterAdapter);
        com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("questions").get().addOnSuccessListener(qSnap -> {
            java.util.Set<String> uniqueTypes = new java.util.HashSet<>();
            java.util.Set<String> uniqueTags = new java.util.HashSet<>();
            for (com.google.firebase.firestore.QueryDocumentSnapshot doc : qSnap) {
                String type = doc.getString("type");
                if (type != null) uniqueTypes.add(type);
                java.util.List<String> tags = (java.util.List<String>) doc.get("tags");
                if (tags != null) uniqueTags.addAll(tags);
            }
            java.util.List<String> sortedTypes = new java.util.ArrayList<>(uniqueTypes);
            java.util.Collections.sort(sortedTypes);
            typeFilterNames.addAll(sortedTypes);
            typeFilterAdapter.notifyDataSetChanged();
            java.util.List<String> sortedTags = new java.util.ArrayList<>(uniqueTags);
            java.util.Collections.sort(sortedTags);
            tagFilterNames.addAll(sortedTags);
            tagFilterAdapter.notifyDataSetChanged();
        });
        courseFilterNames.add("Tất cả khóa học");
        courseFilterIds.add("");
        com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("courses").get().addOnSuccessListener(snaps -> {
            for (com.google.firebase.firestore.QueryDocumentSnapshot doc : snaps) {
                courseFilterNames.add(doc.getString("name"));
                courseFilterIds.add(doc.getId());
            }
            courseFilterAdapter.notifyDataSetChanged();
            // Nếu đang sửa bài tập, set spinner về đúng course
            if (currentEditingExercise != null && currentEditingExercise.getCourseId() != null) {
                int idx = courseFilterIds.indexOf(currentEditingExercise.getCourseId());
                if (idx >= 0) courseFilterSpinner.setSelection(idx);
            }
        });
        final java.util.List<java.util.Map<String, Object>> allQuestionsData = new java.util.ArrayList<>();
        final java.util.Set<String> selectedRealIds = new java.util.HashSet<>();
android.util.Log.d("DEBUG_PICKER", "selectedQuestionIds: " + selectedQuestionIds);
for (String id : selectedQuestionIds) {
    if (id.startsWith("firestore_")) {
        selectedRealIds.add(id.replace("firestore_", ""));
    } else {
        selectedRealIds.add(id);
    }
}
android.util.Log.d("DEBUG_PICKER", "selectedRealIds: " + selectedRealIds);
        android.widget.ArrayAdapter<String> questionsAdapter = new android.widget.ArrayAdapter<String>(getContext(), android.R.layout.simple_list_item_multiple_choice, new java.util.ArrayList<>()) {
            @Override
            public boolean isEnabled(int position) {
                String qId = (String) allQuestionsData.get(position).get("id");
                return !selectedRealIds.contains(qId);
            }

            @Override
            public View getView(int position, View convertView, android.view.ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                String qId = (String) allQuestionsData.get(position).get("id");
                android.util.Log.d("DEBUG_PICKER", "getView position=" + position + ", qId=" + qId + ", contains?=" + selectedRealIds.contains(qId));
                if (selectedRealIds.contains(qId)) {
                    view.setEnabled(false);
                    view.setAlpha(0.5f);
                } else {
                    view.setEnabled(true);
                    view.setAlpha(1f);
                }
                return view;
            }
        };
        questionsListView.setAdapter(questionsAdapter);
// Không cho bỏ tick các câu hỏi đã chọn từ trước
        questionsListView.setOnItemClickListener((parent, view, position, id) -> {
            String qId = (String) allQuestionsData.get(position).get("id");
            if (selectedRealIds.contains(qId)) {
                // Giữ trạng thái checked, không cho uncheck
                questionsListView.setItemChecked(position, true);
            }
        });
        questionsListView.setChoiceMode(android.widget.ListView.CHOICE_MODE_MULTIPLE);
        final Runnable loadQuestionsRunnable = () -> {
            int coursePos = courseFilterSpinner.getSelectedItemPosition();
            String filterCourseId = (coursePos > 0 && coursePos < courseFilterIds.size()) ? courseFilterIds.get(coursePos) : "";
            int typePos = typeFilterSpinner.getSelectedItemPosition();
            String filterType = (typePos > 0 && typePos < typeFilterNames.size()) ? typeFilterNames.get(typePos) : "";
            int tagPos = tagFilterSpinner.getSelectedItemPosition();
            String filterTag = (tagPos > 0 && tagPos < tagFilterNames.size()) ? tagFilterNames.get(tagPos) : "";
            com.google.firebase.firestore.Query query = com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("questions");
            if (!filterCourseId.isEmpty()) {
                query = query.whereEqualTo("course_id", filterCourseId);
            }
            if (!filterType.isEmpty() && !filterType.equals("Tất cả kiểu")) {
                query = query.whereEqualTo("type", filterType);
            }
            query.get().addOnSuccessListener(qSnap -> {
                allQuestionsData.clear();
                java.util.List<String> questionContents = new java.util.ArrayList<>();
                for (com.google.firebase.firestore.QueryDocumentSnapshot doc : qSnap) {
                    java.util.List<String> tags = (java.util.List<String>) doc.get("tags");
                    boolean matchTag = filterTag.isEmpty() || filterTag.equals("Tất cả tag") || (tags != null && tags.contains(filterTag));
                    if (!matchTag) continue;
                    java.util.Map<String, Object> qData = doc.getData();
                    qData.put("id", doc.getId());
                    allQuestionsData.add(qData);
                    String content = (String) qData.get("content");
                    if (content == null) content = (String) qData.get("question_text");
                    questionContents.add(content != null ? content : "N/A");
                }
                questionsAdapter.clear();
                questionsAdapter.addAll(questionContents);
                questionsAdapter.notifyDataSetChanged();
                // Chỉ tick lại những câu hỏi thực sự có trong danh sách hiện tại và thuộc bài tập đang sửa
                for (int i = 0; i < allQuestionsData.size(); i++) {
                    String qId = (String) allQuestionsData.get(i).get("id");
                    if (selectedRealIds.contains(qId)) {
                        questionsListView.setItemChecked(i, true);
                    } else {
                        questionsListView.setItemChecked(i, false);
                    }
                }
            });
        };
        courseFilterSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
            }
        });
        typeFilterSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
            }
        });
        tagFilterSpinner.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {
            }
        });
        builder.setPositiveButton("Chọn", (dialog, which) -> {
            // Lưu lại các câu hỏi đã chọn trước đó
            java.util.List<String> oldIds = new java.util.ArrayList<>(selectedQuestionIds);
            java.util.Map<String, String> oldTitles = new java.util.HashMap<>(selectedIdToTitle);
            java.util.Map<String, java.util.Map<String, Object>> oldObjs = new java.util.HashMap<>(selectedIdToQuestionObj);
            // Thêm các câu mới được tích vào danh sách (không reset)
            for (int i = 0; i < questionsListView.getCount(); i++) {
                if (questionsListView.isItemChecked(i)) {
                    String qId = (String) allQuestionsData.get(i).get("id");
                    String title = (String) allQuestionsData.get(i).get("content");
                    if (title == null)
                        title = (String) allQuestionsData.get(i).get("question_text");
                    if (!oldIds.contains(qId)) {
                        oldIds.add(qId);
                        oldTitles.put(qId, title);
                        oldObjs.put(qId, allQuestionsData.get(i));
                    }
                }
            }
            selectedQuestionIds.clear();
            selectedQuestionIds.addAll(oldIds);
            selectedIdToTitle.clear();
            selectedIdToTitle.putAll(oldTitles);
            selectedIdToQuestionObj.clear();
            selectedIdToQuestionObj.putAll(oldObjs);
            updateSelectedQuestionsView.run();
        });
        builder.setNegativeButton("Huỷ", null);
        builder.show();
    }

    private void confirmDeleteExercise(ContentItem exercise) {
        new android.app.AlertDialog.Builder(getContext())
                .setTitle("Xoá bài tập")
                .setMessage("Bạn có chắc muốn xoá bài tập này không?")
                .setPositiveButton("Xoá", (dialog, which) -> {
                    com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("exercises")
                            .document(exercise.getId())
                            .delete()
                            .addOnSuccessListener(unused -> {
                                Toast.makeText(getContext(), "Đã xoá bài tập!", Toast.LENGTH_SHORT).show();
                                loadExercises();
                            })
                            .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi xoá: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                })
                .setNegativeButton("Huỷ", null)
                .show();
    }

    private java.util.Map<String, Object> normalizeQuestionData(java.util.Map<String, Object> questionData, String originalId) {
        java.util.Map<String, Object> normalized = new java.util.HashMap<>();
        if (originalId != null) {
            normalized.put("id", originalId);
        } else if (questionData.get("id") != null) {
            normalized.put("id", questionData.get("id"));
        }
        normalized.put("question_text", questionData.get("question_text"));
        normalized.put("type", questionData.get("type"));
        Object options = questionData.get("options");
        if (options instanceof java.util.List) {
            normalized.put("options", options);
        } else if (options != null) {
            android.util.Log.d("DEBUG_OPTIONS", "options không phải List: " + options);
        }
        normalized.put("correct_answer", questionData.get("correct_answer"));
        normalized.put("answer", questionData.get("answer"));
        return normalized;
    }


    private void loadExercises() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        if (courseId != null && !courseId.isEmpty()) {
            db.collection("exercises").whereEqualTo("course_id", courseId).get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    exercises.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        ContentItem item = new ContentItem();
                        item.setId(doc.getId());
                        item.setTitle(doc.getString("title"));
                        item.setDescription(doc.getString("type"));
                        Object questionsRaw = doc.get("questions");
                        if (questionsRaw instanceof java.util.List) {
                            // Ép kiểu an toàn, nếu dữ liệu là List<Map<String, Object>>
                            try {
                                @SuppressWarnings("unchecked")
                                java.util.List<java.util.Map<String, Object>> questions = (java.util.List<java.util.Map<String, Object>>) questionsRaw;
                                item.setQuestions(questions);
                            } catch (Exception e) {
                                // Nếu không đúng kiểu, bỏ qua
                            }
                        }
                        exercises.add(item);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải exercises: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } else {
            db.collection("exercises").get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    exercises.clear();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        ContentItem item = new ContentItem();
                        item.setId(doc.getId());
                        item.setTitle(doc.getString("title"));
                        item.setDescription(doc.getString("type"));
                        Object questionsRaw = doc.get("questions");
                        if (questionsRaw instanceof java.util.List) {
                            // Ép kiểu an toàn, nếu dữ liệu là List<Map<String, Object>>
                            try {
                                @SuppressWarnings("unchecked")
                                java.util.List<java.util.Map<String, Object>> questions = (java.util.List<java.util.Map<String, Object>>) questionsRaw;
                                item.setQuestions(questions);
                            } catch (Exception e) {
                                // Nếu không đúng kiểu, bỏ qua
                            }
                        }
                        exercises.add(item);
                    }
                    filterAndShow();
                })
                .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải exercises: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }

    private void filterAndShow() {
        List<ContentItem> filtered = new ArrayList<>();
        if (searchQuery.isEmpty()) {
            filtered.addAll(exercises);
        } else {
            for (ContentItem item : exercises) {
                if ((item.getTitle() != null && item.getTitle().toLowerCase().contains(searchQuery)) ||
                    (item.getDescription() != null && item.getDescription().toLowerCase().contains(searchQuery))) {
                    filtered.add(item);
                }
            }
        }
        adapter = new ExercisesAdapter(filtered);
        adapter.setOnExerciseActionListener(new ExercisesAdapter.OnExerciseActionListener() {
            @Override
            public void onEdit(ContentItem exercise) {
                showAddEditExerciseDialog(exercise);
            }

            @Override
            public void onDelete(ContentItem exercise) {
                confirmDeleteExercise(exercise);
            }
        });
        recyclerView.setAdapter(adapter);
    }
} 