GET
/api/Progress/dashboard/{userId}

Parameters
Cancel
Name	Description
userId *
string
(path)
U003
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://localhost:5001/api/Progress/dashboard/U003' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMDAzIiwiZW1haWwiOiJhZG1pbmNAZXhhbXBsZS5jb20iLCJqdGkiOiI3NWU1YjI2Mi1lNDcxLTRmMGUtOTEzNS05ZGZmN2FhMDU0MDYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJhZG1pbiIsImZ1bGxfbmFtZSI6IkxlIFZhbiBDIiwiZXhwIjoxNzYwNjI2Nzk5LCJpc3MiOiJCaW5nR29XZWJBUEkiLCJhdWQiOiJCaW5nR29XZWJBcHAifQ.utLz8-8V4D9j_0-7UeKjNoYioS-jRsfaQJOpyO6PZEY'
Request URL
https://localhost:5001/api/Progress/dashboard/U003
Server response
Code	Details
500
Undocumented
Error: response status is 500

Response body
Download
{
  "error": "An error occurred while fetching dashboard data.",
  "details": "Status(StatusCode=\"FailedPrecondition\", Detail=\"The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/kltn-c5cf0/firestore/indexes?create_composite=ClZwcm9qZWN0cy9rbHRuLWM1Y2YwL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9sZWFybmluZ19hY3Rpdml0aWVzL2luZGV4ZXMvXxABGgoKBlVzZXJJZBABGg0KCVRpbWVzdGFtcBABGgwKCF9fbmFtZV9fEAE\")"
}
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json; charset=utf-8 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Wed,15 Oct 2025 15:01:20 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760540538 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
Responses
Code	Description	Links
200	
Success

No links
