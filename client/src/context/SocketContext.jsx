import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id)
      setConnected(true)
    })

    s.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setConnected(false)
    })

    setSocket(s)

    return () => { s.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)