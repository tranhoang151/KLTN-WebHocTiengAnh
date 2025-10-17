Security measures initialized successfully
SecurityProvider.tsx:39 Security measures initialized successfully
index.iife.js:1347 content script loaded
index.iife.js:1 initial theme: light
userService.ts:158 Sending user data to API: {FullName: 'Testing User', Email: 'AA@example.com', Role: 'student', Gender: 'female', ClassIds: Array(0), …}AvatarBase64: "UklGRoIlAgBXRUJQVlA4IHYlAgCwnQSdASpiAhYDPhkKhEGhCClassIds: []Email: "AA@example.com"FullName: "Testing User"Gender: "female"Password: "111111"Role: "student"[[Prototype]]: Object
api.ts:31   POST https://localhost:5001/api/user 400 (Bad Request)
request @ api.ts:31
await in request
post @ api.ts:89
createUser @ userService.ts:159
await in createUser
handleCreateUser @ UserManagement.tsx:66
await in handleCreateUser
handleSubmit @ UserForm.tsx:155
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1518
processDispatchQueue @ react-dom-client.development.js:16417
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20657
dispatchDiscreteEvent @ react-dom-client.development.js:20625
api.ts:73  API request failed: Error: Invalid input data
    at ApiService.request (api.ts:63:1)
    at async Object.createUser (userService.ts:159:1)
    at async handleCreateUser (UserManagement.tsx:66:1)
    at async handleSubmit (UserForm.tsx:155:1)
overrideMethod @ hook.js:608
request @ api.ts:73
await in request
post @ api.ts:89
createUser @ userService.ts:159
await in createUser
handleCreateUser @ UserManagement.tsx:66
await in handleCreateUser
handleSubmit @ UserForm.tsx:155
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1518
processDispatchQueue @ react-dom-client.development.js:16417
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20657
dispatchDiscreteEvent @ react-dom-client.development.js:20625
UserForm.tsx:157  Error submitting form: Error: Invalid input data
    at Object.createUser (userService.ts:161:1)
    at async handleCreateUser (UserManagement.tsx:66:1)
    at async handleSubmit (UserForm.tsx:155:1)
overrideMethod @ hook.js:608
handleSubmit @ UserForm.tsx:157
await in handleSubmit
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1518
processDispatchQueue @ react-dom-client.development.js:16417
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20657
dispatchDiscreteEvent @ react-dom-client.development.js:20625