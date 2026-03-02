import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotes } from '../useNotes.js';

afterEach(() => localStorage.clear());

describe('useNotes', () => {
  it('initializes to {} when localStorage is empty', () => {
    const { result } = renderHook(() => useNotes());
    expect(result.current.notes).toEqual({});
  });

  it('initializes from localStorage, ignoring non-string values', () => {
    localStorage.setItem('dbk-notes', JSON.stringify({ 1: 'my note', 2: 42, 3: null, 4: 'another' }));
    const { result } = renderHook(() => useNotes());
    expect(result.current.notes).toEqual({ 1: 'my note', 4: 'another' });
  });

  it('updateNote updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useNotes());
    act(() => { result.current.updateNote(5, 'great film'); });
    expect(result.current.notes[5]).toBe('great film');
    expect(JSON.parse(localStorage.getItem('dbk-notes')!)).toMatchObject({ 5: 'great film' });
  });

});
