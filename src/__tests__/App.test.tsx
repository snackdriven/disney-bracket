// Integration tests — render the full <App/> component against jsdom.
// These test user-visible behavior, not isolated bracket logic.
// Pure bracket logic is unit-tested in src/lib/__tests__/bracket.test.ts.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { applyPick, applyUndo, resetState } from '../lib/bracket';
import { serMatch } from '../lib/utils';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Firebase mocks
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: unknown) => void) => {
    cb(null);
    return vi.fn(); // unsubscribe
  }),
  signInWithPopup: vi.fn().mockResolvedValue({ user: { uid: '123', displayName: 'Test User' } }),
  GoogleAuthProvider: class {},
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  onValue: vi.fn(() => vi.fn()),
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue({ val: () => null, exists: () => false }),
  remove: vi.fn().mockResolvedValue(undefined),
  onDisconnect: vi.fn(() => ({
    remove: vi.fn().mockResolvedValue(undefined),
  })),
}));

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

// Mock window.confirm (used by the reset handler)
window.confirm = vi.fn().mockReturnValue(true);

/** Serialize bracket state for localStorage seeding in tests. */
function serializeState(s: ReturnType<typeof resetState>) {
  return JSON.stringify({
    _v: 2,
    phase: s.phase, playInIndex: s.playInIndex, currentRound: s.currentRound,
    currentMatch: s.currentMatch, champion: s.champion, history: s.history, upsets: s.upsets,
    playInMatches: serMatch(s.playInMatches),
    rounds: s.rounds.map(r => serMatch(r)),
  });
}

describe('App — Sweet 16 reroll', () => {
  function completedBracket() {
    let state = resetState();
    while (!state.champion) {
      const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
      state = applyPick(state, match.players[0]);
    }
    return state;
  }

  it('can preview, cancel, and confirm a restart from the champion screen', async () => {
    const state = completedBracket();
    localStorage.setItem('dbk-state', serializeState(state));
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reroll Sweet 16' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('dbk-state')!).champion).toEqual(state.champion);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByTestId('champion-label')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reroll Sweet 16' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply reroll & restart Sweet 16' }));
    expect(screen.queryByTestId('champion-label')).not.toBeInTheDocument();
    expect(screen.getByText('54/69 decided')).toBeInTheDocument();
    expect(screen.getByTestId('round-label')).toHaveTextContent(/^Sweet 16$/);
    expect(screen.getByRole('status')).toHaveTextContent(/rerolled/i);
    expect(screen.getByRole('button', { name: /export previous bracket/i })).toBeInTheDocument();
  });

  it('offers recovery and pauses cloud saving when the stored bracket cannot be parsed', () => {
    localStorage.setItem('dbk-state', '{bad saved data');
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent(/saving is paused/i);
    expect(screen.getByRole('button', { name: /export recovery copy/i })).toBeInTheDocument();
    expect(localStorage.getItem('dbk-state')).toBe('{bad saved data');
  });

  it('keeps picks and Undo paused until a signed-in cloud bracket finishes loading', async () => {
    let state = completedBracket();
    // Undo the 15 later picks to reach the first Sweet 16 matchup.
    while (state.history.length > 54) state = applyUndo(state);
    localStorage.setItem('dbk-state', serializeState(state));
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback({ uid: 'loading-user' } as User);
      return vi.fn();
    });
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading your saved bracket/i);
    expect(screen.getByRole('button', { name: 'Reroll Sweet 16' })).toBeDisabled();
    fireEvent.click(screen.getAllByTestId('movie-card')[0]);
    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(JSON.parse(localStorage.getItem('dbk-state')!).history).toHaveLength(54);
  });

  it('allows an explicit sign-out with a local recovery snapshot when cloud saving is unavailable', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback({ uid: 'loading-user', email: 'test@example.invalid' } as User);
      return vi.fn();
    });
    const signOut = vi.fn().mockResolvedValue(undefined);
    Object.assign(auth, { signOut });
    render(<App />);
    fireEvent.click(screen.getByTitle(/sign out/i));
    const escape = await screen.findByRole('button', { name: 'Keep recovery & sign out' });
    expect(signOut).not.toHaveBeenCalled();
    fireEvent.click(escape);
    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    const recovery = JSON.parse(localStorage.getItem('dbk-signout-recovery:loading-user')!);
    expect(recovery.bracket.phase).toBe('pi');
    expect(recovery.notes).toEqual({});
  });
});

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

