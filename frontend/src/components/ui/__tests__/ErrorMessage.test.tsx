import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
    const mockOnRetry = jest.fn();
    const mockOnDismiss = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders error message with title and description', () => {
        render(
            <ErrorMessage
                title="Something went wrong"
                message="Please try again later"
            />
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
    });

    it('renders with default title when not provided', () => {
        render(<ErrorMessage message="Error occurred" />);

        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('renders with different types', () => {
        const { rerender } = render(
            <ErrorMessage type="error" message="Error message" />
        );

        let container = screen.getByRole('alert');
        expect(container).toHaveClass('error-message-container error-error');

        rerender(<ErrorMessage type="warning" message="Warning message" />);

        container = screen.getByRole('alert');
        expect(container).toHaveClass('error-message warning');
    });

    it('renders retry button when onRetry is provided', () => {
        render(
            <ErrorMessage
                message="Network error"
                onRetry={mockOnRetry}
            />
        );

        const retryButton = screen.getByRole('button', { name: /try again/i });
        expect(retryButton).toBeInTheDocument();

        fireEvent.click(retryButton);
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('renders dismiss button when onDismiss is provided', () => {
        render(
            <ErrorMessage
                message="Dismissible error"
                onDismiss={mockOnDismiss}
            />
        );

        const dismissButton = screen.getByRole('button', { name: /dismiss/i });
        expect(dismissButton).toBeInTheDocument();

        fireEvent.click(dismissButton);
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders both retry and dismiss buttons', () => {
        render(
            <ErrorMessage
                message="Error with both actions"
                onRetry={mockOnRetry}
                onDismiss={mockOnDismiss}
            />
        );

        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('renders with custom retry button text', () => {
        render(
            <ErrorMessage
                message="Custom retry text"
                onRetry={mockOnRetry}
                retryText="Reload Page"
            />
        );

        expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
        render(
            <ErrorMessage
                message="Error with custom icon"
                icon="🚨"
            />
        );

        const icon = document.querySelector('.error-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveTextContent('🚨');
    });

    it('renders info type', () => {
        render(
            <ErrorMessage
                message="Information message"
                type="info"
            />
        );

        const container = screen.getByRole('alert');
        expect(container).toHaveClass('error-info');

        // Should have info default title
        expect(screen.getByText('Information')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(
            <ErrorMessage
                message="Accessible error message"
                aria-label="Custom error label"
            />
        );

        const container = screen.getByRole('alert');
        expect(container).toHaveAttribute('aria-live', 'assertive');
        expect(container).toHaveAttribute('aria-labelledby', 'error-title');
    });

    it('renders with details section', () => {
        const errorDetails = 'Error code: 500\nTimestamp: 2024-01-01';

        render(
            <ErrorMessage
                message="Server error"
                details={errorDetails}
                showDetails={true}
            />
        );

        // Click to show details
        const detailsButton = screen.getByText('Show Details');
        fireEvent.click(detailsButton);

        expect(screen.getByText(/Error code: 500/)).toBeInTheDocument();
        expect(screen.getByText(/Timestamp: 2024-01-01/)).toBeInTheDocument();
    });

    it('toggles details visibility', () => {
        const errorDetails = 'Hidden details';

        render(
            <ErrorMessage
                message="Error with toggleable details"
                details={errorDetails}
            />
        );

        // Details should be hidden initially
        expect(screen.queryByText('Hidden details')).not.toBeInTheDocument();

        // Click show details button
        const showDetailsButton = screen.getByRole('button', { name: /show details/i });
        fireEvent.click(showDetailsButton);

        // Details should now be visible
        expect(screen.getByText('Hidden details')).toBeInTheDocument();

        // Button text should change
        expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(
            <ErrorMessage
                message="Custom styled error"
                className="custom-error-class"
            />
        );

        const container = screen.getByRole('alert');
        expect(container).toHaveClass('custom-error-class');
    });

    it('renders with custom retry text', () => {
        render(
            <ErrorMessage
                message="Error with custom retry text"
                onRetry={mockOnRetry}
                retryText="Custom Retry Action"
            />
        );

        const retryButton = screen.getByRole('button', { name: 'Custom Retry Action' });
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveClass('retry-button');
    });
});


