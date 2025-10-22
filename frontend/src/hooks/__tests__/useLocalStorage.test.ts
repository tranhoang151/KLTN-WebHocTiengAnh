import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    it('returns initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        expect(result.current[0]).toBe('initial');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    });

    it('returns stored value from localStorage', () => {
        localStorageMock.setItem('test-key', JSON.stringify('stored-value'));

        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        expect(result.current[0]).toBe('stored-value');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    });

    it('updates localStorage when value changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'test-key',
            JSON.stringify('new-value')
        );
    });

    it('supports function updates', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 10));

        act(() => {
            result.current[1]((prev) => prev + 5);
        });

        expect(result.current[0]).toBe(15);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'test-key',
            JSON.stringify(15)
        );
    });

    it('works with complex objects', () => {
        const initialObject = { name: 'John', age: 30 };
        const { result } = renderHook(() => useLocalStorage('user', initialObject));

        const updatedObject = { name: 'Jane', age: 25 };

        act(() => {
            result.current[1](updatedObject);
        });

        expect(result.current[0]).toEqual(updatedObject);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'user',
            JSON.stringify(updatedObject)
        );
    });

    it('works with arrays', () => {
        const initialArray = [1, 2, 3];
        const { result } = renderHook(() => useLocalStorage('numbers', initialArray));

        act(() => {
            result.current[1]([4, 5, 6]);
        });

        expect(result.current[0]).toEqual([4, 5, 6]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'numbers',
            JSON.stringify([4, 5, 6])
        );
    });

    it('handles localStorage getItem errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        localStorageMock.getItem.mockImplementation(() => {
            throw new Error('localStorage error');
        });

        const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

        expect(result.current[0]).toBe('fallback');
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error reading localStorage key "test-key":',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('handles localStorage setItem errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        localStorageMock.setItem.mockImplementation(() => {
            throw new Error('localStorage setItem error');
        });

        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new-value');
        });

        // State should still update even if localStorage fails
        expect(result.current[0]).toBe('new-value');
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error setting localStorage key "test-key":',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('handles invalid JSON in localStorage', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        localStorageMock.getItem.mockReturnValue('invalid-json{');

        const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

        expect(result.current[0]).toBe('fallback');
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error reading localStorage key "test-key":',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('works with boolean values', () => {
        const { result } = renderHook(() => useLocalStorage('boolean-key', false));

        act(() => {
            result.current[1](true);
        });

        expect(result.current[0]).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'boolean-key',
            JSON.stringify(true)
        );
    });

    it('works with null values', () => {
        const { result } = renderHook(() => useLocalStorage('null-key', null));

        act(() => {
            result.current[1]('not-null');
        });

        expect(result.current[0]).toBe('not-null');
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'null-key',
            JSON.stringify('not-null')
        );
    });

    it('persists data across hook re-renders', () => {
        const { result, rerender } = renderHook(() => useLocalStorage('persist-key', 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        rerender();

        expect(result.current[0]).toBe('updated');
    });
});
