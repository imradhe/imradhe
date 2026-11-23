import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Streak, { practice } from './Streak';
import Chess from './Chess';
import { srtTime, toSrt } from './Dhwani';
const wrap = component => render(<MemoryRouter>{component}</MemoryRouter>);

describe('streak tracking', () => {
  it('records one daily practice, advances the next day, and resets a broken streak', () => {
    const original = { days: 0, daily: 10, reward: 0, lastDate: '' };
    const first = practice(original, true, new Date(2026, 10, 23));
    expect(first.days).toBe(1); expect(first.reward).toBe(10);
    expect(practice(first, true, new Date(2026, 10, 23))).toBe(first);
    const next = practice(first, true, new Date(2026, 10, 24));
    expect(next.days).toBe(2); expect(next.reward).toBe(20);
    expect(practice(next, true, new Date(2026, 10, 26)).days).toBe(1);
  });
  it('starts, completes, persists and resets a practice reward', () => {
    wrap(<Streak/>);
    fireEvent.change(screen.getByLabelText('Streak title'), { target: { value: 'Read daily' } });
    fireEvent.change(screen.getByLabelText('Target reward (₹)'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Reward per practice (₹)'), { target: { value: '10' } });
    fireEvent.click(screen.getByText('Start streak'));
    fireEvent.click(screen.getByText('Practice for the day')); fireEvent.click(screen.getByText('Practice for the day'));
    expect(screen.getByText(/Congratulations/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('imradhe:streak')).reward).toBe(20);
    fireEvent.click(screen.getByText('Reset reward'));
    expect(screen.getByText('Start streak')).toBeInTheDocument();
  });
});
describe('chess', () => {
  it('allows legal moves, blocks illegal moves, persists and supports undo and reset', () => {
    wrap(<Chess/>);
    fireEvent.click(screen.getByRole('button', { name: 'e2 white p' }));
    fireEvent.click(screen.getByRole('button', { name: 'e4 empty' }));
    expect(screen.getByRole('button', { name: 'e4 white p' })).toBeInTheDocument();
    expect(screen.getByText('Black to move.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('imradhe:chess'))).toContain('e4');
    fireEvent.click(screen.getByRole('button', { name: 'e7 black p' }));
    fireEvent.click(screen.getByRole('button', { name: 'e4 white p' }));
    expect(screen.getByRole('button', { name: 'e7 black p' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Undo'));
    expect(screen.getByRole('button', { name: 'e2 white p' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset')); expect(screen.getByText('White to move.')).toBeInTheDocument();
  });
});
describe('subtitle export', () => {
  it('formats millisecond boundaries and exports each line with its own timestamp', () => {
    expect(srtTime(59.9996)).toBe('00:01:00,000');
    expect(srtTime(3661.25)).toBe('01:01:01,250');
    const srt = toSrt([{ line: 'First line', start: 0 }, { line: 'Not timed', start: null }, { line: 'Last line', start: 4 }], 8);
    expect(srt).toBe('1\n00:00:00,000 --> 00:00:04,000\nFirst line\n\n2\n00:00:04,000 --> 00:00:08,000\nLast line\n');
    expect(srt).not.toContain('Not timed');
  });
});
