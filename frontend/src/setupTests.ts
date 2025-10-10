// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
    root = null;
    rootMargin = '';
    thresholds = [];
    takeRecords = () => [];
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock HTMLAudioElement
(global as any).HTMLAudioElement = class HTMLAudioElement {
    play = jest.fn().mockResolvedValue(undefined);
    pause = jest.fn();
    load = jest.fn();
    canPlayType = jest.fn().mockReturnValue('');
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn();

    // Properties
    currentTime = 0;
    duration = 0;
    paused = true;
    volume = 1;
    muted = false;
    src = '';

    constructor() {
        // Mock constructor
    }
};

// Mock HTMLVideoElement
(global as any).HTMLVideoElement = class HTMLVideoElement {
    play = jest.fn().mockResolvedValue(undefined);
    pause = jest.fn();
    load = jest.fn();
    canPlayType = jest.fn().mockReturnValue('');
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn();

    // Properties
    currentTime = 0;
    duration = 0;
    paused = true;
    volume = 1;
    muted = false;
    src = '';

    constructor() {
        // Mock constructor
    }
};

// Mock requestAnimationFrame
(global as any).requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
(global as any).cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock requestIdleCallback
(global as any).requestIdleCallback = jest.fn(cb => setTimeout(cb, 0));
(global as any).cancelIdleCallback = jest.fn(id => clearTimeout(id));

// Mock fetch for Firebase
(global as any).fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
    })
);

// Mock Firebase
jest.mock('./config/firebase', () => ({
    auth: {
        currentUser: null,
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn(),
        createUserWithEmailAndPassword: jest.fn(),
        onAuthStateChanged: jest.fn(),
    },
    db: {},
    storage: {},
}));

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };

    console.warn = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('componentWillReceiveProps') ||
                args[0].includes('componentWillUpdate'))
        ) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});

// Global test utilities
export const createMockUser = (overrides = {}) => ({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'student',
    ...overrides,
});

export const createMockFlashcard = (overrides = {}) => ({
    id: 'test-flashcard-id',
    front: 'Test Front',
    back: 'Test Back',
    setId: 'test-set-id',
    order: 0,
    difficulty: 'easy',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

export const createMockFlashcardSet = (overrides = {}) => ({
    id: 'test-set-id',
    title: 'Test Flashcard Set',
    description: 'A test flashcard set',
    flashcardCount: 5,
    difficulty: 'easy',
    isPublic: true,
    createdBy: 'test-teacher-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

// Integration tests don't need custom render providers
// They will use their own setup