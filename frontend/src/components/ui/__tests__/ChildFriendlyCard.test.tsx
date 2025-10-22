import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChildFriendlyCard from '../ChildFriendlyCard';

describe('ChildFriendlyCard', () => {
    it('renders card with title and children', () => {
        render(
            <ChildFriendlyCard title="Test Card">
                <p>Card content</p>
            </ChildFriendlyCard>
        );

        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders without title', () => {
        render(
            <ChildFriendlyCard>
                <p>Card content without title</p>
            </ChildFriendlyCard>
        );

        expect(screen.getByText('Card content without title')).toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders with different variants', () => {
        const { rerender } = render(
            <ChildFriendlyCard className="card-primary" title="Primary Card">
                Content
            </ChildFriendlyCard>
        );

        let card = screen.getByLabelText('Primary Card');
        expect(card).toHaveClass('card-primary');

        rerender(
            <ChildFriendlyCard className="card-success" title="Success Card">
                Content
            </ChildFriendlyCard>
        );

        card = screen.getByRole('article');
        expect(card).toHaveClass('card-success');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(
            <ChildFriendlyCard className="card-small" title="Small Card">
                Content
            </ChildFriendlyCard>
        );

        let card = screen.getByLabelText('Small Card');
        expect(card).toHaveClass('card-small');

        rerender(
            <ChildFriendlyCard className="card-large" title="Large Card">
                Content
            </ChildFriendlyCard>
        );

        card = screen.getByRole('article');
        expect(card).toHaveClass('card-large');
    });

    it('renders clickable card', () => {
        const mockOnClick = jest.fn();

        render(
            <ChildFriendlyCard title="Clickable Card" onClick={mockOnClick}>
                Click me!
            </ChildFriendlyCard>
        );

        const card = screen.getByRole('button');
        expect(card).toHaveClass('interactive');

        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('renders with icon', () => {
        const icon = <span data-testid="card-icon">🎯</span>;

        render(
            <ChildFriendlyCard title="Card with Icon" icon="test-icon">
                Content with icon
            </ChildFriendlyCard>
        );

        expect(screen.getByTestId('card-icon')).toBeInTheDocument();
    });

    it('renders with badge', () => {
        render(
            <ChildFriendlyCard title="Card with Badge" badge="New!">
                Content with badge
            </ChildFriendlyCard>
        );

        expect(screen.getByText('New!')).toBeInTheDocument();
        expect(screen.getByText('New!')).toHaveClass('badge-child');
    });

    it('renders with different colors', () => {
        const { rerender } = render(
            <ChildFriendlyCard title="Blue Card" color="blue">
                Blue content
            </ChildFriendlyCard>
        );

        let card = screen.getByLabelText('Blue Card');
        expect(card).toHaveClass('card-blue');

        rerender(
            <ChildFriendlyCard title="Green Card" color="green">
                Green content
            </ChildFriendlyCard>
        );

        card = screen.getByLabelText('Green Card');
        expect(card).toHaveClass('card-green');
    });

    it('renders non-interactive state', () => {
        const mockOnClick = jest.fn();

        render(
            <ChildFriendlyCard title="Non-interactive Card" onClick={mockOnClick}>
                Non-interactive content
            </ChildFriendlyCard>
        );

        const card = screen.getByLabelText('Non-interactive Card');
        expect(card).not.toHaveClass('interactive');

        // Should not have button role since it's not interactive
        expect(card).not.toHaveAttribute('role', 'button');
    });

    it('has proper accessibility attributes', () => {
        render(
            <ChildFriendlyCard
                title="Accessible Card"
                aria-label="Custom aria label"
                aria-describedby="description-id"
            >
                Accessible content
            </ChildFriendlyCard>
        );

        const card = screen.getByLabelText('Custom aria label');
        expect(card).toHaveAttribute('aria-label', 'Custom aria label');
        expect(card).toHaveAttribute('aria-describedby', 'description-id');
    });

    it('supports keyboard navigation for clickable cards', () => {
        const mockOnClick = jest.fn();

        render(
            <ChildFriendlyCard title="Keyboard Card" onClick={mockOnClick}>
                Keyboard accessible
            </ChildFriendlyCard>
        );

        const card = screen.getByRole('button');

        // Test Enter key
        fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
        expect(mockOnClick).toHaveBeenCalledTimes(1);

        // Test Space key
        fireEvent.keyDown(card, { key: ' ', code: 'Space' });
        expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('applies custom className', () => {
        render(
            <ChildFriendlyCard className="custom-card-class" title="Custom Class Card">
                Custom styled content
            </ChildFriendlyCard>
        );

        const card = screen.getByLabelText('Custom Class Card');
        expect(card).toHaveClass('custom-card-class');
    });

    it('renders with footer content', () => {
        render(
            <ChildFriendlyCard title="Card with Footer">
                <div>
                    <p>Main content</p>
                    <button>Footer Button</button>
                </div>
            </ChildFriendlyCard>
        );

        expect(screen.getByText('Main content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
    });
});


