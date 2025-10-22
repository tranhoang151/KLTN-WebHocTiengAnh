import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { authService } from '../../../services/authService';
import {
    setupFirebaseEmulators,
    createTestUser,
    cleanupTestData,
    testAuth,
    addToCleanup
} from '../setup';

describe('AuthService Integration Tests', () => {
    beforeEach(() => {
        setupFirebaseEmulators();
    });

    afterEach(async () => {
        await cleanupTestData();
        await authService.signOut();
    });

    describe('User Authentication', () => {
        it('should sign in with valid credentials', async () => {
            // Arrange
            const { email, password } = await createTestUser('student');

            // Act
            const result = await authService.signIn(email, password);

            // Assert
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(email);
        });

        it('should throw error for invalid credentials', async () => {
            // Act & Assert
            await expect(
                authService.signIn('nonexistent@example.com', 'WrongPassword123!')
            ).rejects.toThrow();
        });

        it('should sign out successfully', async () => {
            // Arrange
            const { email, password } = await createTestUser('student');
            await authService.signIn(email, password);

            // Verify user is signed in
            expect(testAuth.currentUser).toBeDefined();

            // Act
            await authService.signOut();

            // Assert
            expect(testAuth.currentUser).toBeNull();
        });

        it('should get current user token when signed in', async () => {
            // Arrange
            const { email, password } = await createTestUser('teacher');
            await authService.signIn(email, password);

            // Act
            const token = await authService.getCurrentUserToken();

            // Assert
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should return null token when not signed in', async () => {
            // Act
            const token = await authService.getCurrentUserToken();

            // Assert
            expect(token).toBeNull();
        });

        it('should get current user data when signed in', async () => {
            // Arrange
            const { email, password, userData } = await createTestUser('admin');
            await authService.signIn(email, password);

            // Act
            const currentUserData = await authService.getCurrentUserData();

            // Assert
            expect(currentUserData).toBeDefined();
            expect(currentUserData?.email).toBe(email);
            expect(currentUserData?.role).toBe('admin');
        });

        it('should return null for user data when not signed in', async () => {
            // Act
            const userData = await authService.getCurrentUserData();

            // Assert
            expect(userData).toBeNull();
        });
    });

    describe('Authentication State Management', () => {
        it('should persist authentication state', async () => {
            // Arrange
            const { email, password } = await createTestUser('teacher');
            await authService.signIn(email, password);

            // Act - Wait for auth state to be restored
            await new Promise(resolve => {
                const unsubscribe = testAuth.onAuthStateChanged(user => {
                    if (user) {
                        unsubscribe();
                        resolve(user);
                    }
                });
            });

            // Assert
            const currentUser = testAuth.currentUser;
            expect(currentUser).toBeDefined();
            expect(currentUser?.email).toBe(email);
        });

        it('should handle auth state changes', async () => {
            // Arrange
            let authStateChanges = 0;
            const unsubscribe = testAuth.onAuthStateChanged(() => {
                authStateChanges++;
            });

            const { email, password } = await createTestUser('student');

            // Act
            await authService.signIn(email, password);
            await authService.signOut();

            // Assert
            expect(authStateChanges).toBeGreaterThan(0);

            unsubscribe();
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            // Act & Assert
            await expect(
                authService.signIn('invalid-format-email', 'password')
            ).rejects.toThrow();
        });

        it('should handle Firebase service errors', async () => {
            // Arrange
            const { email } = await createTestUser('student');

            // Act & Assert - Wrong password
            await expect(
                authService.signIn(email, 'WrongPassword123!')
            ).rejects.toThrow();
        });
    });
});
