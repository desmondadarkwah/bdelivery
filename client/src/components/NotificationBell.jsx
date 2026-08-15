import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'

export default function NotificationBell({ tenantId, brandColor = '#f97316' }) {
  const { socket } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (!socket || !tenantId) return

    socket.emit('admin:join', tenantId)

    socket.on('order:new', (data) => {
      const notif = {
        id: Date.now(),
        type: 'new_order',
        title: 'New Order Received!',
        message: `Order ${data.orderID} — ${data.pickupLocation} → ${data.dropoffLocation}`,
        fee: `GHS ${data.deliveryFee}`,
        time: new Date(),
        read: false,
      }
      setNotifications(prev => [notif, ...prev].slice(0, 20))
      setUnread(prev => prev + 1)

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`🚀 New Order — ${data.orderID}`, {
          body: `${data.pickupLocation} → ${data.dropoffLocation} · GHS ${data.deliveryFee}`,
          icon: '/favicon.ico',
        })
      }
    })

    socket.on('order:updated', (data) => {
      const notif = {
        id: Date.now(),
        type: 'order_update',
        title: 'Order Status Updated',
        message: `Order ${data.orderID} is now ${data.status.replace('-', ' ')}`,
        time: new Date(),
        read: false,
      }
      setNotifications(prev => [notif, ...prev].slice(0, 20))
      setUnread(prev => prev + 1)
    })

    return () => {
      socket.off('order:new')
      socket.off('order:updated')
    }
  }, [socket, tenantId])

  useEffect(() => {
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        style={{ position:'relative', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:17, transition:'all 0.2s' }}
      >
        🔔
        {unread > 0 && (
          <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, background:'#ef4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', border:'2px solid #0b0f1a' }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:340, background:'#0f1525', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, boxShadow:'0 12px 40px rgba(0,0,0,0.5)', zIndex:1000, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#fff' }}>Notifications</div>
            {notifications.length > 0 && (
              <button onClick={markAllRead} style={{ background:'none', border:'none', color:`${brandColor}`, fontSize:11, cursor:'pointer', fontWeight:600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding:'32px 16px', textAlign:'center', color:'rgba(240,244,255,0.25)', fontSize:13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', background: n.read ? 'transparent' : 'rgba(249,115,22,0.04)', transition:'background 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background: n.type === 'new_order' ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                      {n.type === 'new_order' ? '📦' : '🔄'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#fff', marginBottom:2 }}>{n.title}</div>
                      <div style={{ fontSize:11, color:'rgba(240,244,255,0.45)', lineHeight:1.5, marginBottom:4 }}>{n.message}</div>
                      {n.fee && <div style={{ fontSize:11, color: brandColor, fontWeight:600 }}>{n.fee}</div>}
                      <div style={{ fontSize:10, color:'rgba(240,244,255,0.25)', marginTop:4 }}>{formatTime(n.time)}</div>
                    </div>
                    {!n.read && <div style={{ width:6, height:6, borderRadius:'50%', background: brandColor, flexShrink:0, marginTop:4 }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}