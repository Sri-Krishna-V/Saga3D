import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Saga3D app', () => {
  render(<App />);
  // This test needs to be updated based on actual content
  // For now, we'll just check that the app renders without crashing
  expect(document.querySelector('.App')).toBeInTheDocument();
});
