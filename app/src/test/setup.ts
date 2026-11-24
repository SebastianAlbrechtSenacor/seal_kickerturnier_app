import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

afterEach(cleanup)

beforeEach(() => {
  const queues = new Map<string, Promise<unknown>>()
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request(name: string, callback: () => unknown) {
        const previous = queues.get(name) ?? Promise.resolve()
        const next = previous.then(callback, callback)
        queues.set(name, next)
        return next
      },
    },
  })
})
