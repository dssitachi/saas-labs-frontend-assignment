import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
});