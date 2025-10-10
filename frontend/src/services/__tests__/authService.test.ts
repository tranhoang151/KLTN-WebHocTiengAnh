import { AuthService } from '../authService';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('../../config/firebase');

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
    typeof onAuthStateChanged
>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

const mockAuth = {
    currentUser: null,
} as any;

const mockDb = {} as any;

(auth as any) = mockAuth;
(db as any) = mockDb;

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('successfully signs in with valid credentials', async () => {
            const mockUserCredential = {
                user: {
                    uid: 'test-uid',
                    email: 'test@example.com',
                    getIdToken: jest.fn().mockResolvedValue('mock-token'),
                },
            };

            mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as any);

            const result = await authService.signIn('test@example.com', 'password123');

            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
                mockAuth,
                'test@example.com',
                'password123'
            );
            expect(result).toBe(mockUserCredential);
        });

        it('throws error when sign in fails', async () => {
            const mockError = new Error('Invalid credentials');
            mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(
                authService.signIn('test@example.com', 'wrongpassword')
            ).rejects.toThrow('Invalid credentials');

            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
                mockAuth,
                'test@example.com',
                'wrongpassword'
            );
        });

        it('handles empty email', async () => {
            const mockError = new Error('Email is required');
            mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(
                authService.signIn('', 'password123')
            ).rejects.toThrow('Email is required');
        });

        it('handles empty password', async () => {
            const mockError = new Error('Password is required');
            mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(
                authService.signIn('test@example.com', '')
            ).rejects.toThrow('Password is required');
        });
    });

    describe('signOut', () => {
        it('successfully signs out', async () => {
            mockSignOut.mockResolvedValue();

            await authService.signOut();

            expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
        });

        it('throws error when sign out fails', async () => {
            const mockError = new Error('Sign out failed');
            mockSignOut.mockRejectedValue(mockError);

            await expect(authService.signOut()).rejects.toThrow('Sign out failed');

            expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
        });
    });

    describe('getCurrentUserToken', () => {
        it('returns token when user is authenticated', async () => {
            const mockUser = {
                getIdToken: jest.fn().mockResolvedValue('mock-token'),
            };
            mockAuth.currentUser = mockUser;

            const token = await authService.getCurrentUserToken();

            expect(mockUser.getIdToken).toHaveBeenCalled();
            expect(token).toBe('mock-token');
        });

        it('returns null when no user is authenticated', async () => {
            mockAuth.currentUser = null;

            const token = await authService.getCurrentUserToken();

            expect(token).toBeNull();
        });

        it('handles token retrieval error', async () => {
            const mockUser = {
                getIdToken: jest.fn().mockRejectedValue(new Error('Token error')),
            };
            mockAuth.currentUser = mockUser;

            await expect(authService.getCurrentUserToken()).rejects.toThrow('Token error');
        });
    });

    describe('getUserProfile', () => {
        // getUserProfile method tests removed as method doesn't exist in current implementation
    });

    describe('onAuthStateChanged', () => {
        it('sets up auth state listener', () => {
            const mockCallback = jest.fn();

            authService.onAuthStateChanged(mockCallback);

            expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, mockCallback);
        });

        it('returns unsubscribe function', () => {
            const mockUnsubscribe = jest.fn();
            mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

            const unsubscribe = authService.onAuthStateChanged(jest.fn());

            expect(unsubscribe).toBe(mockUnsubscribe);
        });
    });

    describe('isAuthenticated', () => {
        it('returns true when user is authenticated', () => {
            mockAuth.currentUser = { uid: 'test-uid' };

            const isAuth = authService.isAuthenticated();

            expect(isAuth).toBe(true);
        });

        it('returns false when no user is authenticated', () => {
            mockAuth.currentUser = null;

            const isAuth = authService.isAuthenticated();

            expect(isAuth).toBe(false);
        });
    });

    describe('getCurrentUser', () => {
        it('returns current user when authenticated', () => {
            const mockUser = { uid: 'test-uid', email: 'test@example.com' };
            mockAuth.currentUser = mockUser;

            const currentUser = authService.getCurrentUser();

            expect(currentUser).toBe(mockUser);
        });

        it('returns null when not authenticated', () => {
            mockAuth.currentUser = null;

            const currentUser = authService.getCurrentUser();

            expect(currentUser).toBeNull();
        });
    });
});