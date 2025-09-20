import { useEffect } from 'react'

const { ipcRenderer } = window

interface IpcInstance {
  send: <T = any>(target: string, ...args: any[]) => Promise<T>
  on: (event: string, callback: (...args: any[]) => void) => void
}

export const ipcInstance: IpcInstance = {
  send: (target, ...args) => {
    const payloads: any[] = args.map(e => {
      // Handle React refs and other complex objects
      if (e && typeof e === 'object' && 'current' in e) {
        return e.current
      }
      return e
    })
    return ipcRenderer.invoke(target.toString(), ...payloads)
  },
  on: (event, callback) => {
    ipcRenderer.on(event.toString(), (e, ...args) => {
      callback(...args)
    })
  },
}

export function useIpc() {
  return ipcInstance
}

// Hook for managing IPC event listeners with automatic cleanup
export function useIpcListener(event: string, callback: (...args: any[]) => void) {
  useEffect(() => {
    ipcRenderer.on(event, callback)
    
    return () => {
      ipcRenderer.removeAllListeners(event)
    }
  }, [event, callback])
}