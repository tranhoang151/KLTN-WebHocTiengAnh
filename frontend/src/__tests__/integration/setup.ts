import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Test Firebase configuration
const testFirebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test-project.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "test-app-id"
};

// Initialize Firebase for testing
const testApp = initializeApp(testFirebaseConfig, 'test-app');
const testAuth = getAuth(testApp);
const testDb = getFirestore(testApp);
const testStorage = getStorage(testApp);

// Connect to emulators
let emulatorsConnected = false;

export const setupFirebaseEmulators = () => {
    if (!emulatorsConnected) {
        try {
            connectAuthEmulator(testAuth, 'http://localhost:9099', { disableWarnings: true });
            connectFirestoreEmulator(testDb, 'localhost', 8080);
            connectStorageEmulator(testStorage, 'localhost', 9199);
            emulatorsConnected = true;
        } catch (error) {
            console.warn('Firebase emulators already connected or not available:', error);
        }
    }
};

// Test data cleanup
const testDataCleanup: string[] = [];

export const addToCleanup = (collection: string, docId: string) => {
    testDataCleanup.push(`${collection}/${docId}`);
};

export const cleanupTestData = async () => {
    for (const docPath of testDataCleanup) {
        try {
            const [collectionName, docId] = docPath.split('/');
            await deleteDoc(doc(testDb, collectionName, docId));
        } catch (error) {
            console.warn(`Failed to cleanup ${docPath}:`, error);
        }
    }
    testDataCleanup.length = 0;
};

// Test user creation helpers
export const createTestUser = async (role: string = 'student') => {
    const email = `test-${Date.now()}-${Math.random()}@example.com`;
    const password = 'TestPassword123!';

    const userCredential = await createUserWithEmailAndPassword(testAuth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore
    const userData = {
        id: user.uid,
        email: email,
        displayName: `Test ${role}`,
        role: role,
        created_at: new Date(),
        is_active: true
    };

    await setDoc(doc(testDb, 'users', user.uid), userData);
    addToCleanup('users', user.uid);

    return { user, userData, email, password };
};

export const signInTestUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(testAuth, email, password);
};

// Mock API responses
export const mockApiResponse = (data: any, status: number = 200) => {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data))
    } as Response);
};

// Test data factories
export const createTestFlashcard = (overrides: any = {}) => {
    return {
        id: `flashcard-${Date.now()}-${Math.random()}`,
        flashcard_set_id: 'test-set',
        front_text: 'Test Front',
        back_text: 'Test Back',
        example_sentence: '',
        image_url: '',
        image_base64: '',
        order: 1,
        ...overrides
    };
};

export const createTestCourse = (overrides: any = {}) => {
    return {
        id: `course-${Date.now()}-${Math.random()}`,
        name: 'Test Course',
        description: 'Test Course Description',
        level: 'beginner',
        language: 'en',
        created_at: new Date(),
        created_by: 'test-user',
        is_active: true,
        ...overrides
    };
};

export const createTestProgress = (overrides: any = {}) => {
    return {
        id: `progress-${Date.now()}-${Math.random()}`,
        userId: 'test-user',
        courseId: 'test-course',
        flashcardId: 'test-flashcard',
        isLearned: false,
        reviewCount: 0,
        correctCount: 0,
        lastReviewedAt: new Date(),
        created_at: new Date(),
        ...overrides
    };
};

// Global test setup
beforeAll(async () => {
    setupFirebaseEmulators();
});

afterAll(async () => {
    await cleanupTestData();
});

beforeEach(() => {
    // Reset any global state before each test
    jest.clearAllMocks();
});

afterEach(async () => {
    // Cleanup after each test
    await cleanupTestData();
});

// Export test instances
export { testAuth, testDb, testStorage, testApp };
