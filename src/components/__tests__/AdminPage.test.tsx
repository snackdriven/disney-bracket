import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminPage } from '../AdminPage';

describe('AdminPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles localStorage load failure gracefully when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'tmdb-meta-v1') {
        throw new Error('Simulated localStorage error');
      }
      return null;
    });

    render(<AdminPage />);

    // Check if table header is rendered, meaning the component loaded fine
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  it('handles localStorage load failure gracefully when JSON is invalid', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'tmdb-meta-v1') {
        return '{ invalid: json }';
      }
      return null;
    });

    render(<AdminPage />);

    // Check if table header is rendered, meaning the component loaded fine
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });
});
