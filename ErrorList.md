POST
/api/User

Parameters
Cancel
Reset
No parameters

Request body

application/json
{
  "fullName": "Test User",
  "email": "aa@gmail.com",
  "password": "123456",
  "role": "Student",
  "gender": "string",
  "avatarBase64": "",
  "classIds": [
    "string"
  ]
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://localhost:5001/api/User' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiI5Zjk5Njk3NS01MTZmLTRmZDAtOGJmMy1iMTEyMDQ3YmY0ZmIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwNzgyNTc3LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.t6WjS7H2AAxZOYpm3QzDujAZwgC4cL-fzRTtEASLJmM' \
  -H 'Content-Type: application/json' \
  -d '{
  "fullName": "Test User",
  "email": "aa@gmail.com",
  "password": "123456",
  "role": "Student",
  "gender": "string",
  "avatarBase64": "",
  "classIds": [
    "string"
  ]
}'
Request URL
https://localhost:5001/api/User
Server response
Code	Details
201
Undocumented
Response body
Download
{
  "id": "702e62cc-6be1-4242-a1fa-b41667affe80",
  "fullName": "Test User",
  "email": "aa@gmail.com",
  "password": "123456",
  "role": "Student",
  "gender": "string",
  "avatarUrl": null,
  "avatarBase64": "",
  "loginStreakCount": 0,
  "learningStreakCount": 0,
  "streakCount": 0,
  "lastLearningDate": "",
  "lastLoginDate": "",
  "classIds": [
    "string"
  ],
  "badges": {},
  "learningHistory": {},
  "createdAt": {},
  "isActive": true
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: https://localhost:5001 
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Fri,17 Oct 2025 10:18:01 GMT 
 location: https://localhost:5001/api/User/702e62cc-6be1-4242-a1fa-b41667affe80 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 vary: Origin 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760696341 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
888 ms
Responses
Code	Description	Links
200	
Success

No links
