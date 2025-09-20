import { expect, it } from 'vitest'
import HelloWorld from '../src/render/components/HelloWorld'

/**
 * @vitest-environment happy-dom
 */
it('helloWorld component exists', () => {
  expect(HelloWorld).toBeTruthy()
  expect(typeof HelloWorld).toBe('function')
})