describe('App — initial render', () => {
  it('shows play-in round label and Match 1 of 6 counter on fresh load', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('round-label')).toHaveTextContent('Play-In Round');
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
    });
  });

  it('shows desktop sync strip when loaded', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTitle(/Sign In \/ Sync Bracket/i)).toBeInTheDocument();
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
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    await user.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6');
    });
  });

  it('saves bracket state to localStorage after a pick', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    await user.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => {
      const stored = localStorage.getItem('dbk-state');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).playInIndex).toBe(1);
    });
  });

  it('undo button reverts the last pick', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    await user.click(screen.getAllByTestId('movie-card')[0]);
    await waitFor(() => expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6'));

    await user.click(screen.getByRole('button', { name: /Undo/i }));

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
    });
  });

  it('reset button returns to Match 1 of 6 from any position', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getAllByTestId('movie-card'));
    // Make 3 picks
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getAllByTestId('movie-card')[0]);
      await waitFor(() => expect(screen.getByTestId('match-counter')).toHaveTextContent(`Match ${i + 2} of 6`));
    }

    await user.click(screen.getByRole('button', { name: /Reset/i }));

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');
      expect(screen.getByTestId('round-label')).toHaveTextContent('Play-In Round');
    });
  });

  it('completing all 6 play-in matches transitions to Round of 64', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByTestId('movie-card')).toHaveLength(2));

    for (let i = 0; i < 6; i++) {
      await user.click(screen.getAllByTestId('movie-card')[0]);
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
    s = applyPick(s, s.playInMatches[0].players[0]);
    s = applyPick(s, s.playInMatches[1].players[0]);
    localStorage.setItem('dbk-state', serializeState(s));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 3 of 6');
    });
  });
});

describe('App — notes', () => {
  it('notes toggle button opens a textarea for the current card', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getAllByRole('button', { name: /Add notes for/i }));

    await user.click(screen.getAllByRole('button', { name: /Add notes for/i })[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Your thoughts/i)).toBeInTheDocument();
    });
  });
});

describe('App — desktop sync and auth', () => {
  it('opens auth modal when sync icon is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getByTitle(/Sign In \/ Sync Bracket/i));
    await user.click(screen.getByTitle(/Sign In \/ Sync Bracket/i));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('auth modal closes when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getByTitle(/Sign In \/ Sync Bracket/i));
    await user.click(screen.getByTitle(/Sign In \/ Sync Bracket/i));
    await waitFor(() => screen.getByRole('dialog'));

    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('App — champion screen', () => {
  it('shows champion screen when champion is set in state', async () => {
    let s = resetState();
    while (!s.champion) {
      const match = s.phase === 'pi' ? s.playInMatches[s.playInIndex] : s.rounds[s.currentRound][s.currentMatch];
      s = applyPick(s, match.players[0]);
    }
    const champion = s.champion!;
    localStorage.setItem('dbk-state', JSON.stringify({
      _v: 2,
      phase: s.phase, playInIndex: s.playInIndex, currentRound: s.currentRound, currentMatch: s.currentMatch,
      champion,
      history: s.history, upsets: s.upsets,
      playInMatches: serMatch(s.playInMatches),
      rounds: s.rounds.map(r => serMatch(r)),
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
    // Flush firebase mock promises (microtasks, unaffected by fake timers)
    await act(async () => {});

    const cards = screen.getAllByTestId('movie-card');
    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');

    // fireEvent is synchronous — it queues the 320ms setTimeout without draining
    // the async scheduler. userEvent.click() would drain the queue and skip past
    // the animation window, making the mid-animation assertion impossible.
    fireEvent.click(cards[0]);

    // Counter not yet advanced (still within animation window)
    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 1 of 6');

    // Advance past 320ms — triggers the state update batch
    act(() => { vi.advanceTimersByTime(400); });

    expect(screen.getByTestId('match-counter')).toHaveTextContent('Match 2 of 6');
  });
});
