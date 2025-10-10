import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Just test that the app renders without errors
  expect(document.body).toBeInTheDocument();
});
