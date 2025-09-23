import { render, screen, fireEvent } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import HelloWorld from '../components/HelloWorld'

vi.mock('../api', () => ({
  sendMsgToMainProcess: vi.fn(),
}))

vi.mock('../plugins/ipc', () => ({
  useIpc: vi.fn(() => ({
    on: vi.fn(),
  })),
}))

/**
 * @vitest-environment happy-dom
 */
it('helloWorld component', async () => {
  expect(HelloWorld).toBeTruthy()
  render(<HelloWorld />)

  const msgInput = screen.getByPlaceholderText('send msg to main process')
  expect(msgInput).toBeTruthy()

  const msg = 'msg from unit test'
  fireEvent.change(msgInput, { target: { value: msg } })
  expect((msgInput as HTMLInputElement).value).toBe(msg)
})


