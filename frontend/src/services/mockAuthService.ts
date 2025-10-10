import { User, UserRole } from '../types';

// Mock users from backup.json
const MOCK_USERS = [
    {
        id: "RURXLeF9CkGaVauALNbW",
        password: "123456",
        full_name: "Nguyen Tuan Viet",
        role: "student",
        gender: "Nam",
        email: "student@example.com", // Adding email for login
        avatar_base64: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdC...",
        streak_count: 0,
        last_login_date: new Date().toISOString(),
        class_ids: [],
        badges: {},
    },
    {
        id: "admin",
        password: "admin123",
        full_name: "Administrator",
        role: "admin",
        gender: "Nam",
        email: "admin@example.com",
        streak_count: 0,
        last_login_date: new Date().toISOString(),
        class_ids: [],
        badges: {},
    },
    {
        id: "teacher",
        password: "teacher123",
        full_name: "Teacher User",
        role: "teacher",
        gender: "Nữ",
        email: "teacher@example.com",
        streak_count: 0,
        last_login_date: new Date().toISOString(),
        class_ids: [],
        badges: {},
    }
];

export class MockAuthService {
    private currentUser: User | null = null;
    private token: string | null = null;

    /**
     * Mock sign in with email and password
     */
    async signIn(email: string, password: string): Promise<any> {
        try {
            // Find user by email and password
            const user = MOCK_USERS.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Generate a mock token
            this.token = `mock_token_${user.id}_${Date.now()}`;
            this.currentUser = { ...user, role: user.role as UserRole };

            // Store in localStorage for persistence
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('user_data', JSON.stringify(this.currentUser));

            return {
                user: this.currentUser,
                token: this.token
            };
        } catch (error) {
            console.error('Mock sign in error:', error);
            throw error;
        }
    }

    /**
     * Sign out the current user
     */
    async signOut(): Promise<void> {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            this.token = null;
            this.currentUser = null;
        } catch (error) {
            console.error('Mock sign out error:', error);
            throw error;
        }
    }

    /**
     * Get the current user's token
     */
    async getCurrentUserToken(): Promise<string | null> {
        if (this.token) {
            return this.token;
        }
        // Try to get from localStorage
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            this.token = storedToken;
            return storedToken;
        }
        return null;
    }

    /**
     * Get user data
     */
    async getUserData(uid: string): Promise<User | null> {
        const user = MOCK_USERS.find(u => u.id === uid);
        if (user) {
            return { ...user, role: user.role as UserRole } || null;
        }
        return null;
    }

    /**
     * Listen to authentication state changes
     */
    onAuthStateChanged(callback: (user: User | null) => void) {
        // Check localStorage on initialization
        const storedUser = localStorage.getItem('user_data');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
            this.currentUser = JSON.parse(storedUser);
            this.token = storedToken;
            callback(this.currentUser);
        } else {
            callback(null);
        }

        // Return a dummy unsubscribe function
        return () => { };
    }

    /**
     * Get the current user
     */
    getCurrentUser(): User | null {
        if (this.currentUser) {
            return this.currentUser;
        }
        // Try to get from localStorage
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            return this.currentUser;
        }
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getCurrentUserToken() && !!this.getCurrentUser();
    }

    /**
     * Get current user data
     */
    async getCurrentUserData(): Promise<User | null> {
        return this.getCurrentUser();
    }
}

export const mockAuthService = new MockAuthService();