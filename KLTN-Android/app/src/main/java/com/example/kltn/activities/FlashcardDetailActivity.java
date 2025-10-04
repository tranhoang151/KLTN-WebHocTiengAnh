package com.example.kltn.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.R;
import com.example.kltn.adapters.FlashcardAdapter;
import com.example.kltn.models.Flashcard;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Base64;
import android.view.LayoutInflater;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import androidx.annotation.Nullable;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class FlashcardDetailActivity extends AppCompatActivity {
    private ImageView btnBack;
    private TextView tvTitle, tvDescription, tvCardCount;
    private RecyclerView recyclerView;
    private FlashcardAdapter adapter;
    private List<Flashcard> flashcards = new ArrayList<>();
    private String flashcardSetId;
    private String flashcardSetTitle;
    private String flashcardSetDescription;
    private static final int PICK_IMAGE_REQUEST = 1010;
    private String selectedImageBase64 = null;
    private ImageView ivPreviewDialog;
    private EditText etImageUrlDialog;
    private AlertDialog addDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_flashcard_detail);

        // Lấy dữ liệu từ Intent
        flashcardSetId = getIntent().getStringExtra("flashcard_set_id");
        flashcardSetTitle = getIntent().getStringExtra("flashcard_set_title");
        flashcardSetDescription = getIntent().getStringExtra("flashcard_set_description");

        initViews();
        setupClickListeners();
        loadFlashcards();
        FloatingActionButton fabAdd = findViewById(R.id.fabAddFlashcard);
        fabAdd.setOnClickListener(v -> showAddFlashcardDialog());

        // Đăng ký callback cho Adapter
        adapter.setOnFlashcardActionListener(new FlashcardAdapter.OnFlashcardActionListener() {
            @Override
            public void onEdit(Flashcard flashcard) {
                showEditFlashcardDialog(flashcard);
            }
            @Override
            public void onDelete(Flashcard flashcard) {
                confirmDeleteFlashcard(flashcard);
            }
        });
    }

    private void initViews() {
        btnBack = findViewById(R.id.btnBack);
        tvTitle = findViewById(R.id.tvTitle);
        tvDescription = findViewById(R.id.tvDescription);
        tvCardCount = findViewById(R.id.tvCardCount);
        recyclerView = findViewById(R.id.recyclerView);

        // Set title và description
        tvTitle.setText(flashcardSetTitle);
        tvDescription.setText(flashcardSetDescription);

        // Setup RecyclerView
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new FlashcardAdapter(flashcards);
        recyclerView.setAdapter(adapter);
    }

    private void setupClickListeners() {
        btnBack.setOnClickListener(v -> finish());
    }

    private void loadFlashcards() {
        if (flashcardSetId == null || flashcardSetId.isEmpty()) {
            Toast.makeText(this, "Không tìm thấy flashcard set", Toast.LENGTH_SHORT).show();
            return;
        }

        android.util.Log.d("FlashcardDetail", "Loading flashcards for set ID: " + flashcardSetId);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        
        // Truy cập subcollection cards trong flashcard_sets
        db.collection("flashcard_sets")
            .document(flashcardSetId)
            .collection("cards")
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                android.util.Log.d("FlashcardDetail", "Query successful, found " + queryDocumentSnapshots.size() + " cards in flashcard_sets/" + flashcardSetId + "/cards");
                
                flashcards.clear();
                for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                    android.util.Log.d("FlashcardDetail", "Processing card document: " + doc.getId());
                    android.util.Log.d("FlashcardDetail", "Card data: " + doc.getData());
                    
                    Flashcard flashcard = new Flashcard();
                    flashcard.setId(doc.getId());
                    flashcard.setFlashcardSetId(flashcardSetId);
                    flashcard.setFrontText(doc.getString("front_text"));
                    flashcard.setBackText(doc.getString("back_text"));
                    flashcard.setExampleSentence(doc.getString("example_sentence"));
                    flashcard.setImageUrl(doc.getString("image_url"));
                    flashcard.setImageBase64(doc.getString("image_base64"));
                    
                    // Xử lý order field
                    Object orderObj = doc.get("order");
                    if (orderObj instanceof Long) {
                        flashcard.setOrder(((Long) orderObj).intValue());
                    } else if (orderObj instanceof Integer) {
                        flashcard.setOrder((Integer) orderObj);
                    } else {
                        flashcard.setOrder(0);
                    }
                    
                    flashcards.add(flashcard);
                    android.util.Log.d("FlashcardDetail", "Added flashcard: " + flashcard.getFrontText() + " -> " + flashcard.getBackText());
                }
                
                // Sắp xếp theo order sau khi load
                flashcards.sort((f1, f2) -> Integer.compare(f1.getOrder(), f2.getOrder()));
                
                // Update card count
                tvCardCount.setText(flashcards.size() + " cards");
                
                // Update adapter
                adapter.notifyDataSetChanged();
                
                if (flashcards.isEmpty()) {
                    Toast.makeText(this, "Chưa có flashcard nào trong bộ này", Toast.LENGTH_SHORT).show();
                }
            })
            .addOnFailureListener(e -> {
                android.util.Log.e("FlashcardDetail", "Error loading flashcards: " + e.getMessage(), e);
                Toast.makeText(this, "Lỗi tải flashcards: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            });
    }

    private void showAddFlashcardDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_edit_flashcard, null);
        builder.setView(dialogView);
        addDialog = builder.create();

        EditText etFrontText = dialogView.findViewById(R.id.etFrontText);
        EditText etBackText = dialogView.findViewById(R.id.etBackText);
        EditText etExampleSentence = dialogView.findViewById(R.id.etExampleSentence);
        etImageUrlDialog = dialogView.findViewById(R.id.etImageUrl);
        ivPreviewDialog = dialogView.findViewById(R.id.ivPreview);
        Button btnPickImage = dialogView.findViewById(R.id.btnPickImage);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnSave = dialogView.findViewById(R.id.btnSave);

        selectedImageBase64 = null;
        ivPreviewDialog.setImageDrawable(null);

        btnPickImage.setOnClickListener(v -> openImagePicker());
        btnCancel.setOnClickListener(v -> addDialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String front = etFrontText.getText().toString().trim();
            String back = etBackText.getText().toString().trim();
            String example = etExampleSentence.getText().toString().trim();
            String imageUrl = etImageUrlDialog.getText().toString().trim();

            if (front.isEmpty() || back.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập đủ mặt trước và mặt sau", Toast.LENGTH_SHORT).show();
                return;
            }

            // Tính order tự động
            int order = flashcards.size() + 1;

            // Tạo dữ liệu flashcard
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("front_text", front);
            data.put("back_text", back);
            data.put("example_sentence", example);
            data.put("order", order);
            if (!TextUtils.isEmpty(selectedImageBase64)) {
                data.put("image_base64", selectedImageBase64);
                data.put("image_url", "");
            } else {
                data.put("image_url", imageUrl);
                data.put("image_base64", "");
            }

            FirebaseFirestore db = FirebaseFirestore.getInstance();
            db.collection("flashcard_sets")
                .document(flashcardSetId)
                .collection("cards")
                .add(data)
                .addOnSuccessListener(docRef -> {
                    Toast.makeText(this, "Đã thêm flashcard mới!", Toast.LENGTH_SHORT).show();
                    addDialog.dismiss();
                    loadFlashcards();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Lỗi thêm flashcard: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
        });

        addDialog.show();
    }

    private void showEditFlashcardDialog(Flashcard flashcard) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_edit_flashcard, null);
        builder.setView(dialogView);
        AlertDialog editDialog = builder.create();

        EditText etFrontText = dialogView.findViewById(R.id.etFrontText);
        EditText etBackText = dialogView.findViewById(R.id.etBackText);
        EditText etExampleSentence = dialogView.findViewById(R.id.etExampleSentence);
        EditText etImageUrl = dialogView.findViewById(R.id.etImageUrl);
        ImageView ivPreview = dialogView.findViewById(R.id.ivPreview);
        Button btnPickImage = dialogView.findViewById(R.id.btnPickImage);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnSave = dialogView.findViewById(R.id.btnSave);

        // Gán dữ liệu cũ
        etFrontText.setText(flashcard.getFrontText());
        etBackText.setText(flashcard.getBackText());
        etExampleSentence.setText(flashcard.getExampleSentence());
        etImageUrl.setText(flashcard.getImageUrl());
        String[] selectedImageBase64 = {flashcard.getImageBase64()};
        if (flashcard.getImageBase64() != null && !flashcard.getImageBase64().isEmpty()) {
            byte[] decodedString = android.util.Base64.decode(flashcard.getImageBase64(), android.util.Base64.DEFAULT);
            android.graphics.Bitmap decodedByte = android.graphics.BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            ivPreview.setImageBitmap(decodedByte);
        } else if (flashcard.getImageUrl() != null && !flashcard.getImageUrl().isEmpty()) {
            com.bumptech.glide.Glide.with(this).load(flashcard.getImageUrl()).into(ivPreview);
        } else {
            ivPreview.setImageDrawable(null);
        }

        btnPickImage.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            intent.setType("image/*");
            startActivityForResult(intent, PICK_IMAGE_REQUEST + 1000); // Phân biệt với thêm mới
            // Lưu callback tạm thời
            this.tempEditDialog = editDialog;
            this.tempEditIvPreview = ivPreview;
            this.tempEditEtImageUrl = etImageUrl;
            this.tempEditSelectedImageBase64 = selectedImageBase64;
        });
        btnCancel.setOnClickListener(v -> editDialog.dismiss());
        btnSave.setOnClickListener(v -> {
            String front = etFrontText.getText().toString().trim();
            String back = etBackText.getText().toString().trim();
            String example = etExampleSentence.getText().toString().trim();
            String imageUrl = etImageUrl.getText().toString().trim();
            String imageBase64 = selectedImageBase64[0];
            if (front.isEmpty() || back.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập đủ mặt trước và mặt sau", Toast.LENGTH_SHORT).show();
                return;
            }
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("front_text", front);
            data.put("back_text", back);
            data.put("example_sentence", example);
            data.put("order", flashcard.getOrder());
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            if (imageBase64 != null && !imageBase64.isEmpty()) {
                // Xóa trường base64 cũ trước khi lưu mới
                db.collection("flashcard_sets")
                    .document(flashcardSetId)
                    .collection("cards")
                    .document(flashcard.getId())
                    .update("image_base64", com.google.firebase.firestore.FieldValue.delete())
                    .addOnSuccessListener(unused -> {
                        data.put("image_base64", imageBase64);
                        data.put("image_url", "");
                        db.collection("flashcard_sets")
                            .document(flashcardSetId)
                            .collection("cards")
                            .document(flashcard.getId())
                            .update(data)
                            .addOnSuccessListener(u -> {
                                Toast.makeText(this, "Đã cập nhật flashcard!", Toast.LENGTH_SHORT).show();
                                editDialog.dismiss();
                                loadFlashcards();
                            })
                            .addOnFailureListener(e -> {
                                Toast.makeText(this, "Lỗi cập nhật flashcard: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                            });
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi xóa ảnh cũ: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
            } else {
                data.put("image_url", imageUrl);
                data.put("image_base64", "");
                db.collection("flashcard_sets")
                    .document(flashcardSetId)
                    .collection("cards")
                    .document(flashcard.getId())
                    .set(data)
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(this, "Đã cập nhật flashcard!", Toast.LENGTH_SHORT).show();
                        editDialog.dismiss();
                        loadFlashcards();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi cập nhật flashcard: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
            }
        });
        editDialog.show();
    }

    // Biến tạm để nhận ảnh khi sửa
    private AlertDialog tempEditDialog;
    private ImageView tempEditIvPreview;
    private EditText tempEditEtImageUrl;
    private String[] tempEditSelectedImageBase64;

    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        intent.setType("image/*");
        startActivityForResult(intent, PICK_IMAGE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            // Thêm mới
            Uri imageUri = data.getData();
            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(this.getContentResolver(), imageUri);
                ivPreviewDialog.setImageBitmap(bitmap);
                selectedImageBase64 = bitmapToBase64(bitmap);
                etImageUrlDialog.setText("");
            } catch (IOException e) {
                Toast.makeText(this, "Lỗi chọn ảnh: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == PICK_IMAGE_REQUEST + 1000 && resultCode == RESULT_OK && data != null && data.getData() != null) {
            // Sửa
            Uri imageUri = data.getData();
            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(this.getContentResolver(), imageUri);
                if (tempEditIvPreview != null) tempEditIvPreview.setImageBitmap(bitmap);
                if (tempEditSelectedImageBase64 != null) tempEditSelectedImageBase64[0] = bitmapToBase64(bitmap);
                if (tempEditEtImageUrl != null) tempEditEtImageUrl.setText("");
            } catch (IOException e) {
                Toast.makeText(this, "Lỗi chọn ảnh: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private String bitmapToBase64(Bitmap bitmap) {
        // Resize ảnh nếu quá lớn
        int maxSize = 600;
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        if (width > maxSize || height > maxSize) {
            float ratio = Math.min((float)maxSize / width, (float)maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
        }
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 60, baos); // Giảm chất lượng xuống 60
        byte[] bytes = baos.toByteArray();
        return Base64.encodeToString(bytes, Base64.DEFAULT);
    }

    private void confirmDeleteFlashcard(Flashcard flashcard) {
        new AlertDialog.Builder(this)
            .setTitle("Xoá flashcard")
            .setMessage("Bạn có chắc muốn xoá thẻ này không?")
            .setPositiveButton("Xoá", (dialog, which) -> {
                FirebaseFirestore db = FirebaseFirestore.getInstance();
                db.collection("flashcard_sets")
                    .document(flashcardSetId)
                    .collection("cards")
                    .document(flashcard.getId())
                    .delete()
                    .addOnSuccessListener(unused -> {
                        Toast.makeText(this, "Đã xoá flashcard!", Toast.LENGTH_SHORT).show();
                        loadFlashcards();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi xoá flashcard: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
            })
            .setNegativeButton("Huỷ", null)
            .show();
    }
} 