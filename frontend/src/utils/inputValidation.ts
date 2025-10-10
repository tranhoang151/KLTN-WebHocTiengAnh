/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation and sanitization for all user inputs
 */

import React, { useState } from 'react';
import DOMPurify from 'dompurify';

// Validation patterns
export const ValidationPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    name: /^[a-zA-ZÀ-ỹ\s]{2,50}$/,
    phoneNumber: /^(\+84|0)[0-9]{9,10}$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    numeric: /^[0-9]+$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    youtubeUrl: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
    mongoId: /^[0-9a-fA-F]{24}$/,
    firebaseId: /^[a-zA-Z0-9_-]{20,}$/
};

// Input length limits
export const InputLimits = {
    name: { min: 2, max: 50 },
    email: { min: 5, max: 100 },
    password: { min: 8, max: 128 },
    description: { min: 0, max: 1000 },
    title: { min: 1, max: 200 },
    content: { min: 0, max: 5000 },
    comment: { min: 1, max: 500 },
    tag: { min: 1, max: 30 },
    className: { min: 2, max: 100 },
    courseName: { min: 2, max: 100 }
};

// Validation error messages
export const ValidationMessages = {
    required: 'Trường này là bắt buộc',
    email: 'Email không hợp lệ',
    password: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    name: 'Tên chỉ được chứa chữ cái và khoảng trắng (2-50 ký tự)',
    phoneNumber: 'Số điện thoại không hợp lệ',
    url: 'URL không hợp lệ',
    youtubeUrl: 'URL YouTube không hợp lệ',
    minLength: (min: number) => `Tối thiểu ${min} ký tự`,
    maxLength: (max: number) => `Tối đa ${max} ký tự`,
    numeric: 'Chỉ được nhập số',
    alphanumeric: 'Chỉ được nhập chữ cái và số',
    invalidId: 'ID không hợp lệ'
};

// Validation result interface
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    sanitizedValue?: any;
}

/**
 * Base validator class
 */
export class InputValidator {
    private errors: string[] = [];

    /**
     * Reset validation errors
     */
    reset(): void {
        this.errors = [];
    }

    /**
     * Add validation error
     */
    addError(message: string): void {
        this.errors.push(message);
    }

    /**
     * Get validation result
     */
    getResult(sanitizedValue?: any): ValidationResult {
        return {
            isValid: this.errors.length === 0,
            errors: [...this.errors],
            sanitizedValue
        };
    }

    /**
     * Validate required field
     */
    required(value: any, fieldName: string = 'Trường'): this {
        if (value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0)) {
            this.addError(`${fieldName} ${ValidationMessages.required.toLowerCase()}`);
        }
        return this;
    }

    /**
     * Validate string length
     */
    length(value: string, min: number, max: number, fieldName: string = 'Trường'): this {
        if (typeof value === 'string') {
            if (value.length < min) {
                this.addError(`${fieldName} ${ValidationMessages.minLength(min)}`);
            }
            if (value.length > max) {
                this.addError(`${fieldName} ${ValidationMessages.maxLength(max)}`);
            }
        }
        return this;
    }

    /**
     * Validate pattern
     */
    pattern(value: string, pattern: RegExp, message: string): this {
        if (typeof value === 'string' && value.length > 0 && !pattern.test(value)) {
            this.addError(message);
        }
        return this;
    }

    /**
     * Validate email
     */
    email(value: string): this {
        return this.pattern(value, ValidationPatterns.email, ValidationMessages.email);
    }

    /**
     * Validate password
     */
    password(value: string): this {
        return this.pattern(value, ValidationPatterns.password, ValidationMessages.password);
    }

    /**
     * Validate name
     */
    name(value: string): this {
        return this.pattern(value, ValidationPatterns.name, ValidationMessages.name);
    }

    /**
     * Validate phone number
     */
    phoneNumber(value: string): this {
        return this.pattern(value, ValidationPatterns.phoneNumber, ValidationMessages.phoneNumber);
    }

    /**
     * Validate URL
     */
    url(value: string): this {
        return this.pattern(value, ValidationPatterns.url, ValidationMessages.url);
    }

    /**
     * Validate YouTube URL
     */
    youtubeUrl(value: string): this {
        return this.pattern(value, ValidationPatterns.youtubeUrl, ValidationMessages.youtubeUrl);
    }

    /**
     * Validate numeric input
     */
    numeric(value: string): this {
        return this.pattern(value, ValidationPatterns.numeric, ValidationMessages.numeric);
    }

    /**
     * Validate alphanumeric input
     */
    alphanumeric(value: string): this {
        return this.pattern(value, ValidationPatterns.alphanumeric, ValidationMessages.alphanumeric);
    }

    /**
     * Validate Firebase ID
     */
    firebaseId(value: string): this {
        return this.pattern(value, ValidationPatterns.firebaseId, ValidationMessages.invalidId);
    }

    /**
     * Validate array of values
     */
    array(values: any[], validator: (value: any) => ValidationResult): this {
        values.forEach((value, index) => {
            const result = validator(value);
            if (!result.isValid) {
                result.errors.forEach(error => {
                    this.addError(`Phần tử ${index + 1}: ${error}`);
                });
            }
        });
        return this;
    }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
    /**
     * Sanitize HTML content to prevent XSS
     */
    static sanitizeHtml(input: string): string {
        if (typeof input !== 'string') return '';
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: []
        });
    }

    /**
     * Sanitize plain text input
     */
    static sanitizeText(input: string): string {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 5000); // Limit length
    }

    /**
     * Sanitize email input
     */
    static sanitizeEmail(input: string): string {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9@._+-]/g, '')
            .substring(0, 100);
    }

    /**
     * Sanitize numeric input
     */
    static sanitizeNumber(input: string | number): number | null {
        if (typeof input === 'number') return input;
        if (typeof input !== 'string') return null;

        const cleaned = input.replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }

    /**
     * Sanitize integer input
     */
    static sanitizeInteger(input: string | number): number | null {
        const num = this.sanitizeNumber(input);
        return num !== null ? Math.floor(num) : null;
    }

    /**
     * Sanitize URL input
     */
    static sanitizeUrl(input: string): string {
        if (typeof input !== 'string') return '';

        let url = input.trim();

        // Add protocol if missing
        if (url && !url.match(/^https?:\/\//)) {
            url = 'https://' + url;
        }

        try {
            const urlObj = new URL(url);
            // Only allow http and https protocols
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                return '';
            }
            return urlObj.toString();
        } catch {
            return '';
        }
    }

    /**
     * Sanitize YouTube URL and extract video ID
     */
    static sanitizeYouTubeUrl(input: string): { url: string; videoId: string } {
        if (typeof input !== 'string') return { url: '', videoId: '' };

        const match = input.match(ValidationPatterns.youtubeUrl);
        if (!match) return { url: '', videoId: '' };

        const videoId = match[4];
        const sanitizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

        return { url: sanitizedUrl, videoId };
    }

    /**
     * Sanitize object by applying sanitization to all string properties
     */
    static sanitizeObject<T extends Record<string, any>>(
        obj: T,
        sanitizers: Partial<Record<keyof T, (value: any) => any>>
    ): T {
        const sanitized = { ...obj };

        Object.keys(sanitized).forEach(key => {
            const typedKey = key as keyof T;
            const value = sanitized[typedKey];
            const sanitizer = sanitizers[typedKey];

            if (sanitizer) {
                sanitized[typedKey] = sanitizer(value);
            } else if (typeof value === 'string') {
                sanitized[typedKey] = this.sanitizeText(value) as T[keyof T];
            }
        });

        return sanitized;
    }
}

