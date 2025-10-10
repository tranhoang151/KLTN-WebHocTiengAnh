import React, { useState, useRef } from 'react';
import { Flashcard, flashcardService } from '../../services/flashcardService';
import './FlashcardForm.css';

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
    frontText: editingCard?.front_text || '',
    backText: editingCard?.back_text || '',
    exampleSentence: editingCard?.example_sentence || '',
    imageFile: null,
    imageUrl: editingCard?.image_url || '',
    order: editingCard?.order || nextOrder,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingCard?.image_url || null
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
    <div className="flashcard-form">
      <div className="form-header">
        <h2>{editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}</h2>
        <button onClick={onCancel} className="btn-close">
          ✕
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="frontText">Front Text *</label>
            <input
              type="text"
              id="frontText"
              name="frontText"
              value={formData.frontText}
              onChange={handleInputChange}
              placeholder="Enter the front text (e.g., English word)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="backText">Back Text *</label>
            <input
              type="text"
              id="backText"
              name="backText"
              value={formData.backText}
              onChange={handleInputChange}
              placeholder="Enter the back text (e.g., Vietnamese translation)"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="exampleSentence">Example Sentence</label>
          <textarea
            id="exampleSentence"
            name="exampleSentence"
            value={formData.exampleSentence}
            onChange={handleInputChange}
            placeholder="Enter an example sentence (optional)"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Image</label>
          <div className="image-input-section">
            <div className="image-input-tabs">
              <button
                type="button"
                className="tab-button active"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </button>
              <span className="tab-separator">or</span>
              <label className="tab-button">Enter URL</label>
            </div>

            <div className="image-inputs">
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
                className="image-url-input"
              />
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="order">Order</label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            min="1"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? 'Saving...'
              : editingCard
                ? 'Update Card'
                : 'Create Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardForm;
