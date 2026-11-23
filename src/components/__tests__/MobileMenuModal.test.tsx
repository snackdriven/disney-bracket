import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobileMenuModal } from '../MobileMenuModal';

it('keeps personal Cloud Save and saved legacy data without offering active co-op controls', () => {
  localStorage.setItem('dbk-recent-rooms', '["SIMB-12"]');
  localStorage.setItem('dbk-custom-name', 'Saved name');
  const write = vi.spyOn(Storage.prototype, 'setItem');
  const onSignInClick = vi.fn();
  render(<MobileMenuModal onClose={vi.fn()} showFullBracket={false} setShowFullBracket={vi.fn()}
    showNotes={false} setShowNotes={vi.fn()} onReset={vi.fn()} fbUser={null}
    syncStatus="idle" onSignInClick={onSignInClick} />);
  expect(screen.queryByRole('button', { name: /create room|join room|leave room/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Cloud Save' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  expect(onSignInClick).toHaveBeenCalledOnce();
  expect(write).not.toHaveBeenCalled();
  expect(localStorage.getItem('dbk-recent-rooms')).toBe('["SIMB-12"]');
  expect(localStorage.getItem('dbk-custom-name')).toBe('Saved name');
  write.mockRestore();
});
