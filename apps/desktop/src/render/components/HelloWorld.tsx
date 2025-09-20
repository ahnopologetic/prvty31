import { sendMsgToMainProcess } from '@render/api'
import { useIpc } from '@render/plugins/ipc'
import React, { useState } from 'react'

interface HelloWorldProps {
  title?: string
}

const HelloWorld: React.FC<HelloWorldProps> = ({ title = 'Vite + Electron & Esbuild' }) => {
  const [log, setLog] = useState('')
  const [msg, setMsg] = useState('')

  const sendMsg = async () => {
    try {
      setLog(prev => `${prev}[render]: ${msg} \n`)
      const data = await sendMsgToMainProcess(msg)
      setLog(prev => `${prev}[main]: ${data}  \n`)
    }
    catch (error) {
      console.error(error)
    }
  }

  const ipc = useIpc()

  React.useEffect(() => {
    const handleReply = (msg: string) => {
      setLog(prev => `${prev}[main]: ${msg}  \n`)
    }

    ipc.on('reply-msg', handleReply)

    return () => {
      // Cleanup is handled by the useIpc hook
    }
  }, [ipc])

  return (
    <div>
      <h1>{title}</h1>

      <textarea
        value={log}
        cols={60}
        rows={10}
        disabled
        readOnly
      />
      <div style={{ marginTop: '20px' }}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          type="text"
          placeholder="send msg to main process"
        />
        <button
          style={{ marginLeft: '20px' }}
          onClick={sendMsg}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default HelloWorld
