import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChildFriendlyButton from '../ChildFriendlyButton';

describe('ChildFriendlyButton', () => {
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders button with text', () => {
        render(<ChildFriendlyButton onClick={mockOnClick}>Click Me!</ChildFriendlyButton>);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn-child btn-primary');
    });

    it('calls onClick when clicked', () => {
        render(<ChildFriendlyButton onClick={mockOnClick}>Click Me!</ChildFriendlyButton>);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('renders with different variants', () => {
        const { rerender } = render(
            <ChildFriendlyButton variant="primary" onClick={mockOnClick}>Primary</ChildFriendlyButton>
        );

        let button = screen.getByRole('button');
        expect(button).toHaveClass('btn-primary');

        rerender(
            <ChildFriendlyButton variant="secondary" onClick={mockOnClick}>Secondary</ChildFriendlyButton>
        );

        button = screen.getByRole('button');
        expect(button).toHaveClass('btn-secondary');

        rerender(
            <ChildFriendlyButton variant="playful" onClick={mockOnClick}>Playful</ChildFriendlyButton>
        );

        button = screen.getByRole('button');
        expect(button).toHaveClass('btn-playful');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(
            <ChildFriendlyButton size="normal" onClick={mockOnClick}>Normal</ChildFriendlyButton>
        );

        let button = screen.getByRole('button');
        expect(button).not.toHaveClass('btn-large');

        rerender(
            <ChildFriendlyButton size="large" onClick={mockOnClick}>Large</ChildFriendlyButton>
        );

        button = screen.getByRole('button');
        expect(button).toHaveClass('btn-large');
    });

    it('renders disabled state correctly', () => {
        render(
            <ChildFriendlyButton disabled onClick={mockOnClick}>Disabled</ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('does not call onClick when disabled', () => {
        render(
            <ChildFriendlyButton disabled onClick={mockOnClick}>Disabled</ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('renders with icon', () => {
        render(
            <ChildFriendlyButton icon="🎯" onClick={mockOnClick}>With Icon</ChildFriendlyButton>
        );

        const icon = screen.getByRole('img');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveTextContent('🎯');
        expect(icon).toHaveClass('btn-icon-emoji');
        expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders icon-only button', () => {
        render(
            <ChildFriendlyButton icon="🎯" ariaLabel="Target" onClick={mockOnClick} />
        );

        const button = screen.getByRole('button', { name: 'Target' });
        expect(button).toHaveClass('btn-icon');

        const icon = screen.getByRole('img');
        expect(icon).toBeInTheDocument();
    });

    it('renders loading state', () => {
        render(
            <ChildFriendlyButton loading onClick={mockOnClick}>Loading</ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');

        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeInTheDocument();

        const loadingDots = document.querySelectorAll('.loading-dot');
        expect(loadingDots).toHaveLength(3);
    });

    it('does not call onClick when loading', () => {
        render(
            <ChildFriendlyButton loading onClick={mockOnClick}>Loading</ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('has proper accessibility attributes', () => {
        render(
            <ChildFriendlyButton
                onClick={mockOnClick}
                ariaLabel="Custom aria label"
            >
                Button
            </ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Custom aria label');
    });

    it('supports different button types', () => {
        const { rerender } = render(
            <ChildFriendlyButton type="submit" onClick={mockOnClick}>Submit</ChildFriendlyButton>
        );

        let button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');

        rerender(
            <ChildFriendlyButton type="reset" onClick={mockOnClick}>Reset</ChildFriendlyButton>
        );

        button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'reset');
    });

    it('applies custom className', () => {
        render(
            <ChildFriendlyButton className="custom-class" onClick={mockOnClick}>
                Custom Class
            </ChildFriendlyButton>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('has hover bounce class', () => {
        render(<ChildFriendlyButton onClick={mockOnClick}>Button</ChildFriendlyButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover-bounce');
    });
});