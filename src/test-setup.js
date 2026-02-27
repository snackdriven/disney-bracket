import '@testing-library/jest-dom';

// Simple localStorage mock for jsdom (already included, but ensure clean state)
beforeEach(() => {
  localStorage.clear();
});