/**
 * Specific validators for different data types
 */
export class SpecificValidators {
    /**
     * Validate user registration data
     */
    static validateUserRegistration(data: {
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
        role: string;
    }): ValidationResult {
        const validator = new InputValidator();

        validator
            .required(data.fullName, 'Họ tên')
            .length(data.fullName, InputLimits.name.min, InputLimits.name.max, 'Họ tên')
            .name(data.fullName);

        validator
            .required(data.email, 'Email')
            .length(data.email, InputLimits.email.min, InputLimits.email.max, 'Email')
            .email(data.email);

        validator
            .required(data.password, 'Mật khẩu')
            .length(data.password, InputLimits.password.min, InputLimits.password.max, 'Mật khẩu')
            .password(data.password);

        if (data.password !== data.confirmPassword) {
            validator.addError('Mật khẩu xác nhận không khớp');
        }

        const allowedRoles = ['student', 'teacher', 'admin', 'parent'];
        if (!allowedRoles.includes(data.role)) {
            validator.addError('Vai trò không hợp lệ');
        }

        const sanitizedData = {
            fullName: InputSanitizer.sanitizeText(data.fullName),
            email: InputSanitizer.sanitizeEmail(data.email),
            password: data.password, // Don't sanitize password
            role: data.role
        };

        return validator.getResult(sanitizedData);
    }

    /**
     * Validate flashcard data
     */
    static validateFlashcard(data: {
        frontText: string;
        backText: string;
        exampleSentence?: string;
        imageUrl?: string;
    }): ValidationResult {
        const validator = new InputValidator();

        validator
            .required(data.frontText, 'Mặt trước thẻ')
            .length(data.frontText, 1, InputLimits.content.max, 'Mặt trước thẻ');

        validator
            .required(data.backText, 'Mặt sau thẻ')
            .length(data.backText, 1, InputLimits.content.max, 'Mặt sau thẻ');

        if (data.exampleSentence) {
            validator.length(data.exampleSentence, 0, InputLimits.content.max, 'Câu ví dụ');
        }

        if (data.imageUrl) {
            validator.url(data.imageUrl);
        }

        const sanitizedData = InputSanitizer.sanitizeObject(data, {
            frontText: InputSanitizer.sanitizeText,
            backText: InputSanitizer.sanitizeText,
            exampleSentence: InputSanitizer.sanitizeText,
            imageUrl: InputSanitizer.sanitizeUrl
        });

        return validator.getResult(sanitizedData);
    }

