
// Custom jest-dom setup for integration tests
import '@testing-library/jest-dom';

// Extend expect with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveFocus(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
    }
  }
}

// Mock implementations for missing matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in document`,
      pass,
    };
  },
  toHaveTextContent(received, expected) {
    const pass = received && received.textContent && received.textContent.includes(expected);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have text content "${expected}"`,
      pass,
    };
  },
  toHaveFocus(received) {
    const pass = received === document.activeElement;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have focus`,
      pass,
    };
  },
  toHaveAttribute(received, attr, value) {
    const hasAttr = received && received.hasAttribute && received.hasAttribute(attr);
    const pass = value ? hasAttr && received.getAttribute(attr) === value : hasAttr;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have attribute "${attr}"${value ? ` with value "${value}"` : ''}`,
      pass,
    };
  },
});
