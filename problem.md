hiện tại, khi tôi chạy phần backend của dự án (backend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\backend) rồi login và authorize với tài khoản admin lấy từ firestore database D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\WebConversion\backup.json, tôi đã thử các API GET/api/Test/Course/{courseId} trên swagger thì thay vì nhận được các test có courseId nhập vào, tôi nhận được kết quả sau:

Parameters
Cancel
Name	Description
courseId *
string
(path)
1Tj7Zug9y2PtKCj3mR1X
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Test/course/1Tj7Zug9y2PtKCj3mR1X' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiJhMWY0MTU0OS0zNzE2LTRmOGEtOWI0Yy03NDkwMjQ2NmNjMzkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwMzY4NDE1LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.JhIAAAZLA79JUpT54wR2OTCyF0zzHQ-htbPJeYLjTjM'
Request URL
https://localhost:5001/api/Test/course/1Tj7Zug9y2PtKCj3mR1X
Server response
Code	Details
200	
Response body
Download
[]
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Sun,12 Oct 2025 15:14:18 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760282118 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Request duration
342 ms
Responses
Code	Description	Links
200	
Success

No links

