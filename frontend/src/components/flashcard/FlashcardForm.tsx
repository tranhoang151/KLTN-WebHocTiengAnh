import React, { useState, useRef } from 'react';
import { Flashcard, flashcardService } from '../../services/flashcardService';
import {
  X,
  FileText,
  Upload,
  Link,
  Image,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  BookOpen,
  Lightbulb,
  Hash,
} from 'lucide-react';

interface FlashcardFormProps {
  flashcardSetId: string;
  editingCard?: Flashcard | null;
  nextOrder: number;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  frontText: string;
  backText: string;
  exampleSentence: string;
  imageFile: File | null;
  imageUrl: string;
  order: number;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  flashcardSetId,
  editingCard,
  nextOrder,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    frontText: editingCard?.frontText || '',
    backText: editingCard?.backText || '',
    exampleSentence: editingCard?.exampleSentence || '',
    imageFile: null,
    imageUrl: editingCard?.imageUrl || '',
    order: editingCard?.order || nextOrder,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingCard?.imageUrl ||
      (editingCard?.imageBase64
        ? `data:image/jpeg;base64,${editingCard.imageBase64}`
        : null)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: '', // Clear URL when file is selected
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      imageFile: null, // Clear file when URL is entered
    }));

    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: '',
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.frontText.trim()) {
      setError('Front text is required');
      return;
    }

    if (!formData.backText.trim()) {
      setError('Back text is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageBase64 = '';
      let imageUrl = formData.imageUrl;

      // Handle image upload
      if (formData.imageFile) {
        imageBase64 = await convertFileToBase64(formData.imageFile);
        // The backend will handle uploading to Firebase Storage and return the URL
      }

      const cardData = {
        frontText: formData.frontText.trim(),
        backText: formData.backText.trim(),
        exampleSentence: formData.exampleSentence.trim() || undefined,
        imageUrl: imageUrl || undefined,
        imageBase64: imageBase64 || undefined,
        order: formData.order,
      };

      if (editingCard) {
        await flashcardService.updateFlashcard(editingCard.id, cardData);
      } else {
        await flashcardService.createFlashcard(flashcardSetId, cardData);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <FileText size={20} color="white" />
            </div>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0',
              }}
            >
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ef4444, #dc2626)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={14} color="white" />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
              }}
            >
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Front and Back Text */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                <BookOpen size={16} color="#3b82f6" />
                Front Text *
              </label>
              <input
                type="text"
                name="frontText"
                value={formData.frontText}
                onChange={handleInputChange}
                placeholder="Enter the front text (e.g., English word)"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                <BookOpen size={16} color="#10b981" />
                Back Text *
              </label>
              <input
                type="text"
                name="backText"
                value={formData.backText}
                onChange={handleInputChange}
                placeholder="Enter the back text (e.g., Vietnamese translation)"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Example Sentence */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <Lightbulb size={16} color="#f59e0b" />
              Example Sentence
            </label>
            <textarea
              name="exampleSentence"
              value={formData.exampleSentence}
              onChange={handleInputChange}
              placeholder="Enter an example sentence (optional)"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Image Section */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
              }}
            >
              <Image size={16} color="#8b5cf6" />
              Image
            </label>

            {/* Upload Options */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                <Upload size={16} />
                Upload File
              </button>
              <span
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500',
                }}
              >
                or
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Link size={14} />
                Enter URL
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <input
              type="url"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              placeholder="Enter image URL"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div
                style={{
                  marginTop: '16px',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '2px solid #e5e7eb',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <Trash2 size={14} color="white" />
                </button>
              </div>
            )}
          </div>

          {/* Order */}
          <div style={{ marginBottom: '32px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <Hash size={16} color="#6b7280" />
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                color: '#374151',
                border: '1px solid #cbd5e1',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <XCircle size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: loading
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform =
                    'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 25px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #fff',
                      borderBottomColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {editingCard ? 'Update Card' : 'Create Card'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FlashcardForm;
