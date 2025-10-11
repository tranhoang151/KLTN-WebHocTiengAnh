Compiled with problems:
×
ERROR in src/contexts/AuthContext.tsx:94:24
TS2304: Cannot find name 'useCallback'.
    92 |   };
    93 |
  > 94 |   const getAuthToken = useCallback(async (): Promise<string | null> => {
       |                        ^^^^^^^^^^^
    95 |     return await authService.getCurrentUserToken();
    96 |   }, []);
    97 |

hiện tại, khi tôi chạy dự án (cả backend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\backend và frontend: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend) rồi login với tài khoản admin lấy từ @backup.json, rồi tôi vào trang manage users thì phần User Management hiện danh sách user và cứ liên tục nhấp nháy, khiến tôi không thể nhấn nào nút hay sử dụng các chức năng user management. khi tôi mở console thì không thấy hiện thông báo lỗi gì cả