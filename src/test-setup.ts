import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Ensure clean localStorage state before each test
beforeEach(() => {
  localStorage.clear();
});
