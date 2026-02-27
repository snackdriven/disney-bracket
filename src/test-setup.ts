import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Simple localStorage mock for jsdom (already included, but ensure clean state)
beforeEach(() => {
  localStorage.clear();
});
