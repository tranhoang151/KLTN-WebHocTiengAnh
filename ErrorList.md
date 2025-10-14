GET
/api/Flashcard/set/{setId}/cards

Parameters
Cancel
Name	Description
setId *
string
(path)
WjQLN8xuWrwbRu9BHeO0
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Flashcard/set/WjQLN8xuWrwbRu9BHeO0/cards' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiI0MjQwNzBkZC02ZmY5LTQ5Y2YtODk3Yy0yYWNmOWVmNWMwZjgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwNDYwMTcyLCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.YIIHam2xhOaoZFX3gG1Yj4frbDWVG8oF_Cn0zRa87cU'
Request URL
https://localhost:5001/api/Flashcard/set/WjQLN8xuWrwbRu9BHeO0/cards
Server response
Code	Details
200	
Response body
Download
[
  {
    "id": "ICWQDjlqvaBWbhv3GFVo",
    "flashcardSetId": "",
    "frontText": "Apple",
    "backText": "Quả táo",
    "exampleSentence": "I eat an apple every day.",
    "imageUrl": "https://trungtamtienghan.edu.vn/uploads/blog/2019_07/cach-noi-qua-tao-bang-tieng-han_1.jpg",
    "imageBase64": "",
    "order": 1
  },
  {
    "id": "O78U6NmVoekbO2VMg7FK",
    "flashcardSetId": "",
    "frontText": "Banana",
    "backText": "Quả chuối",
    "exampleSentence": "Monkeys like bananas.",
    "imageUrl": "https://namnguyenduoc.com/wp-content/uploads/2023/03/Chuoi.jpg",
    "imageBase64": "",
    "order": 2
  },
  {
    "id": "jwH6TlbACF5B75IeydC3",
    "flashcardSetId": "",
    "frontText": "Mango",
    "backText": "Quả xoài",
    "exampleSentence": "The mango is sweet.",
    "imageUrl": "https://kenh14cdn.com/203336854389633024/2024/2/28/photo-1-1709092179912776585807.png",
    "imageBase64": "",
    "order": 3
  },
  {
    "id": "iB05LVMPcMxS5WSbajss",
    "flashcardSetId": "",
    "frontText": "Orange",
    "backText": "Quả cam",
    "exampleSentence": "Orange juice is yummy.",
    "imageUrl": "https://e.khoahoc.tv/photos/image/2017/11/16/qua-cam-1.jpg",
    "imageBase64": "",
    "order": 4
  },
  {
    "id": "RbL1jpsGTho3UAXcwvb7",
    "flashcardSetId": "",
    "frontText": "Grapes",
    "backText": "Quả nho",
    "exampleSentence": "Grapes can be green or purple.",
    "imageUrl": "https://image.viettimes.vn/w800/Uploaded/2025/ovhipuo/2019_11_26/1nho_den_6677263_26112019.jpg",
    "imageBase64": "",
    "order": 5
  },
  {
    "id": "3kuDDsCMSYXhsOVjj9H4",
    "flashcardSetId": "",
    "frontText": "Watermelon",
    "backText": "Quả dưa hấu",
    "exampleSentence": "I eat watermelon in the summer.",
    "imageUrl": "https://lh5.googleusercontent.com/proxy/zgmI8P6cfZ9PnSfYuY3Gq_DOutlUMxZbpPR8TDgUlqjjaEV3EOTmQzVXvcWdxj18jpENMJsDECScMsai3ej3IEHiuJJPsyCaWSQc_g8_NfXNtOBDPBvgGgZ9cEP00kAmqamTzun6-nolhRzWltkPzeNq0EOjCIV74gzqu2sP6n9M1_KhKTlfU2SsvcgJfhLmSZCj1DjmehvoV1jdZDyC2EjWatmG",
    "imageBase64": "",
    "order": 6
  },
  {
    "id": "WInHDzoQjG4nWR0wh7og",
    "flashcardSetId": "",
    "frontText": "Strawberry",
    "backText": "Quả dâu tây",
    "exampleSentence": "I like strawberry ice cream.",
    "imageUrl": "https://suckhoedoisong.qltns.mediacdn.vn/2015/4-loi-ich-tuyet-voi-cua-dau-tay-4-1422241944000.jpg",
    "imageBase64": "",
    "order": 7
  },
  {
    "id": "uJCo3izZJVRUH8FSlxYW",
    "flashcardSetId": "",
    "frontText": "Pineapple",
    "backText": "Quả dứa",
    "exampleSentence": "Pineapple is yellow inside.",
    "imageUrl": "https://citifruit.com/uploads/images/Products/trai-cay/trai-thom-800x600.jpg",
    "imageBase64": "",
    "order": 8
  },
  {
    "id": "DZ7Yz3Nu9LL5mjCACx2H",
    "flashcardSetId": "",
    "frontText": "Papaya",
    "backText": "Quả đu đủ",
    "exampleSentence": "Papaya is good for health",
    "imageUrl": "https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2022/4/5/du-du-giup-vong-1-tro-nen-quyen-ru-11-1649175776756260503773.jpg",
    "imageBase64": "",
    "order": 9
  },
  {
    "id": "md6hWGCa49YJutIY6ZXX",
    "flashcardSetId": "",
    "frontText": "Lemon",
    "backText": "Quả chanh",
    "exampleSentence": "The lemon is sour.",
    "imageUrl": "https://minhcaumart.vn//media/com_eshop/products/resized/chanh-500x500.webp",
    "imageBase64": "",
    "order": 10
  }
]
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Mon,13 Oct 2025 16:43:54 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760373894 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
453 ms
Responses
Code	Description	Links
200	
Success



