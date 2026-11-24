import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sweet16RerollModal } from '../Sweet16RerollModal';
import { MAIN } from '../../lib/data';

function props() {
  return {
    matches: Array.from({ length: 8 }, (_, i) => ({ players: [MAIN[i * 2], MAIN[i * 2 + 1]] as [typeof MAIN[number], typeof MAIN[number]] })),
    removedPickCount: 15, removesChampion: true, error: null, pending: false,
    onShuffle: vi.fn(), onCancel: vi.fn(), onConfirm: vi.fn(),
  };
}

describe('Sweet16RerollModal', () => {
  it('shows all eight pairs and the exact loss impact before allowing confirmation', () => {
    const options = props();
    render(<Sweet16RerollModal {...options} />);
    expect(screen.getByRole('dialog', { name: /reroll sweet 16/i })).toBeInTheDocument();
    for (const match of options.matches) for (const movie of match.players) expect(screen.getByText(movie.name)).toBeInTheDocument();
    expect(screen.getByText(/15.*picks.*cleared/i)).toBeInTheDocument();
    expect(screen.getByText(/champion.*removed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply reroll & restart Sweet 16' }));
    expect(options.onConfirm).toHaveBeenCalledOnce();
  });

  it('supports cancelling with Escape and restores focus to the opener', () => {
    const options = props();
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(<Sweet16RerollModal {...options} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(options.onCancel).toHaveBeenCalledOnce();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('uses the non-destructive label when no later picks exist and supports reshuffling', () => {
    const options = { ...props(), removedPickCount: 0, removesChampion: false };
    render(<Sweet16RerollModal {...options} />);
    expect(screen.getByRole('button', { name: 'Apply reroll' })).toBeInTheDocument();
    expect(screen.queryByText(/champion.*removed/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Shuffle again' }));
    expect(options.onShuffle).toHaveBeenCalledOnce();
  });

  it('keeps the error visible and prevents conflicting actions while pending', () => {
    const options = { ...props(), pending: true, error: 'Recovery backup could not be saved' };
    render(<Sweet16RerollModal {...options} />);
    expect(screen.getByRole('alert')).toHaveTextContent(options.error);
    expect(screen.getByRole('button', { name: 'Apply reroll & restart Sweet 16' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Shuffle again' })).toBeDisabled();
  });

  it('includes the scrollable matchup list in its keyboard focus loop', () => {
    render(<Sweet16RerollModal {...props()} />);
    const apply = screen.getByRole('button', { name: 'Apply reroll & restart Sweet 16' });
    apply.focus();
    expect(apply).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('list', { name: 'Proposed Sweet 16 matchups' })).toHaveFocus();
  });
});
