import {
    formatDate,
    formatDateTime,
    capitalize,
    truncateText,
    formatPercentage,
    formatScore,
    shuffleArray,
    storage,
    validateEmail,
    validatePassword,
    getErrorMessage,
} from '../index';

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

describe('Utils', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    describe('Date utilities', () => {
        describe('formatDate', () => {
            it('formats Date object correctly', () => {
                const date = new Date('2023-12-25');
                const formatted = formatDate(date);
                expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
            });

            it('formats date string correctly', () => {
                const dateString = '2023-12-25';
                const formatted = formatDate(dateString);
                expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
            });
        });

        describe('formatDateTime', () => {
            it('formats Date object with time', () => {
                const date = new Date('2023-12-25T10:30:00');
                const formatted = formatDateTime(date);
                expect(formatted).toContain('25/12/2023');
                expect(formatted).toContain('10:30:00');
            });

            it('formats date string with time', () => {
                const dateString = '2023-12-25T10:30:00';
                const formatted = formatDateTime(dateString);
                expect(formatted).toContain('25/12/2023');
                expect(formatted).toContain('10:30:00');
            });
        });
    });

    describe('String utilities', () => {
        describe('capitalize', () => {
            it('capitalizes first letter of string', () => {
                expect(capitalize('hello')).toBe('Hello');
                expect(capitalize('world')).toBe('World');
            });

            it('handles empty string', () => {
                expect(capitalize('')).toBe('');
            });

            it('handles single character', () => {
                expect(capitalize('a')).toBe('A');
            });

            it('does not change already capitalized string', () => {
                expect(capitalize('Hello')).toBe('Hello');
            });
        });

        describe('truncateText', () => {
            it('truncates text longer than maxLength', () => {
                const text = 'This is a very long text that should be truncated';
                const result = truncateText(text, 20);
                expect(result).toBe('This is a very long ...');
                expect(result.length).toBe(23); // 20 + '...'
            });

            it('returns original text if shorter than maxLength', () => {
                const text = 'Short text';
                const result = truncateText(text, 20);
                expect(result).toBe('Short text');
            });

            it('returns original text if equal to maxLength', () => {
                const text = 'Exactly twenty chars';
                const result = truncateText(text, 20);
                expect(result).toBe('Exactly twenty chars');
            });

            it('handles empty string', () => {
                expect(truncateText('', 10)).toBe('');
            });
        });
    });

    describe('Number utilities', () => {
        describe('formatPercentage', () => {
            it('calculates percentage correctly', () => {
                expect(formatPercentage(25, 100)).toBe('25%');
                expect(formatPercentage(1, 3)).toBe('33%');
                expect(formatPercentage(2, 3)).toBe('67%');
            });

            it('handles zero total', () => {
                expect(formatPercentage(5, 0)).toBe('0%');
            });

            it('handles zero value', () => {
                expect(formatPercentage(0, 100)).toBe('0%');
            });

            it('rounds to nearest integer', () => {
                expect(formatPercentage(1, 6)).toBe('17%'); // 16.67 rounded
                expect(formatPercentage(1, 7)).toBe('14%'); // 14.29 rounded
            });
        });

        describe('formatScore', () => {
            it('formats score with percentage sign', () => {
                expect(formatScore(85.7)).toBe('86%');
                expect(formatScore(92.3)).toBe('92%');
            });

            it('rounds to nearest integer', () => {
                expect(formatScore(85.4)).toBe('85%');
                expect(formatScore(85.6)).toBe('86%');
            });

            it('handles zero score', () => {
                expect(formatScore(0)).toBe('0%');
            });

            it('handles perfect score', () => {
                expect(formatScore(100)).toBe('100%');
            });
        });
    });

    describe('Array utilities', () => {
        describe('shuffleArray', () => {
            it('returns array with same length', () => {
                const original = [1, 2, 3, 4, 5];
                const shuffled = shuffleArray(original);
                expect(shuffled).toHaveLength(original.length);
            });

            it('contains all original elements', () => {
                const original = [1, 2, 3, 4, 5];
                const shuffled = shuffleArray(original);
                expect(shuffled.sort()).toEqual(original.sort());
            });

            it('does not modify original array', () => {
                const original = [1, 2, 3, 4, 5];
                const originalCopy = [...original];
                shuffleArray(original);
                expect(original).toEqual(originalCopy);
            });

            it('handles empty array', () => {
                const result = shuffleArray([]);
                expect(result).toEqual([]);
            });

            it('handles single element array', () => {
                const result = shuffleArray([1]);
                expect(result).toEqual([1]);
            });

            it('works with different data types', () => {
                const original = ['a', 'b', 'c'];
                const shuffled = shuffleArray(original);
                expect(shuffled).toHaveLength(3);
                expect(shuffled.sort()).toEqual(['a', 'b', 'c']);
            });
        });
    });

    describe('Storage utilities', () => {
        describe('storage.get', () => {
            it('retrieves stored value', () => {
                localStorageMock.setItem('test-key', JSON.stringify({ name: 'John' }));
                const result = storage.get('test-key');
                expect(result).toEqual({ name: 'John' });
            });

            it('returns null for non-existent key', () => {
                const result = storage.get('non-existent');
                expect(result).toBeNull();
            });

            it('handles invalid JSON gracefully', () => {
                localStorageMock.getItem.mockReturnValue('invalid-json{');
                const result = storage.get('invalid-key');
                expect(result).toBeNull();
            });
        });

        describe('storage.set', () => {
            it('stores value correctly', () => {
                const value = { name: 'John', age: 30 };
                storage.set('user', value);
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    'user',
                    JSON.stringify(value)
                );
            });

            it('handles storage errors gracefully', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                localStorageMock.setItem.mockImplementation(() => {
                    throw new Error('Storage full');
                });

                storage.set('test', 'value');
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Failed to save to localStorage:',
                    expect.any(Error)
                );

                consoleSpy.mockRestore();
            });
        });

        describe('storage.remove', () => {
            it('removes item from storage', () => {
                storage.remove('test-key');
                expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
            });
        });

        describe('storage.clear', () => {
            it('clears all storage', () => {
                storage.clear();
                expect(localStorageMock.clear).toHaveBeenCalled();
            });
        });
    });

    describe('Validation utilities', () => {
        describe('validateEmail', () => {
            it('validates correct email addresses', () => {
                expect(validateEmail('test@example.com')).toBe(true);
                expect(validateEmail('user.name@domain.co.uk')).toBe(true);
                expect(validateEmail('user+tag@example.org')).toBe(true);
            });

            it('rejects invalid email addresses', () => {
                expect(validateEmail('invalid-email')).toBe(false);
                expect(validateEmail('test@')).toBe(false);
                expect(validateEmail('@example.com')).toBe(false);
                expect(validateEmail('test.example.com')).toBe(false);
                expect(validateEmail('')).toBe(false);
            });
        });

        describe('validatePassword', () => {
            it('validates passwords with 6 or more characters', () => {
                expect(validatePassword('123456')).toBe(true);
                expect(validatePassword('password')).toBe(true);
                expect(validatePassword('very-long-password')).toBe(true);
            });

            it('rejects passwords with less than 6 characters', () => {
                expect(validatePassword('12345')).toBe(false);
                expect(validatePassword('abc')).toBe(false);
                expect(validatePassword('')).toBe(false);
            });
        });
    });

    describe('Error handling utilities', () => {
        describe('getErrorMessage', () => {
            it('extracts message from Error object', () => {
                const error = new Error('Something went wrong');
                expect(getErrorMessage(error)).toBe('Something went wrong');
            });

            it('returns string error as is', () => {
                expect(getErrorMessage('String error')).toBe('String error');
            });

            it('handles unknown error types', () => {
                expect(getErrorMessage(null)).toBe('An unknown error occurred');
                expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
                expect(getErrorMessage(123)).toBe('An unknown error occurred');
                expect(getErrorMessage({})).toBe('An unknown error occurred');
            });
        });
    });
});