import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2');
  });

  it('handles conditional classes', () => {
    expect(cn('c1', false && 'c2', 'c3')).toBe('c1 c3');
  });

  it('merges tailwind classes', () => {
    // tailwind-merge should handle conflicts
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
