hiện tại, khi tôi chạy dự án (cả backend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\backend và frontend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend) thì màn hình react app không hiện gì cả, trên console của trang hiện các thông báo sau:

FlashcardManagement.css:78  Uncaught ReferenceError: Cannot access '__WEBPACK_DEFAULT_EXPORT__' before initialization
    at Module.default (FlashcardManagement.css:78:1)
    at Module.FlashcardManagement (FlashcardSetManager.tsx:264:1)
    at registerExportsForReactRefresh (RefreshUtils.js:173:1)
    at Object.executeRuntime (RefreshUtils.js:205:1)
    at $ReactRefreshModuleRuntime$ (index.ts:5:1)
    at ./src/components/flashcard/index.ts (index.ts:5:1)
    at Module.<anonymous> (react refresh:37:1)
    at __webpack_require__ (bootstrap:22:1)
    at fn (hot module replacement:61:1)
    at hotRequire (react refresh:20:1)
index.iife.js:1347 content script loaded
index.iife.js:1 initial theme: light