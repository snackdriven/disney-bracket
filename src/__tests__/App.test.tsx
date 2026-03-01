import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import { applyPick, resetState } from '../lib/bracket';
import { serMatch } from '../lib/utils';

// Supabase is created at module scope in App.tsx — mock the whole module.
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }),
  }),
}));

// canvas.getContext is not implemented in jsdom — stub it.
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(), fillText: vi.fn(), clearRect: vi.fn(), measureText: vi.fn(() => ({ width: 0 })),
  save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
  stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(), clip: vi.fn(), scale: vi.fn(), translate: vi.fn(),
  drawImage: vi.fn(), roundRect: vi.fn(), createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  set fillStyle(_: unknown) {}, set strokeStyle(_: unknown) {}, set font(_: unknown) {},
  set textAlign(_: unknown) {}, set lineWidth(_: unknown) {}, set globalAlpha(_: unknown) {},
  set shadowColor(_: unknown) {}, set shadowBlur(_: unknown) {},
}) as ReturnType<typeof HTMLCanvasElement.prototype.getContext>;

// jsdom doesn't implement matchMedia — stub it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/** Serialize bracket state for localStorage seeding in tests. */
function serializeState(s: ReturnType<typeof resetState>) {
  return JSON.stringify({
    ph: s.ph, piI: s.piI, cr: s.cr, cm: s.cm, ch: s.ch, hi: s.hi, upsets: s.upsets,
    piM: serMatch(s.piM),
    rds: s.rds.map(r => serMatch(r)),
  });
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

describe('App — initial render', () => {
  it('shows play-in round label on fresh load', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('round-label')).toHaveTextContent('Play-In Round');
    });
  });

  it('renders Match 1 of 6 counter on fresh load', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
    });
  });

  it('shows two movie cards for the first match', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByTestId('movie-card')).toHaveLength(2);
    });
  });

  it('shows sync button when not authenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sync across devices/i })).toBeInTheDocument();
    });
  });

  it('progress bar starts at 0', async () => {
    render(<App />);
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '0');
    });
  });
});

describe('App — pick interaction', () => {
  it('advances the match counter after clicking a card', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    fireEvent.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6');
    });
  });

  it('saves bracket state to localStorage after a pick', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    fireEvent.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => {
      const stored = localStorage.getItem('dbk-state');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).piI).toBe(1);
    });
  });

  it('progress bar advances after a pick', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    fireEvent.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    });
  });

  it('undo button reverts the last pick', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    fireEvent.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6'));

    fireEvent.click(screen.getByRole('button', { name: /Undo/i }));

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
    });
  });

  it('reset button returns to Match 1 of 6 from any position', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    // Make 3 picks
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getAllByTestId('movie-card')[0]);
      await waitFor(() => expect(screen.getByTestId('match-counter')).toHaveTextContent(`Match ${i + 2} of 6`));
    }

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
      expect(screen.getByTestId('round-label')).toHaveTextContent('Play-In Round');
    });
  });

  it('completing all 6 play-in matches transitions to Round of 64', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getAllByTestId('movie-card')).toHaveLength(2));

    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getAllByTestId('movie-card')[0]);
      if (i < 5) {
        // Wait for counter to advance before next pick
        await waitFor(() =>
          expect(screen.getByTestId('match-counter')).toHaveTextContent(`Match ${i + 2} of 6`)
        );
      }
    }

    await waitFor(() => {
      expect(screen.getByTestId('round-label')).toHaveTextContent('Round of 64');
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 32');
    });
  });
});

describe('App — state restoration', () => {
  it('restores bracket state from localStorage on mount', async () => {
    let s = resetState();
    s = applyPick(s, s.piM[0][0]);
    s = applyPick(s, s.piM[1][0]);
    localStorage.setItem('dbk-state', serializeState(s));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 3 of 6');
    });
  });
});

describe('App — notes', () => {
  it('notes toggle button opens a textarea for the current card', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByRole('button', { name: /Add notes for/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /Add notes for/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});

describe('App — auth modal', () => {
  it('opens auth modal when sync button is clicked', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: /Sync across devices/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sync across devices/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('auth modal closes when Cancel is clicked', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: /Sync across devices/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sync across devices/i }));
    await waitFor(() => screen.getByRole('dialog'));

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('App — champion screen', () => {
  it('shows champion screen when champion is set in state', async () => {
    const s = resetState();
    const champion = s.piM[0][0];
    localStorage.setItem('dbk-state', JSON.stringify({
      ph: s.ph, piI: s.piI, cr: s.cr, cm: s.cm,
      ch: champion,
      hi: s.hi, upsets: s.upsets,
      piM: serMatch(s.piM),
      rds: s.rds.map(r => serMatch(r)),
    }));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('champion-label')).toBeInTheDocument();
      expect(screen.getByText(champion.name)).toBeInTheDocument();
    });
  });
});

describe('App — animation timing', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('delays counter update by 320ms animation window', async () => {
    vi.useFakeTimers();
    render(<App />);
    // Flush supabase mock promises (microtasks, unaffected by fake timers)
    await act(async () => {});

    const cards = screen.getAllByTestId('movie-card');
    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');

    // Click triggers pick() — setAn fires immediately, setTimeout queued at 320ms
    fireEvent.click(cards[0]);

    // Counter not yet advanced (still within animation window)
    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');

    // Advance past 320ms — triggers the state update batch
    act(() => { vi.advanceTimersByTime(400); });

    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6');
  });
});
