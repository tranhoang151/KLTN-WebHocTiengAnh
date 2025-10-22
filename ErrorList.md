Submitting exercise with: {title: 'a', type: 'fill_blank', course_id: 'WgRFeWZ6Sipili34yEuX', questions: Array(4), total_points: 40, …}course_id: "WgRFeWZ6Sipili34yEuX"created_by: "U003"questions: (4) [{…}, {…}, {…}, {…}]title: "a"total_points: 40type: "fill_blank"[[Prototype]]: Object
api.ts:31   POST http://localhost:5000/api/exercise 400 (Bad Request)
request @ api.ts:31
await in request
post @ api.ts:89
createExercise @ exerciseService.ts:80
handleSubmitExercise @ ExerciseManagement.tsx:82
handleSubmit @ ExerciseForm.tsx:143
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1518
processDispatchQueue @ react-dom-client.development.js:16417
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20657
dispatchDiscreteEvent @ react-dom-client.development.js:20625
api.ts:73  API request failed: Error: Total points must be greater than 0
    at ApiService.request (api.ts:63:1)
    at async ExerciseService.createExercise (exerciseService.ts:80:1)
    at async handleSubmitExercise (ExerciseManagement.tsx:82:1)
overrideMethod @ hook.js:608
request @ api.ts:73
await in request
post @ api.ts:89
createExercise @ exerciseService.ts:80
handleSubmitExercise @ ExerciseManagement.tsx:82
handleSubmit @ ExerciseForm.tsx:143
executeDispatch @ react-dom-client.development.js:16368
runWithFiberInDEV @ react-dom-client.development.js:1518
processDispatchQueue @ react-dom-client.development.js:16417
(anonymous) @ react-dom-client.development.js:17016
batchedUpdates$1 @ react-dom-client.development.js:3262
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16572
dispatchEvent @ react-dom-client.development.js:20657
dispatchDiscreteEvent @ react-dom-client.development.js:20625