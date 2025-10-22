import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders loading spinner with default props', () => {
        render(<LoadingSpinner />);

        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-label', 'Loading content');
        expect(spinner).toHaveClass('loading-container');

        const spinnerElement = spinner.querySelector('.loading-spinner');
        expect(spinnerElement).toHaveClass('spinner-medium spinner-primary');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="small" />);
        let spinnerElement = document.querySelector('.loading-spinner');
        expect(spinnerElement).toHaveClass('spinner-small');

        rerender(<LoadingSpinner size="large" />);
        spinnerElement = document.querySelector('.loading-spinner');
        expect(spinnerElement).toHaveClass('spinner-large');

        const container = document.querySelector('.loading-container');
        expect(container).toHaveClass('container-large');
    });

    it('renders with custom message', () => {
        const customMessage = 'Loading your flashcards...';
        render(<LoadingSpinner message={customMessage} />);

        const spinner = screen.getByRole('status');
        expect(spinner).toHaveAttribute('aria-label', customMessage);

        const messageElement = screen.getByText(customMessage);
        expect(messageElement).toBeInTheDocument();
        expect(messageElement).toHaveClass('message-text');
    });

    it('renders with different colors', () => {
        const { rerender } = render(<LoadingSpinner color="secondary" />);
        let spinnerElement = document.querySelector('.loading-spinner');
        expect(spinnerElement).toHaveClass('spinner-secondary');

        rerender(<LoadingSpinner color="white" />);
        spinnerElement = document.querySelector('.loading-spinner');
        expect(spinnerElement).toHaveClass('spinner-white');
    });

    it('renders in fullscreen mode', () => {
        render(<LoadingSpinner fullScreen />);

        const container = document.querySelector('.loading-container');
        expect(container).toHaveClass('container-fullscreen');

        const spinner = document.querySelector('.loading-spinner');
        expect(spinner).toHaveClass('spinner-fullscreen');
    });

    it('has proper accessibility attributes', () => {
        render(<LoadingSpinner message="Loading data" />);

        const spinner = screen.getByRole('status');
        expect(spinner).toHaveAttribute('aria-live', 'polite');
        expect(spinner).toHaveAttribute('aria-label', 'Loading data');

        const srText = screen.getByText('Loading data', { selector: '.sr-only' });
        expect(srText).toBeInTheDocument();
    });

    it('renders spinner dots', () => {
        render(<LoadingSpinner />);

        const dots = document.querySelectorAll('.spinner-dot');
        expect(dots).toHaveLength(8);

        dots.forEach((dot, index) => {
            expect(dot).toHaveClass(`spinner-dot-${index + 1}`);
        });
    });

    it('applies custom className', () => {
        const customClass = 'custom-spinner';
        render(<LoadingSpinner className={customClass} />);

        const spinner = document.querySelector('.loading-spinner');
        expect(spinner).toHaveClass(customClass);
    });
});


