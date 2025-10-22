import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
    maxTags?: number;
    disabled?: boolean;
}

const TagsInput: React.FC<TagsInputProps> = ({
    tags,
    onChange,
    placeholder = 'Add tags...',
    suggestions = [],
    maxTags = 10,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = suggestions
                .filter(suggestion =>
                    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !tags.includes(suggestion)
                )
                .slice(0, 5);
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
            setFilteredSuggestions([]);
        }
    }, [inputValue, suggestions, tags]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue.trim());
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag) && tags.length < maxTags) {
            onChange([...tags, tag]);
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const handleSuggestionClick = (suggestion: string) => {
        addTag(suggestion);
    };

    const handleInputFocus = () => {
        if (inputValue.trim()) {
            setShowSuggestions(true);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Tags Display */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    minHeight: '40px',
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: disabled ? '#f9fafb' : '#ffffff',
                    cursor: disabled ? 'not-allowed' : 'text',
                    transition: 'all 0.3s ease',
                }}
                onClick={() => {
                    if (!disabled) {
                        inputRef.current?.focus();
                    }
                }}
            >
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#f3e8ff',
                            color: '#7c3aed',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid #c4b5fd',
                        }}
                    >
                        <Tag size={12} />
                        {tag}
                        {!disabled && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(index);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#7c3aed',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#5b21b6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#7c3aed';
                                }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </span>
                ))}

                {!disabled && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onFocus={handleInputFocus}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        disabled={disabled}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: '14px',
                            color: '#374151',
                            flex: 1,
                            minWidth: '120px',
                        }}
                    />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                fontSize: '14px',
                                color: '#374151',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Plus size={14} color="#6b7280" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Helper Text */}
            {tags.length >= maxTags && (
                <div
                    style={{
                        fontSize: '12px',
                        color: '#ef4444',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    <X size={12} />
                    Maximum {maxTags} tags allowed
                </div>
            )}
        </div>
    );
};

export default TagsInput;


