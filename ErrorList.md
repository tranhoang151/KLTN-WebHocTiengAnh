hiện tại, khi tôi đăng nhập và authorize bằng tài khoản admin lấy từ D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\WebConversion\backup.json, sau đó tôi thử các API GET (ví dụ như get/api/class, get/api/user, get/api/ course, get/api/profile và tất cả các api get còn lại ... ) trên swagger thì thay vì nhận được danh sách của đối tượng đó, tôi luôn nhận được kết quả như sau:
Server response
Code	Details
400
Undocumented
Error: response status is 400

Response body
Download
{
  "message": "Invalid operation",
  "details": "No authenticationScheme was specified, and there was no DefaultChallengeScheme found. The default schemes can be set using either AddAuthentication(string defaultScheme) or AddAuthentication(Action<AuthenticationOptions> configureOptions)."
}
Response headers
 content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://firebasestorage.googleapis.com; media-src 'self' https: https://firebasestorage.googleapis.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://firestore.googleapis.com https://localhost:5000 https://localhost:5001 https://localhost:7163 http://localhost:5163 https://localhost:3000 https://localhost:3001 ; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; 
 content-type: application/json 
 cross-origin-embedder-policy: require-corp 
 cross-origin-opener-policy: same-origin 
 cross-origin-resource-policy: same-origin 
 date: Fri,10 Oct 2025 11:41:12 GMT 
 permissions-policy: camera=(),microphone=(),geolocation=(),payment=() 
 referrer-policy: strict-origin-when-cross-origin 
 server: Kestrel 
 strict-transport-security: max-age=31536000; includeSubDomains; preload 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-ratelimit-limit: 100 
 x-ratelimit-remaining: 99 
 x-ratelimit-reset: 1760096533 
 x-ratelimit-window: 60 
 x-xss-protection: 1; mode=block 