GET
/api/Flashcard/sets

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Flashcard/sets' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiI0MjQwNzBkZC02ZmY5LTQ5Y2YtODk3Yy0yYWNmOWVmNWMwZjgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwNDYwMTcyLCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.YIIHam2xhOaoZFX3gG1Yj4frbDWVG8oF_Cn0zRa87cU'
Request URL
https://localhost:5001/api/Flashcard/sets
Server response
Code	Details
200	
Response body
Download
[
  {
    "id": "WjQLN8xuWrwbRu9BHeO0",
    "title": "Fruits",
    "description": "Learn about fruits",
    "courseId": "1Tj7Zug9y2PtKCj3mR1X",
    "createdBy": "admin",
    "createdAt": {},
    "assignedClassIds": [],
    "setId": "fruits",
    "isActive": true
  },
  {
    "id": "XwauExYZSzgKiTTa2mcZ",
    "title": "Shool Things",
    "description": "Learning about school things",
    "courseId": "1Tj7Zug9y2PtKCj3mR1X",
    "createdBy": "admin",
    "createdAt": {},
    "assignedClassIds": [],
    "setId": "shool_things",
    "isActive": true
  },
  {
    "id": "animals",
    "title": "Animals",
    "description": "Learn basic animals",
    "courseId": "LABTsID1zvPRsVjPjhLd",
    "createdBy": "teacher_123",
    "createdAt": {},
    "assignedClassIds": [
      "class_1"
    ],
    "setId": "animals",
    "isActive": true
  },
  {
    "id": "colors",
    "title": "Colors",
    "description": "Learn basic colors",
    "courseId": "LABTsID1zvPRsVjPjhLd",
    "createdBy": "teacher_123",
    "createdAt": {},
    "assignedClassIds": [
      "class_1"
    ],
    "setId": "colors",
    "isActive": true
  },
  {
    "id": "eEH95vvRrEYPVaiX2hQb",
    "title": "test",
    "description": "test",
    "courseId": "1Tj7Zug9y2PtKCj3mR1X",
    "createdBy": "admin",
    "createdAt": {},
    "assignedClassIds": [],
    "setId": "test",
    "isActive": true
  },
  {
    "id": "numbers",
    "title": "Numbers",
    "description": "Learn basic numbers",
    "courseId": "LABTsID1zvPRsVjPjhLd",
    "createdBy": "teacher_123",
    "createdAt": {},
    "assignedClassIds": [
      "class_1"
    ],
    "setId": "numbers",
    "isActive": true
  },
  {
    "id": "uFLthmkMtQjU3Bf6x39a",
    "title": "My House",
    "description": "Learn about my house",
    "courseId": "1Tj7Zug9y2PtKCj3mR1X",
    "createdBy": "admin",
    "createdAt": {},
    "assignedClassIds": [],
    "setId": "my_house",
    "isActive": true
  }
]
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Mon,13 Oct 2025 16:43:28 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760373866 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
1459 ms
Responses
Code	Description	Links
200	
Success