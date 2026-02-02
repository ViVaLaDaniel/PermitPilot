import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
  expect(cn('c1', 'c2')).toBe('c1 c2')
  expect(cn('c1', { c2: true, c3: false })).toBe('c1 c2')
  expect(cn('p-4 p-2')).toBe('p-2') // tailwind-merge verification
})
