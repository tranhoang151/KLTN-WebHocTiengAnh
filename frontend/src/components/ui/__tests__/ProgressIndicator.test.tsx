import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressIndicator from '../ProgressIndicator';

describe('ProgressIndicator', () => {
    it('renders with steps', () => {
        const steps = [
            { id: '1', label: 'Step 1', status: 'completed' as const },
            { id: '2', label: 'Step 2', status: 'active' as const },
            { id: '3', label: 'Step 3', status: 'pending' as const }
        ];

        render(<ProgressIndicator steps={steps} />);

        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('renders with current step', () => {
        const steps = [
            { id: '1', label: 'First Step', status: 'completed' as const },
            { id: '2', label: 'Second Step', status: 'active' as const },
            { id: '3', label: 'Third Step', status: 'pending' as const }
        ];

        render(<ProgressIndicator steps={steps} currentStep="2" />);

        const container = screen.getByRole('progressbar');
        expect(container).toBeInTheDocument();
    });

    it('renders with title', () => {
        const steps = [
            { id: '1', label: 'Step 1', status: 'active' as const }
        ];

        render(<ProgressIndicator steps={steps} title="Test Progress" />);

        expect(screen.getByText('Test Progress')).toBeInTheDocument();
    });

    it('renders with cancel button', () => {
        const steps = [
            { id: '1', label: 'Step 1', status: 'active' as const }
        ];
        const mockOnCancel = jest.fn();

        render(<ProgressIndicator steps={steps} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByLabelText('Cancel operation');
        expect(cancelButton).toBeInTheDocument();

        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('renders different step statuses', () => {
        const steps = [
            { id: '1', label: 'Completed Step', status: 'completed' as const },
            { id: '2', label: 'Error Step', status: 'error' as const },
            { id: '3', label: 'Active Step', status: 'active' as const },
            { id: '4', label: 'Pending Step', status: 'pending' as const }
        ];

        render(<ProgressIndicator steps={steps} />);

        expect(screen.getByText('Completed Step')).toBeInTheDocument();
        expect(screen.getByText('Error Step')).toBeInTheDocument();
        expect(screen.getByText('Active Step')).toBeInTheDocument();
        expect(screen.getByText('Pending Step')).toBeInTheDocument();
    });

    it('renders with step descriptions', () => {
        const steps = [
            {
                id: '1',
                label: 'Step with Description',
                status: 'active' as const,
                description: 'This step has a description'
            }
        ];

        render(<ProgressIndicator steps={steps} />);

        expect(screen.getByText('Step with Description')).toBeInTheDocument();
        expect(screen.getByText('This step has a description')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const steps = [
            { id: '1', label: 'Step 1', status: 'active' as const }
        ];

        render(<ProgressIndicator steps={steps} className="custom-progress-class" />);

        const container = screen.getByRole('progressbar');
        expect(container).toHaveClass('custom-progress-class');
    });

    it('shows overall progress correctly', () => {
        const steps = [
            { id: '1', label: 'Step 1', status: 'completed' as const },
            { id: '2', label: 'Step 2', status: 'completed' as const },
            { id: '3', label: 'Step 3', status: 'active' as const },
            { id: '4', label: 'Step 4', status: 'pending' as const }
        ];

        render(<ProgressIndicator steps={steps} />);

        expect(screen.getByText('2 of 4 completed')).toBeInTheDocument();
    });
});


