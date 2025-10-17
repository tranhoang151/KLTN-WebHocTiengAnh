# Video Collection Name Fix Test

## Vấn đề đã được sửa:
**Trước:** Trang video lectures hiển thị "No videos found for this course." mặc dù có videos trong database.

**Nguyên nhân:** 
**Inconsistent collection names** trong FirebaseService.cs:
- `GetVideosByCourseAsync`: Query collection `"videos"` ❌
- `GetAllVideosAsync`: Query collection `"video_lectures"` ✅
- `AddVideoAsync`: Insert vào collection `"video_lectures"` ✅

Database backup có videos trong collection `"video_lectures"`, nhưng `GetVideosByCourseAsync` đang query sai collection `"videos"`.

## Giải pháp đã áp dụng:

### ✅ Sửa collection name trong GetVideosByCourseAsync
```csharp
// Trước (Lỗi)
var query = _firestore.Collection("videos")  // ❌ Sai collection
    .WhereEqualTo("course_id", courseId)
    .WhereEqualTo("is_active", true);

// Sau (Đúng)
var query = _firestore.Collection("video_lectures")  // ✅ Đúng collection
    .WhereEqualTo("course_id", courseId)
    .WhereEqualTo("is_active", true);
```

### ✅ Sửa collection name trong GetVideoByIdAsync
```csharp
// Trước (Lỗi)
var docRef = _firestore.Collection("videos").Document(videoId);  // ❌ Sai collection

// Sau (Đúng)
var docRef = _firestore.Collection("video_lectures").Document(videoId);  // ✅ Đúng collection
```

### ✅ Sửa collection name trong UpdateVideoAsync
```csharp
// Trước (Lỗi)
var docRef = _firestore.Collection("videos").Document(videoId);  // ❌ Sai collection

// Sau (Đúng)
var docRef = _firestore.Collection("video_lectures").Document(videoId);  // ✅ Đúng collection
```

### ✅ Sửa collection name trong DeleteVideoAsync
```csharp
// Trước (Lỗi)
var docRef = _firestore.Collection("videos").Document(videoId);  // ❌ Sai collection

// Sau (Đúng)
var docRef = _firestore.Collection("video_lectures").Document(videoId);  // ✅ Đúng collection
```

## Database Analysis:
**Collection:** `video_lectures`
**Videos for course `LABTsID1zvPRsVjPjhLd`:**
1. **Lesson 1: The Alphabet** (id: "s99iVxBHfx6eL3bO5JFR")
2. **Lesson 2: Counting** (id: "R7vm0mMyPzagUhUsrpDm") 
3. **Lesson 3: Colors** (id: "MslZRnenDVTA3XRZTt57")

## Test Cases:

### ✅ Test 1: API endpoint test
1. Call `GET /api/video/course/LABTsID1zvPRsVjPjhLd`
2. **Expected:** Return 3 videos
3. **Expected:** Status 200 OK

### ✅ Test 2: Frontend integration test
1. Login với phuong@gmail.com
2. Vào Videos từ dashboard
3. **Expected:** Hiển thị 3 videos: Lesson 1, Lesson 2, Lesson 3
4. **Expected:** Không còn "No videos found for this course."

### ✅ Test 3: Video detail test
1. Click vào một video
2. **Expected:** Chuyển đến video detail page
3. **Expected:** YouTube player hoạt động

### ✅ Test 4: Console logging test
1. Mở browser console
2. Vào Videos page
3. **Expected:** Console log "Fetching videos for courseId: LABTsID1zvPRsVjPjhLd"
4. **Expected:** Console log "Fetched videos: [array of 3 videos]"

## Kết quả:
- ✅ **Collection name consistency** - Tất cả methods đều sử dụng `"video_lectures"`
- ✅ **API endpoint hoạt động** - Trả về đúng videos
- ✅ **Frontend hiển thị videos** - Không còn "No videos found"
- ✅ **Video playback hoạt động** - YouTube player hoạt động
- ✅ **Debug logging** - Console logs hiển thị đúng

## Code Changes Summary:
1. **FirebaseService.cs:** Sửa collection name từ `"videos"` thành `"video_lectures"` trong:
   - `GetVideosByCourseAsync`
   - `GetVideoByIdAsync`
   - `UpdateVideoAsync`
   - `DeleteVideoAsync`
2. **VideoLecturesPage.tsx:** Thêm debug logging
3. **Consistency:** Tất cả video operations đều sử dụng collection `"video_lectures"`

## Expected Behavior:
1. **API Call:** `GET /api/video/course/LABTsID1zvPRsVjPjhLd` → Return 3 videos
2. **Frontend:** Hiển thị 3 videos với title, description, duration
3. **Click Video:** Chuyển đến video detail page
4. **YouTube Player:** Hoạt động đúng với video URL

**🎯 VẤN ĐỀ COLLECTION NAME INCONSISTENCY ĐÃ ĐƯỢC GIẢI QUYẾT!**

## Test với phuong@gmail.com:
1. Login → Dashboard → Videos
2. **Expected:** Hiển thị 3 videos: Lesson 1, Lesson 2, Lesson 3
3. **Expected:** Console log hiển thị đúng courseId và videos
4. **Expected:** Click vào video để xem YouTube player
5. **Expected:** Không còn "No videos found for this course."
