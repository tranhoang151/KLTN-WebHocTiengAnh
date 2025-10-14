hiện tại, khi tôi chạy phần backend của dự án (backend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\backend) rồi login và authorize với tài khoản admin lấy từ firestore database D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\WebConversion\backup.json, tôi đã thử các API GET/api/Video/ trên swagger thì thay vì nhận được danh sách các video, tôi nhận được kết quả sau:

GET
/api/Video

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Video' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiJmOTNmMjRkZS1lNjBkLTQ4MzAtOGM5OC1jMTNlMGY3NjhmODEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwNDk2ODg4LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.LvCydBXpEEDq25pgpSAquMLDrTfD8hrpO6L9DmITxTQ'
Request URL
https://localhost:5001/api/Video
Server response
Code	Details
500
Undocumented
Error: response status is 500

Response body
Download
{
  "message": "Error retrieving videos",
  "error": "Unable to convert string value to System.Int32"
}
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Tue,14 Oct 2025 02:55:02 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760410561 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Responses
Code	Description	Links
200	
Success