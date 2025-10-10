import '@testing-library/jest-dom';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveTextContent(text: string | RegExp): R;
            toHaveFocus(): R;
            toHaveAttribute(attr: string, value?: string): R;
            toHaveClass(className: string): R;
            toHaveStyle(style: string | object): R;
            toBeVisible(): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toBeChecked(): R;
            toHaveValue(value: string | number): R;
        }
    }
}