import { expect, test } from 'vitest';
import { cn } from '@/lib/utils';

test('cn merges class names correctly', () => {
  expect(cn('c1', 'c2')).toBe('c1 c2');
  expect(cn('c1', { c2: true, c3: false })).toBe('c1 c2');
  expect(cn('p-4', 'p-2')).toBe('p-2'); // Tailwind merge check
});
