package com.example.kltn.activities;

import android.animation.AnimatorInflater;
import android.animation.AnimatorSet;
import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.kltn.R;
import com.example.kltn.models.Flashcard;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.google.android.material.tabs.TabLayout;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.example.kltn.managers.BadgeManager;

public class FlashcardLearningActivity extends AppCompatActivity {

    private TextView tvProgress, tvFlashcardText, tvFlashcardHint;
    private TabLayout tabLayout;
    private LinearProgressIndicator flashcardProgressBar;
    private ImageView imgFlashcard;
    private TextView tvFlashcardExample;
    private ImageButton btnFlashcardBack, btnFlashcardNext;
    private ImageButton btnPlayWordAudio, btnPlayExampleAudio;
    private TextToSpeech tts;

    private List<Flashcard> flashcards;
    private int currentCardIndex = 0;
    private boolean isCardFlipped = false;
    private String currentTopic = "Colors";
    private String userEmail;
    private List<String> flashcardSetIds = new ArrayList<>();
    private HashMap<String, String> setIdToTitle = new HashMap<>();
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_flashcard_learning);

        userEmail = getIntent().getStringExtra("user_email");
        userId = getIntent().getStringExtra("user_id"); // Lấy userId từ intent

        initViews();
        tts = new TextToSpeech(this, status -> {
            if (status != TextToSpeech.ERROR) {
                tts.setLanguage(java.util.Locale.US);
            }
        });
        fetchFlashcardSets(); // <-- Lấy danh sách bộ flashcard từ Firestore
        setupClickListeners();
        setupBottomNavigation();
    }

    private void initViews() {
        tvProgress = findViewById(R.id.tvProgress); // Card 3/10
        tvFlashcardText = findViewById(R.id.tvFlashcardText); // Từ tiếng Anh
        tvFlashcardHint = findViewById(R.id.tvFlashcardHint); // Nghĩa tiếng Việt
        tabLayout = findViewById(R.id.tabLayout);
        flashcardProgressBar = findViewById(R.id.flashcardProgressBar);
        imgFlashcard = findViewById(R.id.r4tyal07kb98);
        tvFlashcardExample = findViewById(R.id.tvFlashcardExample);
        btnFlashcardBack = findViewById(R.id.btnFlashcardBack);
        btnFlashcardNext = findViewById(R.id.btnFlashcardNext);
        btnPlayWordAudio = findViewById(R.id.btnPlayWordAudio);
        btnPlayExampleAudio = findViewById(R.id.btnPlayExampleAudio);
    }

    private void setupTabs() { /* Đã thay bằng fetchFlashcardSets() */ }

    private void setupFlashcards() {
    // Luôn map từ title sang document ID khi truy vấn Firestore
    String docId = null;
    for (String id : flashcardSetIds) {
        if (setIdToTitle.get(id).equals(currentTopic)) {
            docId = id;
            break;
        }
    }
    if (docId == null) {
        flashcards = new ArrayList<>();
        displayCurrentCard();
        return;
    }
    FirebaseFirestore.getInstance()
            .collection("flashcard_sets").document(docId).collection("cards")
            .orderBy("order")
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                flashcards = new ArrayList<>();
                for (DocumentSnapshot doc : queryDocumentSnapshots.getDocuments()) {
                    String front = doc.getString("front_text");
                    String back = doc.getString("back_text");
                    String example = doc.getString("example_sentence");
                    String imageUrl = doc.getString("image_url");
                    flashcards.add(new Flashcard(doc.getId(), "", front, back, example, imageUrl, 0));
                }
                currentCardIndex = 0;
                isCardFlipped = false;
                LinearLayout flashcardMain = findViewById(R.id.flashcardMainContainer);
                TextView tvEmpty = findViewById(R.id.tvEmptyFlashcardSet);
                if (flashcards.isEmpty()) {
                    flashcardMain.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.VISIBLE);
                } else {
                    flashcardMain.setVisibility(View.VISIBLE);
                    tvEmpty.setVisibility(View.GONE);
                    displayCurrentCard();
                }
            })
            .addOnFailureListener(e -> {
                flashcards = new ArrayList<>();
                Toast.makeText(this, "Không lấy được dữ liệu flashcard!", Toast.LENGTH_SHORT).show();
                displayCurrentCard();
            });
}

    private void animateFlashcardChange() {
        AlphaAnimation anim = new AlphaAnimation(0.0f, 1.0f);
        anim.setDuration(400);
        tvFlashcardText.startAnimation(anim);
        tvFlashcardHint.startAnimation(anim);
    }

    private void setupClickListeners() {
        imgFlashcard.setOnClickListener(v -> flipCardWithAnimation());
        btnFlashcardBack.setOnClickListener(v -> showPreviousCard());
        btnFlashcardNext.setOnClickListener(v -> showNextCard());
        btnPlayWordAudio.setOnClickListener(v -> {
            if (flashcards != null && !flashcards.isEmpty()) {
                Flashcard card = flashcards.get(currentCardIndex);
                String textToSpeak = card.getFrontText();
                tts.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, null);
            }
        });
        btnPlayExampleAudio.setOnClickListener(v -> {
            if (flashcards != null && !flashcards.isEmpty()) {
                Flashcard card = flashcards.get(currentCardIndex);
                String textToSpeak = card.getExampleSentence();
                tts.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, null);
            }
        });
    }

    private void flipCardWithAnimation() {
        View cardView = findViewById(R.id.flashcardCardView);
        AnimatorSet outAnim = (AnimatorSet) AnimatorInflater.loadAnimator(this, R.animator.card_flip_out);
        AnimatorSet inAnim = (AnimatorSet) AnimatorInflater.loadAnimator(this, R.animator.card_flip_in);
        outAnim.setTarget(cardView);
        inAnim.setTarget(cardView);
        outAnim.start();
        outAnim.addListener(new android.animation.AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(android.animation.Animator animation) {
                isCardFlipped = !isCardFlipped;
                displayCurrentCard();
                inAnim.start();
            }
        });
    }

    private void displayCurrentCard() {
        if (flashcards == null || flashcards.isEmpty()) return;
        
        Flashcard card = flashcards.get(currentCardIndex);
        tvProgress.setText(String.format("Card %d/%d", currentCardIndex + 1, flashcards.size()));
        
        // Update progress bar
        int progress = ((currentCardIndex + 1) * 100) / flashcards.size();
        flashcardProgressBar.setProgress(progress);
        
        if (isCardFlipped) {
            tvFlashcardText.setText(card.getBackText());
            tvFlashcardHint.setText("Tap image to see word");
            tvFlashcardHint.setTextSize(20);
            tvFlashcardExample.setVisibility(View.VISIBLE);
            tvFlashcardExample.setText(card.getExampleSentence());
            btnPlayExampleAudio.setVisibility(View.VISIBLE);
        } else {
            tvFlashcardText.setText(card.getFrontText());
            tvFlashcardHint.setText("Tap image to reveal answer");
            tvFlashcardHint.setTextSize(20);
            tvFlashcardExample.setVisibility(View.GONE);
            btnPlayExampleAudio.setVisibility(View.GONE);
        }

        // Hiển thị ảnh minh họa nếu có
        if (card.getImageUrl() != null && !card.getImageUrl().isEmpty()) {
            Glide.with(this).load(card.getImageUrl()).placeholder(R.drawable.flashcard_exp).into(imgFlashcard);
        } else {
            imgFlashcard.setImageResource(R.drawable.flashcard_exp);
        }
        // updateNavigationButtons(); // Nếu có nút điều hướng thì xử lý riêng
        // updateDifficultyButtons(); // Nếu có nút đánh giá thì xử lý riêng
    }

    private void flipCard() {
        isCardFlipped = !isCardFlipped;
        displayCurrentCard();
    }

    private void showPreviousCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            isCardFlipped = false;
            displayCurrentCard();
        }
    }

    private void showNextCard() {
        if (currentCardIndex < flashcards.size() - 1) {
            currentCardIndex++;
            isCardFlipped = false;
            displayCurrentCard();
        } else {
            showLearningComplete();
        }
    }



    private void showLearningComplete() {
        Toast.makeText(this, "Congratulations! You've completed all flashcards!", Toast.LENGTH_LONG).show();
        // Cập nhật tiến độ học flashcard vào Firestore
        if (userId != null && currentTopic != null) {
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            // Lưu vào subcollection flashcard_progress (1 document cho mỗi bộ)
            db.collection("users").document(userId)
                .collection("flashcard_progress").document(currentTopic)
                .set(new java.util.HashMap<String, Object>() {{
                    put("completed", true);
                    put("timestamp", System.currentTimeMillis());
                }});
            // Gọi BadgeManager để trao badge nếu đủ điều kiện
            BadgeManager badgeManager = new BadgeManager(userId);
            badgeManager.checkAndAwardFlashcardBadge();
            badgeManager.updateLearningStreakAndCheckBadge(); // Gọi cập nhật streak học tập
            updateLearningHistory(userId); // <-- Thêm dòng này
        }
        finish();
    }

    // Cập nhật learningHistory khi user học xong
    private void updateLearningHistory(String userId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
        db.collection("users").document(userId).get().addOnSuccessListener(documentSnapshot -> {
            Map<String, Boolean> history = (Map<String, Boolean>) documentSnapshot.get("learningHistory");
            if (history == null) history = new HashMap<>();
            history.put(today, true);
            db.collection("users").document(userId)
                .update("learningHistory", history);
        });
    }

    private void setupBottomNavigation() {
        com.google.android.material.bottomnavigation.BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            Intent intent = null;
            if (id == R.id.nav_home) {
                intent = new Intent(this, StudentHomeActivity.class);
            } else if (id == R.id.nav_learn) {
                // Đang ở màn hình này, không chuyển
                return true;
            } else if (id == R.id.nav_badge) {
                intent = new Intent(this, BadgesScreenActivity.class);
            } else if (id == R.id.nav_setting) {
                intent = new Intent(this, SettingsActivity.class);
            }
            if (intent != null) {
                intent.putExtra("user_email", userEmail);
                startActivity(intent);
                // finish(); // Nếu muốn đóng màn hiện tại
            }
            return true;
        });
        // Đặt mục Learn được chọn mặc định
        bottomNavigationView.setSelectedItemId(R.id.nav_learn);
    }

    private void fetchFlashcardSets() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