    /**
     * Validate question data
     */
    static validateQuestion(data: {
        content: string;
        type: string;
        options?: string[];
        correctAnswer: string | number;
        explanation?: string;
        difficulty: string;
        tags: string[];
    }): ValidationResult {
        const validator = new InputValidator();

        validator
            .required(data.content, 'Nội dung câu hỏi')
            .length(data.content, 1, InputLimits.content.max, 'Nội dung câu hỏi');

        const allowedTypes = ['multiple_choice', 'fill_blank'];
        if (!allowedTypes.includes(data.type)) {
            validator.addError('Loại câu hỏi không hợp lệ');
        }

        if (data.type === 'multiple_choice') {
            validator.required(data.options, 'Các lựa chọn');
            if (data.options && data.options.length < 2) {
                validator.addError('Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn');
            }
        }

        validator.required(data.correctAnswer, 'Đáp án đúng');

        const allowedDifficulties = ['easy', 'medium', 'hard'];
        if (!allowedDifficulties.includes(data.difficulty)) {
            validator.addError('Độ khó không hợp lệ');
        }

        if (data.tags && data.tags.length > 10) {
            validator.addError('Tối đa 10 thẻ tag');
        }

        const sanitizedData = InputSanitizer.sanitizeObject(data, {
            content: InputSanitizer.sanitizeText,
            options: (options: string[]) => options?.map(InputSanitizer.sanitizeText),
            correctAnswer: (answer: string | number) =>
                typeof answer === 'string' ? InputSanitizer.sanitizeText(answer) : answer,
            explanation: InputSanitizer.sanitizeText,
            tags: (tags: string[]) => tags?.map(InputSanitizer.sanitizeText)
        });

        return validator.getResult(sanitizedData);
    }

    /**
     * Validate course data
     */
    static validateCourse(data: {
        name: string;
        description: string;
        targetAgeGroup: string;
        imageUrl?: string;
    }): ValidationResult {
        const validator = new InputValidator();

        validator
            .required(data.name, 'Tên khóa học')
            .length(data.name, InputLimits.courseName.min, InputLimits.courseName.max, 'Tên khóa học');

        validator
            .required(data.description, 'Mô tả khóa học')
            .length(data.description, 1, InputLimits.description.max, 'Mô tả khóa học');

        validator.required(data.targetAgeGroup, 'Độ tuổi mục tiêu');

        if (data.imageUrl) {
            validator.url(data.imageUrl);
        }

        const sanitizedData = InputSanitizer.sanitizeObject(data, {
            name: InputSanitizer.sanitizeText,
            description: InputSanitizer.sanitizeText,
            targetAgeGroup: InputSanitizer.sanitizeText,
            imageUrl: InputSanitizer.sanitizeUrl
        });

        return validator.getResult(sanitizedData);
    }

    /**
     * Validate class data
     */
    static validateClass(data: {
        name: string;
        description: string;
        capacity: number;
        courseId: string;
        teacherId: string;
    }): ValidationResult {
        const validator = new InputValidator();

        validator
            .required(data.name, 'Tên lớp học')
            .length(data.name, InputLimits.className.min, InputLimits.className.max, 'Tên lớp học');

        validator
            .required(data.description, 'Mô tả lớp học')
            .length(data.description, 1, InputLimits.description.max, 'Mô tả lớp học');

        validator.required(data.capacity, 'Sức chứa lớp học');
        if (typeof data.capacity === 'number' && (data.capacity < 1 || data.capacity > 100)) {
            validator.addError('Sức chứa lớp học phải từ 1 đến 100 học sinh');
        }

        validator
            .required(data.courseId, 'ID khóa học')
            .firebaseId(data.courseId);

        validator
            .required(data.teacherId, 'ID giáo viên')
            .firebaseId(data.teacherId);

        const sanitizedData = {
            name: InputSanitizer.sanitizeText(data.name),
            description: InputSanitizer.sanitizeText(data.description),
            capacity: InputSanitizer.sanitizeInteger(data.capacity) || 0,
            courseId: InputSanitizer.sanitizeText(data.courseId),
            teacherId: InputSanitizer.sanitizeText(data.teacherId)
        };

        return validator.getResult(sanitizedData);
    }
}

/**
 * React hook for form validation
 */
export const useFormValidation = () => {
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const validateField = (fieldName: string, value: any, validator: (value: any) => ValidationResult) => {
        const result = validator(value);

        setErrors(prev => ({
            ...prev,
            [fieldName]: result.errors
        }));

        return result;
    };

    const clearErrors = (fieldName?: string) => {
        if (fieldName) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        } else {
            setErrors({});
        }
    };

    const hasErrors = (fieldName?: string) => {
        if (fieldName) {
            return errors[fieldName] && errors[fieldName].length > 0;
        }
        return Object.keys(errors).some(key => errors[key].length > 0);
    };

    const getFieldErrors = (fieldName: string) => {
        return errors[fieldName] || [];
    };

    return {
        errors,
        validateField,
        clearErrors,
        hasErrors,
        getFieldErrors
    };
};