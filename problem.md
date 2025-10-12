hiện tại, khi tôi chạy phần backend của dự án (backend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\backend) rồi  login và authorize với tài khoản admin lấy từ @backup.json, tôi đã thử các GET API: GET/api/Class, GET/api/Course, GET/api/Flashcard/sets thì các API này đã hiện lên được tất cả các thông tin cần thiết như trong @backup.json, trừ id không hiện lên.

Kết quả:

- GET/api/Class:
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Class' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiJmNjM1OTUyMi04OGJhLTQ2YWYtOTA3Mi0zZWVmMGIzOTQxNGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwMzM2MjU4LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.IivyTCnQ0t47J-aIro_7LHFtREjSsjHw1exZdVlzYYY'
Request URL
https://localhost:5001/api/Class
Server response
Code	Details
200	
Response body
Download
[
  {
    "id": "",
    "name": "SE2",
    "description": "Lớp Starter English 2 cho trẻ 6-7 tuổi",
    "capacity": 10,
    "courseId": "LABTsID1zvPRsVjPjhLd",
    "teacherId": "U002",
    "studentIds": [
      "yl8VK0hK39X1F2Bv4P07",
      "U100"
    ],
    "createdAt": "2025-07-18",
    "isActive": true
  },
  {
    "id": "",
    "name": "JE2",
    "description": "Lớp Junior English 2 cho trẻ 8-9 tuổi",
    "capacity": 10,
    "courseId": null,
    "teacherId": null,
    "studentIds": [],
    "createdAt": "2025-07-18",
    "isActive": true
  },
  {
    "id": "",
    "name": "SM1",
    "description": "Lớp Smart English 1 cho trẻ 9-10 tuổi",
    "capacity": 10,
    "courseId": "WgRFeWZ6Sipili34yEuX",
    "teacherId": null,
    "studentIds": [],
    "createdAt": "2025-07-18",
    "isActive": true
  },
  {
    "id": "",
    "name": "JE1",
    "description": "Lớp Junior English 1 cho trẻ 8-9 tuổi",
    "capacity": 10,
    "courseId": "1Tj7Zug9y2PtKCj3mR1X",
    "teacherId": "TOATdRymyiG2ZXS5Yd6N",
    "studentIds": [
      "RURXLeF9CkGaVauALNbW"
    ],
    "createdAt": "2025-07-18",
    "isActive": true
  },
  {
    "id": "",
    "name": "SM2",
    "description": "Lớp Smart English 2 cho trẻ 9-10 tuổi",
    "capacity": 0,
    "courseId": null,
    "teacherId": null,
    "studentIds": [],
    "createdAt": "2025-07-18",
    "isActive": true
  },
  {
    "id": "",
    "name": "SE1",
    "description": "Lớp Starter English 1 cho trẻ 6-7 tuổi",
    "capacity": 10,
    "courseId": "LABTsID1zvPRsVjPjhLd",
    "teacherId": "U002",
    "studentIds": [
      "yl8VK0hK39X1F2Bv4P07",
      "U004",
      "uGHwsrznOSIf1oHGvtll",
      "U001",
      "ieuVb5calOJDNjNJ7ctW"
    ],
    "createdAt": "2025-07-18",
    "isActive": true
  }
]
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Sun,12 Oct 2025 06:21:34 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760250153 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
1649 ms
Responses
Code	Description	Links
200	
Success

- GET/api/Course:
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Course' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiJmNjM1OTUyMi04OGJhLTQ2YWYtOTA3Mi0zZWVmMGIzOTQxNGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwMzM2MjU4LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.IivyTCnQ0t47J-aIro_7LHFtREjSsjHw1exZdVlzYYY'
Request URL
https://localhost:5001/api/Course
Server response
Code	Details
200	
Response body
Download
[
  {
    "id": "",
    "name": "Junior English",
    "description": "Khóa học tiếng Anh nâng cao cho trẻ 8-9 tuổi",
    "imageUrl": "aa",
    "createdAt": {},
    "targetAgeGroup": null,
    "isActive": true
  },
  {
    "id": "",
    "name": "Starter English",
    "description": "Khóa học tiếng Anh cơ bản cho trẻ 6-7 tuổi",
    "imageUrl": "aa",
    "createdAt": {},
    "targetAgeGroup": null,
    "isActive": true
  },
  {
    "id": "",
    "name": "Smart English",
    "description": "Khóa học tiếng Anh cho trẻ 9-10 tuổi",
    "imageUrl": "aa",
    "createdAt": {},
    "targetAgeGroup": null,
    "isActive": true
  }
]
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Sun,12 Oct 2025 06:18:58 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760249998 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
548 ms
Responses
Code	Description	Links
200	
Success


GET/api/Flashcard/sets:
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Flashcard/sets' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiJmNjM1OTUyMi04OGJhLTQ2YWYtOTA3Mi0zZWVmMGIzOTQxNGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwMzM2MjU4LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.IivyTCnQ0t47J-aIro_7LHFtREjSsjHw1exZdVlzYYY'
Request URL
https://localhost:5001/api/Flashcard/sets
Server response
Code	Details
200	
Response body
Download
[
  {
    "id": "",
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
    "id": "",
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
    "id": "",
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
    "id": "",
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
    "id": "",
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
    "id": "",
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
    "id": "",
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
 date: Sun,12 Oct 2025 06:22:26 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760250205 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
1662 ms
Responses
Code	Description	Links
200	
Success


Việc id bị để trống như vậy có gây ảnh hưởng đến việc sử dụng các api khác có yêu cầu id không ?