db.collection("users").document(userId).get().addOnSuccessListener(userDoc -> {
    if (!userDoc.exists()) return;
    String classId = null;
    Object classIdsObj = userDoc.get("class_ids");
    if (classIdsObj instanceof java.util.List && !((java.util.List<?>) classIdsObj).isEmpty()) {
        classId = (String) ((java.util.List<?>) classIdsObj).get(0);
    } else if (userDoc.contains("class_id")) {
        classId = userDoc.getString("class_id");
    }
    if (classId == null || classId.isEmpty()) {
        Toast.makeText(this, "Không tìm thấy lớp học của bạn!", Toast.LENGTH_SHORT).show();
        return;
    }
    db.collection("classes").document(classId).get().addOnSuccessListener(classDoc -> {
        if (!classDoc.exists()) {
            Toast.makeText(this, "Không tìm thấy thông tin lớp học!", Toast.LENGTH_SHORT).show();
            return;
        }
        String courseId = classDoc.getString("course_id");
        if (courseId == null || courseId.isEmpty()) {
            Toast.makeText(this, "Không tìm thấy khoá học của bạn!", Toast.LENGTH_SHORT).show();
            return;
        }
        db.collection("flashcard_sets").whereEqualTo("course_id", courseId).get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    flashcardSetIds.clear();
                    setIdToTitle.clear();
                    tabLayout.removeAllTabs();
                    for (DocumentSnapshot doc : queryDocumentSnapshots) {
                        String docId = doc.getId(); // Lấy document ID thực sự
                        String title = doc.getString("title");
                        if (docId != null && title != null) {
                            flashcardSetIds.add(docId);
                            setIdToTitle.put(docId, title);
                            tabLayout.addTab(tabLayout.newTab().setText(title));
                        }
                    }
                    if (!flashcardSetIds.isEmpty()) {
                        currentTopic = setIdToTitle.get(flashcardSetIds.get(0));
                        tabLayout.selectTab(tabLayout.getTabAt(0));
                        setupFlashcards(); // sẽ luôn map từ title sang documentId
                        // Kiểm tra nếu bộ flashcard không có dữ liệu thì ẩn UI bên dưới
                        // (Xử lý này nằm trong setupFlashcards, nhưng đảm bảo luôn gọi đúng)
                    }
                    tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
                        @Override
                        public void onTabSelected(TabLayout.Tab tab) {
                            int pos = tab.getPosition();
                            if (pos >= 0 && pos < flashcardSetIds.size()) {
                                currentTopic = setIdToTitle.get(flashcardSetIds.get(pos));
                                setupFlashcards();
                                currentCardIndex = 0;
                                isCardFlipped = false;
                                animateFlashcardChange();
                                displayCurrentCard();
                            }
                        }

                        @Override
                        public void onTabUnselected(TabLayout.Tab tab) {}
                        @Override
                        public void onTabReselected(TabLayout.Tab tab) {}
                    });
                });
    });
});
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
} 