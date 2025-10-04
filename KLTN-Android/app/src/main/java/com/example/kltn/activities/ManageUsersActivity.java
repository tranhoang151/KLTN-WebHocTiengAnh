package com.example.kltn.activities;

import android.os.Bundle;



import androidx.appcompat.app.AppCompatActivity;

import com.example.kltn.R;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.kltn.adapters.UserAdapter;
import com.example.kltn.models.User;
import java.util.ArrayList;
import java.util.List;
import android.app.AlertDialog;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.Toast;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Button;
import android.widget.ImageView;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import android.net.Uri;
import com.bumptech.glide.Glide;
import android.text.Editable;
import android.text.TextWatcher;


public class ManageUsersActivity extends AppCompatActivity implements UserAdapter.OnUserActionListener {

    private List<User> userList;
    private UserAdapter adapter;
    private static final int PICK_IMAGE_REQUEST = 1001;
    private String avatarBase64 = "";
    private ImageView imgAvatarDialog; // dùng cho dialog thêm user
    private List<User> filteredUserList = new ArrayList<>();
    private static final int PICK_IMAGE_EDIT_REQUEST = 1002;
    private String editAvatarBase64 = "";
    private ImageView imgEditAvatarDialog;
    private String editingUserId = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_manage_users);

        RecyclerView rvUsers = findViewById(R.id.rv_users);
        rvUsers.setLayoutManager(new LinearLayoutManager(this));

        userList = new ArrayList<>();
        filteredUserList = new ArrayList<>();
        adapter = new UserAdapter(filteredUserList, this);
        rvUsers.setAdapter(adapter);

        // Load users from Firestore
        loadUsersFromFirestore();

        // Setup nút thêm user
        findViewById(R.id.btn_add_user).setOnClickListener(v -> showAddUserDialog());
        // Thiết lập search realtime
        EditText etSearch = findViewById(R.id.et_search);
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterUsers(s.toString());
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void loadUsersFromFirestore() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users")
          .whereIn("role", java.util.Arrays.asList("teacher", "student"))
          .get()
          .addOnSuccessListener(queryDocumentSnapshots -> {
              userList.clear();
              for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                  User user = doc.toObject(User.class);
                  user.setUser_id(doc.getId());
                  userList.add(user);
              }
              filterUsers(""); // Hiển thị toàn bộ khi load xong
          });
    }

    private void filterUsers(String query) {
        filteredUserList.clear();
        if (query == null || query.trim().isEmpty()) {
            filteredUserList.addAll(userList);
        } else {
            String lower = query.toLowerCase();
            for (User user : userList) {
                if ((user.getFull_name() != null && user.getFull_name().toLowerCase().contains(lower)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(lower))) {
                    filteredUserList.add(user);
                }
            }
        }
        adapter.notifyDataSetChanged();
    }

    private void showAddUserDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_add_user, null);

        // Setup spinner cho role
        Spinner spinnerRole = dialogView.findViewById(R.id.spinner_role);
        String[] roles = {"Student", "Teacher"};
        ArrayAdapter<String> roleAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, roles);
        roleAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerRole.setAdapter(roleAdapter);

        Spinner spinnerGender = dialogView.findViewById(R.id.spinner_gender);
        String[] genders = {"Nam", "Nữ", "Khác"};
        ArrayAdapter<String> genderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, genders);
        genderAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerGender.setAdapter(genderAdapter);

        imgAvatarDialog = dialogView.findViewById(R.id.img_avatar);
        Button btnPickAvatar = dialogView.findViewById(R.id.btn_pick_avatar);
        btnPickAvatar.setOnClickListener(v -> openImagePicker());

        builder.setView(dialogView);
        AlertDialog dialog = builder.create();

        // Xử lý nút Cancel
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel);
        btnCancel.setOnClickListener(v -> dialog.dismiss());

        // Xử lý nút Add User
        Button btnAdd = dialogView.findViewById(R.id.btn_add);
        btnAdd.setOnClickListener(v -> {
            EditText etName = dialogView.findViewById(R.id.et_user_name);
            EditText etEmail = dialogView.findViewById(R.id.et_user_email);
            EditText etPassword = dialogView.findViewById(R.id.et_user_password);
            String name = etName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();
            String role = spinnerRole.getSelectedItem().toString().toLowerCase(); // luôn lưu chữ thường
            String gender = spinnerGender.getSelectedItem().toString();
            if (name.isEmpty()) {
                etName.setError("Name is required");
                return;
            }
            if (email.isEmpty()) {
                etEmail.setError("Email is required");
                return;
            }
            if (password.isEmpty()) {
                etPassword.setError("Password is required");
                return;
            }
            if (avatarBase64.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn ảnh đại diện!", Toast.LENGTH_SHORT).show();
                return;
            }
            addUserToFirestore(name, email, gender, password, role, avatarBase64, dialog);
        });

        dialog.show();
    }

    private void openImagePicker() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(Intent.createChooser(intent, "Chọn ảnh đại diện"), PICK_IMAGE_REQUEST);
    }

    private void openEditImagePicker() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(Intent.createChooser(intent, "Chọn ảnh đại diện"), PICK_IMAGE_EDIT_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();
            try {
                InputStream inputStream = getContentResolver().openInputStream(imageUri);
                Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 70, baos);
                byte[] imageBytes = baos.toByteArray();
                if (imageBytes.length > 200 * 1024) {
                    Toast.makeText(this, "Ảnh quá lớn, hãy chọn ảnh nhỏ hơn!", Toast.LENGTH_LONG).show();
                    return;
                }
                avatarBase64 = Base64.encodeToString(imageBytes, Base64.DEFAULT);
                Glide.with(this).load(scaledBitmap).circleCrop().into(imgAvatarDialog);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (requestCode == PICK_IMAGE_EDIT_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();
            try {
                InputStream inputStream = getContentResolver().openInputStream(imageUri);
                Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                Bitmap scaledBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 70, baos);
                byte[] imageBytes = baos.toByteArray();
                if (imageBytes.length > 200 * 1024) {
                    Toast.makeText(this, "Ảnh quá lớn, hãy chọn ảnh nhỏ hơn!", Toast.LENGTH_LONG).show();
                    return;
                }
                if (editingUserId != null) {
                    FirebaseFirestore.getInstance().collection("users").document(editingUserId)
                        .update("avatar_base64", "")
                        .addOnSuccessListener(aVoid -> {
                            editAvatarBase64 = Base64.encodeToString(imageBytes, Base64.DEFAULT);
                            if (imgEditAvatarDialog != null) {
                                Glide.with(this).load(scaledBitmap).circleCrop().into(imgEditAvatarDialog);
                            }
                        })
                        .addOnFailureListener(e -> {
                            Toast.makeText(this, "Lỗi khi xóa ảnh cũ: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        });
                } else {
                    editAvatarBase64 = Base64.encodeToString(imageBytes, Base64.DEFAULT);
                    if (imgEditAvatarDialog != null) {
                        Glide.with(this).load(scaledBitmap).circleCrop().into(imgEditAvatarDialog);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void addUserToFirestore(String name, String email, String gender, String password, String role, String avatarBase64, AlertDialog dialog) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        String userId = db.collection("users").document().getId();
        java.util.Map<String, Object> user = new java.util.HashMap<>();
        user.put("full_name", name);
        user.put("email", email);
        user.put("gender", gender);
        user.put("password", password);
        user.put("role", role);
        user.put("avatar_base64", avatarBase64);
        user.put("user_id", userId);
        db.collection("users").document(userId)
            .set(user)
            .addOnSuccessListener(aVoid -> {
                Toast.makeText(this, "Thêm người dùng thành công!", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                loadUsersFromFirestore();
            })
            .addOnFailureListener(e -> {
                Toast.makeText(this, "Lỗi khi thêm người dùng: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            });
    }

    @Override
    public void onUserAction(User user, String action) {
        if ("edit".equals(action)) {
            showEditUserDialog(user);
        } else if ("delete".equals(action)) {
            showDeleteConfirmation(user);
        }
    }

    private void showEditDialog(User user) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_edit_user, null);

        builder.setView(dialogView);
        AlertDialog dialog = builder.create();

        // Xử lý nút "Sửa thông tin"
        View btnEditUser = dialogView.findViewById(R.id.btn_edit_user);
        btnEditUser.setOnClickListener(v -> {
            dialog.dismiss();
            showEditUserDialog(user);
        });

        // Xử lý nút "Xóa người dùng"
        View btnDeleteUser = dialogView.findViewById(R.id.btn_delete_user);
        btnDeleteUser.setOnClickListener(v -> {
            dialog.dismiss();
            showDeleteConfirmation(user);
        });

        dialog.show();
    }

    private void showEditUserDialog(User user) {
        editingUserId = user.getUser_id();
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_edit_user_info, null);

        EditText etName = dialogView.findViewById(R.id.et_edit_user_name);
        EditText etEmail = dialogView.findViewById(R.id.et_edit_user_email);
        EditText etPassword = dialogView.findViewById(R.id.et_edit_user_password);
        imgEditAvatarDialog = dialogView.findViewById(R.id.iv_user_avatar);
        Spinner spinnerGender = dialogView.findViewById(R.id.spinner_gender);
        Button btnChangeAvatar = dialogView.findViewById(R.id.btn_change_avatar);
        Button btnCancel = dialogView.findViewById(R.id.btn_cancel_edit);
        Button btnSave = dialogView.findViewById(R.id.btn_save_edit);
        ImageButton btnDelete = dialogView.findViewById(R.id.btn_delete_user);

        // Setup gender spinner
        String[] genders = {"Nam", "Nữ", "Khác"};
        ArrayAdapter<String> genderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, genders);
        genderAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerGender.setAdapter(genderAdapter);

        // Lấy dữ liệu user từ Firestore để đảm bảo mới nhất
        FirebaseFirestore.getInstance().collection("users").document(user.getUser_id()).get().addOnSuccessListener(documentSnapshot -> {
            if (documentSnapshot.exists()) {
                String fullName = documentSnapshot.getString("full_name");
                String email = documentSnapshot.getString("email");
                String password = documentSnapshot.getString("password");
                String gender = documentSnapshot.getString("gender");
                String avatarBase64Firestore = documentSnapshot.getString("avatar_base64");
                etName.setText(fullName);
                etEmail.setText(email);
                etPassword.setText(password);
                // Set gender spinner
                if (gender != null) {
                    int pos = genderAdapter.getPosition(gender);
                    if (pos >= 0) spinnerGender.setSelection(pos);
                }
                editAvatarBase64 = avatarBase64Firestore != null ? avatarBase64Firestore : "";
                if (avatarBase64Firestore != null && !avatarBase64Firestore.isEmpty()) {
                    byte[] decodedString = Base64.decode(avatarBase64Firestore, Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    Glide.with(this).load(decodedByte).circleCrop().into(imgEditAvatarDialog);
                } else {
                    imgEditAvatarDialog.setImageResource(R.drawable.user);
                }
            }
        });

        btnChangeAvatar.setOnClickListener(v -> openEditImagePicker());
        builder.setView(dialogView);
        AlertDialog dialog = builder.create();
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnDelete.setOnClickListener(v ->{
            showDeleteConfirmation(user);
            dialog.dismiss();
        });
        btnSave.setOnClickListener(v -> {
            String newName = etName.getText().toString().trim();
            String newEmail = etEmail.getText().toString().trim();
            String newPassword = etPassword.getText().toString().trim();
            String newGender = spinnerGender.getSelectedItem().toString();
            if (newName.isEmpty()) {
                etName.setError("Name is required");
                return;
            }
            if (newEmail.isEmpty()) {
                etEmail.setError("Email is required");
                return;
            }
            if (newPassword.isEmpty()) {
                etPassword.setError("Password is required");
                return;
            }
            // Cập nhật Firestore
            FirebaseFirestore.getInstance().collection("users").document(user.getUser_id())
                .update("full_name", newName,
                        "email", newEmail,
                        "password", newPassword,
                        "gender", newGender,
                        "avatar_base64", editAvatarBase64)
                .addOnSuccessListener(aVoid -> {
                    Toast.makeText(this, "Cập nhật người dùng thành công!", Toast.LENGTH_SHORT).show();
                    dialog.dismiss();
                    loadUsersFromFirestore();
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Lỗi khi cập nhật: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
        });
        dialog.show();
    }

    private void showDeleteConfirmation(User user) {
        new AlertDialog.Builder(this)
            .setTitle("Xóa người dùng")
            .setMessage("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")
            .setPositiveButton("Xóa", (dialog, which) -> {
                FirebaseFirestore.getInstance().collection("users").document(user.getUser_id())
                    .delete()
                    .addOnSuccessListener(aVoid -> {
                        Toast.makeText(this, "Đã xóa người dùng thành công!", Toast.LENGTH_SHORT).show();
                        loadUsersFromFirestore();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Lỗi khi xóa: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }


}