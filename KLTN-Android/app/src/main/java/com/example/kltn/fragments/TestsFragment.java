package com.example.kltn.fragments;

import android.app.AlertDialog;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.kltn.R;
import com.example.kltn.models.ContentItem;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class TestsFragment extends Fragment {
    private RecyclerView recyclerView;
    private TestsManageAdapter adapter;
    private List<ContentItem> tests = new ArrayList<>();
    private String courseId = "";
    private String searchQuery = "";
    private FirebaseFirestore db;

    // Biến quản lý chọn câu hỏi
    private List<String> selectedQuestionIds = new ArrayList<>();
    private Map<String, Map<String, Object>> selectedIdToQuestionData = new HashMap<>();
    private Runnable updateSelectedQuestionsView;
    // Thêm biến lưu object câu hỏi đã chọn (id -> object)
    private Map<String, Map<String, Object>> selectedIdToQuestionObj = new HashMap<>();


    public void setCourseId(String courseId) {
        this.courseId = courseId;
        loadTests();
    }

    public void setSearchQuery(String query) {
        this.searchQuery = query == null ? "" : query.trim().toLowerCase();
        filterAndShow();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_tests, container, false);
        db = FirebaseFirestore.getInstance();
        recyclerView = view.findViewById(R.id.rvTests);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // Khởi tạo adapter trống ban đầu
        adapter = new TestsManageAdapter(getContext(), new ArrayList<>());
        recyclerView.setAdapter(adapter);

        adapter.setOnTestActionListener(new TestsManageAdapter.OnTestActionListener() {
            @Override
            public void onEdit(ContentItem test) {
                showAddEditTestDialog(test);
            }

            @Override
            public void onDelete(ContentItem test) {
                confirmDeleteTest(test);
            }
        });

        FloatingActionButton fabAdd = view.findViewById(R.id.fabAddTest);
        fabAdd.setOnClickListener(v -> showAddEditTestDialog(null));

        loadTests();
        return view;
    }

    private void setupRecyclerView() {
        // This method is now empty and can be removed.
        // Logic moved to onCreateView and filterAndShow
    }

    private void loadTests() {
        if (db == null) return;

        com.google.firebase.firestore.Query query = db.collection("tests");

        if (courseId != null && !courseId.isEmpty()) {
            query = query.whereEqualTo("course_id", courseId);
        }

        query.get().addOnSuccessListener(queryDocumentSnapshots -> {
            tests.clear();
            for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                Log.d("TEST_DEBUG", "--- Loading Doc ID: " + doc.getId() + " ---");
                // Manually create and populate the ContentItem to avoid toObject() issues.
                ContentItem test = new ContentItem();
                test.setId(doc.getId());

                if (doc.contains("title")) {
                    test.setTitle(doc.getString("title"));
                    Log.d("TEST_DEBUG", "Title: " + test.getTitle());
                }

                if (doc.contains("courseId")) {
                    test.setCourseId(doc.getString("courseId"));
                } else if (doc.contains("course_id")) {
                    test.setCourseId(doc.getString("course_id"));
                }
                Log.d("TEST_DEBUG", "Course ID: " + test.getCourseId());


                if (doc.contains("duration")) {
                    test.setDuration(doc.getLong("duration").intValue());
                }
                Log.d("TEST_DEBUG", "Duration: " + test.getDuration());


                if (doc.contains("maxScore")) {
                    test.setMaxScore(doc.getLong("maxScore").intValue());
                } else if (doc.contains("max_score")) {
                    test.setMaxScore(doc.getLong("max_score").intValue());
                }
                Log.d("TEST_DEBUG", "Max Score: " + test.getMaxScore());


                if (doc.contains("questions")) {
                    Object questionsObj = doc.get("questions");
                    if (questionsObj instanceof List) {
                        List<?> list = (List<?>) questionsObj;
                        if (!list.isEmpty() && list.get(0) instanceof Map) {
                            // Là mảng object
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> qList = (List<Map<String, Object>>) questionsObj;
                            test.setQuestions(qList);
                        } else if (!list.isEmpty() && list.get(0) instanceof String) {
                            // Là mảng ID
                            @SuppressWarnings("unchecked")
                            List<String> ids = (List<String>) questionsObj;
                            test.setQuestionIds(ids);
                            Log.d("TEST_DEBUG", "Question IDs loaded. Size: " + ids.size());
                        }
                    }
                }

                tests.add(test);
            }
            filterAndShow();
        }).addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi tải tests: " + e.getMessage(), Toast.LENGTH_SHORT).show());
    }

    private void filterAndShow() {
        List<ContentItem> filtered = new ArrayList<>();
        if (searchQuery.isEmpty()) {
            filtered.addAll(tests);
        } else {
            for (ContentItem test : tests) {
                if (test.getTitle() != null && test.getTitle().toLowerCase().contains(searchQuery)) {
                    filtered.add(test);
                }
            }
        }
        adapter = new TestsManageAdapter(getContext(), filtered);
        adapter.setOnTestActionListener(new TestsManageAdapter.OnTestActionListener() {
            @Override
            public void onEdit(ContentItem test) {
                showAddEditTestDialog(test);
            }

            @Override
            public void onDelete(ContentItem test) {
                confirmDeleteTest(test);
            }
        });
        recyclerView.setAdapter(adapter);
    }

    private void confirmDeleteTest(ContentItem test) {
        new AlertDialog.Builder(getContext())
                .setTitle("Xoá Bài Test")
                .setMessage("Bạn có chắc chắn muốn xoá bài test này không?")
                .setPositiveButton("Xoá", (dialog, which) -> {
                    db.collection("tests").document(test.getId()).delete()
                            .addOnSuccessListener(aVoid -> {
                                Toast.makeText(getContext(), "Xoá thành công", Toast.LENGTH_SHORT).show();
                                loadTests(); // Tải lại danh sách
                            })
                            .addOnFailureListener(e -> Toast.makeText(getContext(), "Xoá thất bại: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    // --- HÀM HELPER ĐỂ CHUẨN HÓA DỮ LIỆU CÂU HỎI ---
    private Map<String, Object> normalizeQuestionData(Map<String, Object> rawMap, @Nullable String docId) {
        // Hàm này giờ chỉ phục vụ cho việc hiển thị, không ảnh hưởng đến dữ liệu lưu trữ
        Log.d("NORMALIZE_DEBUG", "--- Bắt đầu chuẩn hóa cho doc ID: " + docId + " ---");
        Log.d("NORMALIZE_DEBUG", "Dữ liệu thô ĐẦU VÀO: " + rawMap);

        Map<String, Object> normalizedMap = new HashMap<>(rawMap);
        if (docId != null) {
            normalizedMap.put("id", docId);
        }

        // 1. Chuẩn hóa Nội dung
        if (normalizedMap.get("content") == null && normalizedMap.containsKey("question_text")) {
            normalizedMap.put("content", normalizedMap.get("question_text"));
        }
        if (normalizedMap.get("content") == null && normalizedMap.containsKey("thrilled")) {
            normalizedMap.put("content", normalizedMap.get("thrilled"));
        }

        // 2. Chuẩn hóa Loại
        if (normalizedMap.get("type") == null && normalizedMap.containsKey("kind")) {
            normalizedMap.put("type", normalizedMap.get("kind"));
        }

        // 3. Chuẩn hóa và Xử lý Đáp án
        Object rawAnswer = normalizedMap.get("correctAnswer");
        if (rawAnswer == null && normalizedMap.containsKey("correct_answer")) {
            rawAnswer = normalizedMap.get("correct_answer");
        }
        if (rawAnswer == null && normalizedMap.containsKey("correct answer")) {
            rawAnswer = normalizedMap.get("correct answer");
        }

        String displayAnswer = "N/A";
        if (rawAnswer != null) {
            Object type = normalizedMap.get("type");
            Object optionsObj = normalizedMap.get("options");
            if ("multiple_choice".equals(type) && optionsObj instanceof List) {
                try {
                    @SuppressWarnings("unchecked") List<String> options = (List<String>) optionsObj;
                    int answerIndex = ((Number) rawAnswer).intValue();
                    if (answerIndex >= 0 && answerIndex < options.size()) {
                        displayAnswer = options.get(answerIndex);
                    }
                } catch (Exception e) {
                    displayAnswer = String.valueOf(rawAnswer);
                }
            } else {
                displayAnswer = String.valueOf(rawAnswer);
            }
        }
        normalizedMap.put("correctAnswer", displayAnswer);

        Log.d("NORMALIZE_DEBUG", "Dữ liệu đã chuẩn hóa ĐẦU RA: " + normalizedMap);
        Log.d("NORMALIZE_DEBUG", "--- Kết thúc chuẩn hóa cho doc ID: " + docId + " ---");
        return normalizedMap;
    }


    public void showAddEditTestDialog(@Nullable ContentItem test) {
    Log.d("TEST_DIALOG", "STEP 0: showAddEditTestDialog CALLED");
    // Luôn reset trạng thái tick khi mở dialog sửa test mới hoặc tạo test mới
    selectedQuestionIds.clear();
    selectedIdToQuestionData.clear();
    selectedIdToQuestionObj.clear();

    // Ngăn null pointer
    updateSelectedQuestionsView = () -> {};

    if (test == null) {
        Log.d("TEST_DEBUG_DIALOG", "Dialog opened for a NEW test.");
    } else {
        Log.d("TEST_DEBUG_DIALOG", "--- Dialog opened for EDIT test: " + test.getTitle() + " ---");
        Log.d("TEST_DEBUG_DIALOG", "Max Score: " + test.getMaxScore());
        Log.d("TEST_DEBUG_DIALOG", "Duration: " + test.getDuration());
        Log.d("TEST_DEBUG_DIALOG", "Course ID: " + test.getCourseId());
        Object questionsObj = test.getQuestions();
        Log.d("TEST_DEBUG_DIALOG", "questionsObj: " + questionsObj + (questionsObj != null ? (" type: " + questionsObj.getClass().getName()) : ""));
        if (questionsObj instanceof List) {
            List<?> questions = (List<?>) questionsObj;
            for (int i = 0; i < questions.size(); i++) {
                for (Object obj : questions) {
                    if (obj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> qMap = (Map<String, Object>) obj;
                        String realId = qMap.get("id") != null ? qMap.get("id").toString() : null;
                        if (realId != null && !realId.isEmpty()) {
                            selectedQuestionIds.add(realId);
                            selectedIdToQuestionData.put(realId, qMap);
                            selectedIdToQuestionObj.put(realId, qMap);
                        } else {
                            Log.w("TEST_DEBUG_DIALOG", "Skipped question object with missing id: " + qMap);
                        }
                    }
                }
                updateSelectedQuestionsView.run();
            }
        }
    }

    Log.d("TEST_DIALOG", "STEP 1: Before inflate layout");
    LayoutInflater inflater = requireActivity().getLayoutInflater();
    View dialogView = inflater.inflate(R.layout.dialog_add_edit_test, null);
    Log.d("TEST_DIALOG", "STEP 2: After inflate layout");
    AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
    builder.setView(dialogView);

    final EditText etTestTitle = dialogView.findViewById(R.id.etTestTitle);
    final EditText etTestDuration = dialogView.findViewById(R.id.etTestDuration);
    final EditText etMaxScore = dialogView.findViewById(R.id.etMaxScore);
    final Spinner spinnerCourse = dialogView.findViewById(R.id.spinnerCourse);
    final Button btnPickQuestions = dialogView.findViewById(R.id.btnPickQuestions);
    final LinearLayout containerSelectedQuestions = dialogView.findViewById(R.id.containerSelectedQuestions);
    final Button btnCancel = dialogView.findViewById(R.id.btnCancel);
    final Button btnSave = dialogView.findViewById(R.id.btnSave);
    Log.d("TEST_DIALOG", "STEP 3: After findViewById");

    // --- Logic quản lý câu hỏi đã chọn ---
    updateSelectedQuestionsView = () -> {
        Log.d("VIEW_UPDATE_DEBUG", "--- Bắt đầu cập nhật giao diện câu hỏi đã chọn ---");
        Log.d("VIEW_UPDATE_DEBUG", "Kích thước map dữ liệu: " + selectedIdToQuestionData.size());
        containerSelectedQuestions.removeAllViews();
        for (String qid : new ArrayList<>(selectedQuestionIds)) {
            LinearLayout row = new LinearLayout(getContext());
            row.setOrientation(LinearLayout.VERTICAL);
            row.setPadding(0, 0, 0, 16);

            // Dòng 1: Câu hỏi
            TextView tvQuestion = new TextView(getContext());
            Map<String, Object> qObj = selectedIdToQuestionObj.get(qid);
            String questionText = null;
            if (qObj != null) {
                questionText = (String) qObj.get("question_text");
                if (questionText == null) questionText = (String) qObj.get("content");
            }
            if (questionText == null) questionText = qid;
            tvQuestion.setText("Câu hỏi: " + questionText);
            tvQuestion.setPadding(8, 8, 8, 4);

            // Dòng 2: Đáp án + nút xóa
            LinearLayout answerRow = new LinearLayout(getContext());
            answerRow.setOrientation(LinearLayout.HORIZONTAL);
            answerRow.setGravity(android.view.Gravity.CENTER_VERTICAL);

            TextView tvAnswer = new TextView(getContext());
            String answer = "";
            if (qObj != null) {
                answer = (String) qObj.get("correct_answer");
                if (answer == null) answer = (String) qObj.get("correctAnswer");
            }
            tvAnswer.setText("Đáp án: " + (answer != null ? answer : ""));
            tvAnswer.setTypeface(null, android.graphics.Typeface.BOLD);
            tvAnswer.setPadding(8, 0, 8, 8);

            ImageButton btnDelete = new ImageButton(getContext());
            btnDelete.setImageResource(android.R.drawable.ic_menu_delete);
            btnDelete.setBackgroundColor(android.graphics.Color.TRANSPARENT);
            btnDelete.setOnClickListener(v -> {
                selectedQuestionIds.remove(qid);
                selectedIdToQuestionData.remove(qid);
                selectedIdToQuestionObj.remove(qid);
                updateSelectedQuestionsView.run();
            });
            LinearLayout.LayoutParams delParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
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

    // --- Tải danh sách khóa học vào Spinner ---
    List<String> courseNames = new ArrayList<>();
    List<String> courseIds = new ArrayList<>();
    ArrayAdapter<String> courseAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseNames);
    courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
    spinnerCourse.setAdapter(courseAdapter);

    db.collection("courses").get().addOnSuccessListener(queryDocumentSnapshots -> {
        courseNames.clear();
        courseIds.clear();
        for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
            courseNames.add(doc.getString("name"));
            courseIds.add(doc.getId());
        }
        courseAdapter.notifyDataSetChanged();
        // Nếu là edit, chọn đúng khóa học
        if (test != null && test.getCourseId() != null) {
            spinnerCourse.post(() -> {
                int pos = courseIds.indexOf(test.getCourseId());
                if (pos >= 0) {
                    spinnerCourse.setSelection(pos, true);
                }
            });
        }
    });

    // --- Nếu là chế độ Edit, điền thông tin cũ ---
    if (test != null) {
        builder.setTitle("Sửa Bài Test");
        etTestTitle.setText(test.getTitle());
        etTestDuration.setText(String.valueOf(test.getDuration()));
        etMaxScore.setText(String.valueOf(test.getMaxScore()));

        // Xử lý trường hợp mảng questions có thể là mảng object hoặc mảng ID hoặc trộn lẫn
        if (test.getQuestions() != null && !test.getQuestions().isEmpty()) {
            Log.d("DEBUG_QUESTIONS", "Bắt đầu duyệt mảng questions, size = " + test.getQuestions().size());
            List<String> idsToFetch = new ArrayList<>();
            List<Map<String, Object>> objectsToShow = new ArrayList<>();
            int idx = 0;
            for (Object obj : test.getQuestions()) {
                Log.d("DEBUG_QUESTIONS", "Phan tu questions: " + obj + ", class: " + (obj != null ? obj.getClass().getName() : "null"));
                if (obj instanceof Map || (obj != null && obj.getClass().getName().contains("Map"))) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> qMap = (Map<String, Object>) obj;
                    objectsToShow.add(normalizeQuestionData(qMap, null));
                } else if (obj instanceof String) {
                    idsToFetch.add((String) obj);
                } else {
                    Log.d("DEBUG_QUESTIONS", "Phần tử không phải Map cũng không phải String: " + obj);
                }
            }
            // Hiển thị các object có sẵn
            selectedQuestionIds.clear();
            selectedIdToQuestionData.clear();
            selectedIdToQuestionObj.clear();
            int fakeIdx = 0;
            for (Map<String, Object> norm : objectsToShow) {
                String fakeId = "local_" + fakeIdx++;
                selectedQuestionIds.add(fakeId);
                selectedIdToQuestionData.put(fakeId, norm);
                // Thêm vào selectedIdToQuestionObj
                selectedIdToQuestionObj.put(fakeId, norm);
            }
            // Nếu có ID, truy vấn Firestore và gộp kết quả
            if (!idsToFetch.isEmpty()) {
                db.collection("questions").whereIn(com.google.firebase.firestore.FieldPath.documentId(), idsToFetch)
                        .get().addOnSuccessListener(questionDocs -> {
                            for (QueryDocumentSnapshot doc : questionDocs) {
                                Map<String, Object> rawData = doc.getData();
                                Map<String, Object> norm = normalizeQuestionData(rawData, doc.getId());
                                String fakeId = "firestore_" + doc.getId();
                                selectedQuestionIds.add(fakeId);
                                selectedIdToQuestionData.put(fakeId, norm);
                                // Thêm vào selectedIdToQuestionObj
                                selectedIdToQuestionObj.put(fakeId, norm);
                            }
                            updateSelectedQuestionsView.run();
                        });
            } else {
                updateSelectedQuestionsView.run();
            }
        }
    } else {
        builder.setTitle("Thêm Bài Test Mới");
    }

    AlertDialog dialog = builder.create();
    btnCancel.setOnClickListener(v -> dialog.dismiss());
    btnPickQuestions.setOnClickListener(v -> showQuestionPickerDialog());
    btnSave.setOnClickListener(v -> {
        String title = etTestTitle.getText().toString().trim();
        String durationStr = etTestDuration.getText().toString().trim();
        String maxScoreStr = etMaxScore.getText().toString().trim();

        if (title.isEmpty() || durationStr.isEmpty() || maxScoreStr.isEmpty()) {
            Toast.makeText(getContext(), "Vui lòng nhập đủ thông tin", Toast.LENGTH_SHORT).show();
            return;
        }
        int duration = Integer.parseInt(durationStr);
        int maxScore = Integer.parseInt(maxScoreStr);
        int selectedCoursePos = spinnerCourse.getSelectedItemPosition();
        if (selectedCoursePos < 0 || selectedCoursePos >= courseIds.size()) {
            Toast.makeText(getContext(), "Vui lòng chọn khóa học", Toast.LENGTH_SHORT).show();
            return;
        }
        String selectedCourseId = courseIds.get(selectedCoursePos);

        Map<String, Object> testData = new HashMap<>();
        testData.put("title", title);
        testData.put("duration", duration);
        testData.put("course_id", selectedCourseId);

        // Tạo danh sách câu hỏi sạch để lưu
        List<Map<String, Object>> questionsToSave = new ArrayList<>();
        for (String qId : selectedQuestionIds) {
            Map<String, Object> rawData = selectedIdToQuestionData.get(qId);
            Map<String, Object> normalized = normalizeQuestionData(rawData, qId); // truyền qId vào luôn!
            Map<String, Object> cleanMap = new HashMap<>();
            cleanMap.put("id", qId); // id chính là id Firestore của câu hỏi đã chọn

            Object questionText = normalized.get("content");
            if (questionText == null) questionText = normalized.get("question_text");
            if (questionText == null) questionText = normalized.get("thrilled");

            Object correctAnswer = normalized.get("correctAnswer");
            if (correctAnswer == null) correctAnswer = normalized.get("correct_answer");
            if (correctAnswer == null) correctAnswer = normalized.get("correct answer");

            Object kind = normalized.get("type");
            if (kind == null) kind = normalized.get("kind");

            if (questionText != null) cleanMap.put("question_text", questionText);
            if (correctAnswer != null) cleanMap.put("correct_answer", correctAnswer);
            if (kind != null) cleanMap.put("type", kind);

            // Nếu là câu hỏi trắc nghiệm, thêm trường options
            if (kind != null && "multiple_choice".equals(kind)) {
                Object options = normalized.get("options");
                if (options != null) cleanMap.put("options", options);
            }

            questionsToSave.add(cleanMap);
        }
        testData.put("questions", questionsToSave); // Chỉ lưu 3 trường

        testData.put("maxScore", maxScore);

        if (test == null) { // Thêm mới
            db.collection("tests").add(testData)
                    .addOnSuccessListener(documentReference -> {
                        Toast.makeText(getContext(), "Thêm test thành công", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadTests();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } else { // Cập nhật
            db.collection("tests").document(test.getId()).set(testData)
                    .addOnSuccessListener(aVoid -> {
                        Toast.makeText(getContext(), "Cập nhật thành công", Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                        loadTests();
                    })
                    .addOnFailureListener(e -> Toast.makeText(getContext(), "Lỗi: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    });
    Log.d("TEST_DIALOG", "STEP 4: Before dialog.show()");
    dialog.show();
    Log.d("TEST_DIALOG", "STEP 5: After dialog.show()");
}

    private void showQuestionPickerDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        builder.setTitle("Chọn Câu Hỏi");

        LayoutInflater inflater = requireActivity().getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_select_questions, null);
        builder.setView(dialogView);

        Spinner courseFilterSpinner = dialogView.findViewById(R.id.spinnerCourseFilter);
        Spinner typeFilterSpinner = dialogView.findViewById(R.id.spinnerTypeFilter);
        Spinner tagFilterSpinner = dialogView.findViewById(R.id.spinnerTagFilter);
        ListView questionsListView = dialogView.findViewById(R.id.lvQuestions);

// --- Type Filter ---
        List<String> typeFilterNames = new ArrayList<>();
        typeFilterNames.add("Tất cả loại");
        typeFilterNames.add("fill_blank");
        typeFilterNames.add("multiple_choice");
        ArrayAdapter<String> typeFilterAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, typeFilterNames);
        typeFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeFilterSpinner.setAdapter(typeFilterAdapter);

// --- Tag Filter ---
        List<String> tagFilterNames = new ArrayList<>();
        tagFilterNames.add("Tất cả tag");
        ArrayAdapter<String> tagFilterAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, tagFilterNames);
        tagFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        tagFilterSpinner.setAdapter(tagFilterAdapter);
        FirebaseFirestore.getInstance().collection("questions").get().addOnSuccessListener(qSnap -> {
            java.util.Set<String> uniqueTags = new java.util.HashSet<>();
            for (QueryDocumentSnapshot doc : qSnap) {
                java.util.List<String> tags = (java.util.List<String>) doc.get("tags");
                if (tags != null) uniqueTags.addAll(tags);
            }
            java.util.List<String> sortedTags = new java.util.ArrayList<>(uniqueTags);
            java.util.Collections.sort(sortedTags);
            tagFilterNames.addAll(sortedTags);
            tagFilterAdapter.notifyDataSetChanged();
        });


// --- Course Filter ---
        List<String> courseFilterNames = new ArrayList<>();
        List<String> courseFilterIds = new ArrayList<>();
        ArrayAdapter<String> courseFilterAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_spinner_item, courseFilterNames);
        courseFilterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        courseFilterSpinner.setAdapter(courseFilterAdapter);

        courseFilterNames.add("Tất cả khóa học");
        courseFilterIds.add("");
        db.collection("courses").get().addOnSuccessListener(snaps -> {
            for (QueryDocumentSnapshot doc : snaps) {
                courseFilterNames.add(doc.getString("name"));
                courseFilterIds.add(doc.getId());
            }
            courseFilterAdapter.notifyDataSetChanged();
        });

        final List<Map<String, Object>> allQuestionsData = new ArrayList<>();
        // Tạo set chứa id thực của các câu hỏi đã chọn (dù là fakeId hay object)
        final Set<String> selectedRealIds = new HashSet<>();
        for (Map.Entry<String, Map<String, Object>> entry : selectedIdToQuestionData.entrySet()) {
            Map<String, Object> qData = entry.getValue();
            Object realId = qData.get("id");
            if (realId != null) selectedRealIds.add(realId.toString());
        }
        ArrayAdapter<String> questionsAdapter = new ArrayAdapter<String>(getContext(), android.R.layout.simple_list_item_multiple_choice, new ArrayList<>()) {
            @Override
            public boolean isEnabled(int position) {
                String qId = (String) allQuestionsData.get(position).get("id");
                return !selectedRealIds.contains(qId);
            }

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                String qId = (String) allQuestionsData.get(position).get("id");
                if (selectedRealIds.contains(qId)) {
                    view.setEnabled(false);
                    view.setAlpha(0.5f);
                    if (view instanceof CheckBox) { // Changed from CheckedTextView to CheckBox
                        ((CheckBox) view).setChecked(true);
                    }
                } else {
                    view.setEnabled(true);
                    view.setAlpha(1f);
                }
                return view;
            }
        };
        questionsListView.setAdapter(questionsAdapter);
        questionsListView.setChoiceMode(ListView.CHOICE_MODE_MULTIPLE);

        // Hàm tải câu hỏi dựa trên khóa học được chọn
        final Runnable loadQuestionsRunnable = () -> {
            int pos = courseFilterSpinner.getSelectedItemPosition();
            String filterCourseId = (pos > 0 && pos < courseFilterIds.size()) ? courseFilterIds.get(pos) : "";
            int typePos = typeFilterSpinner.getSelectedItemPosition();
            String filterType = (typePos > 0 && typePos < typeFilterNames.size()) ? typeFilterNames.get(typePos) : "";
            int tagPos = tagFilterSpinner.getSelectedItemPosition();
            String filterTag = (tagPos > 0 && tagPos < tagFilterNames.size()) ? tagFilterNames.get(tagPos) : "";

            com.google.firebase.firestore.Query query = db.collection("questions");
            if (!filterCourseId.isEmpty()) {
                query = query.whereEqualTo("course_id", filterCourseId);
            }
            if (!filterType.isEmpty() && !filterType.equals("Tất cả loại")) {
                query = query.whereEqualTo("type", filterType);
            }
            if (!filterTag.isEmpty() && !filterTag.equals("Tất cả tag")) {
                query = query.whereArrayContains("tags", filterTag);
            }

            query.get().addOnSuccessListener(qSnap -> {
                allQuestionsData.clear();
                List<String> questionContents = new ArrayList<>();
                for (QueryDocumentSnapshot doc : qSnap) {
                    Map<String, Object> qData = doc.getData();
                    qData.put("id", doc.getId());
                    allQuestionsData.add(qData);

                    String content = (String) qData.get("content");
                    if (content == null) {
                        content = (String) qData.get("question_text");
                    }
                    questionContents.add(content != null ? content : "N/A");
                }
                questionsAdapter.clear();
                questionsAdapter.addAll(questionContents);
                questionsAdapter.notifyDataSetChanged();

                // Tick lại các câu hỏi đã chọn
                for (int i = 0; i < allQuestionsData.size(); i++) {
                    Object idObj = allQuestionsData.get(i).get("id");
                    String qId = idObj != null ? idObj.toString() : null;
                    questionsListView.setItemChecked(i, selectedQuestionIds.contains(qId));
                }
            });
        };
        builder.setPositiveButton("OK", (dialog, which) -> {
            // Lưu các câu hỏi đã chọn
            android.util.SparseBooleanArray checked = questionsListView.getCheckedItemPositions();
            // Giữ lại các câu hỏi đã chọn trước đó (không xóa clear toàn bộ)
            for (int i = 0; i < checked.size(); i++) {
                int position = checked.keyAt(i);
                if (checked.valueAt(i)) {
                    if (position >= allQuestionsData.size()) continue;
                    Map<String, Object> qMap = allQuestionsData.get(position);
                    Object idObj = qMap.get("id");
                    String qId = idObj != null ? idObj.toString() : null;
                    if (qId != null && !selectedQuestionIds.contains(qId)) {
                        Map<String, Object> normalizedData = normalizeQuestionData(qMap, qId);
                        selectedQuestionIds.add(qId);
                        selectedIdToQuestionData.put(qId, normalizedData);
                        selectedIdToQuestionObj.put(qId, normalizedData);
                    }
                }
            }
            updateSelectedQuestionsView.run();
        });
        builder.setNegativeButton("Hủy", null);

        // Gán listener cho các filter spinner để tự động reload câu hỏi khi thay đổi
        courseFilterSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        typeFilterSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        tagFilterSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                loadQuestionsRunnable.run();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });

        builder.show();
    }
}