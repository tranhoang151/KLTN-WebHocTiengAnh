Compiled with problems:
×
ERROR in src/pages/student/VideoDetailPage.tsx:50:24
TS2339: Property 'uid' does not exist on type 'User | User'.
  Property 'uid' does not exist on type 'User'.
    48 |       try {
    49 |         await videoService.updateVideoProgress({
  > 50 |           userId: user.uid,
       |                        ^^^
    51 |           videoId: videoId,
    52 |           courseId: video.courseId, // Assuming courseId is part of the Video type
    53 |           completed: completed,
ERROR in src/services/mockAuthService.ts:62:13
TS2322: Type '{ id: string; password: string; full_name: string; role: string; gender: string; email: string; avatar_base64: string; streak_count: number; last_login_date: string; class_ids: any[]; badges: {}; } | { ...; }' is not assignable to type 'User'.
  Type '{ id: string; password: string; full_name: string; role: string; gender: string; email: string; avatar_base64: string; streak_count: number; last_login_date: string; class_ids: any[]; badges: {}; }' is not assignable to type 'User'.
    Types of property 'role' are incompatible.
      Type 'string' is not assignable to type 'UserRole'.
    60 |             // Generate a mock token
    61 |             this.token = `mock_token_${user.id}_${Date.now()}`;
  > 62 |             this.currentUser = { ...user };
       |             ^^^^^^^^^^^^^^^^
    63 |
    64 |             // Store in localStorage for persistence
    65 |             localStorage.setItem('auth_token', this.token);
ERROR in src/services/mockAuthService.ts:114:9
TS2322: Type '{ id: string; password: string; full_name: string; role: string; gender: string; email: string; avatar_base64: string; streak_count: number; last_login_date: string; class_ids: any[]; badges: {}; } | { ...; }' is not assignable to type 'User'.
  Type '{ id: string; password: string; full_name: string; role: string; gender: string; email: string; avatar_base64: string; streak_count: number; last_login_date: string; class_ids: any[]; badges: {}; }' is not assignable to type 'User'.
    Types of property 'role' are incompatible.
      Type 'string' is not assignable to type 'UserRole'.
    112 |     async getUserData(uid: string): Promise<User | null> {
    113 |         const user = MOCK_USERS.find(u => u.id === uid);
  > 114 |         return user || null;
        |         ^^^^^^^^^^^^^^^^^^^^
    115 |     }
    116 |
    117 |     /**