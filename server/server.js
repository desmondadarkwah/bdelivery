import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import router from './routes/index.js'
import { setIO } from './socket.js'

dotenv.config()

const app    = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
})

// Store io instance
setIO(io)

app.use(cors())
app.use(express.json())
app.use('/api', router)

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on('join:tenant', (tenantId) => {
    socket.join(`tenant:${tenantId}`)
  })

  socket.on('rider:online', ({ riderId, tenantId, name }) => {
    socket.join(`tenant:${tenantId}`)
    socket.join(`rider:${riderId}`)
    socket.data.riderId  = riderId
    socket.data.tenantId = tenantId
    socket.data.name     = name
    io.to(`tenant:${tenantId}`).emit('rider:status', { riderId, name, online: true })
    console.log(`🟢 Rider ${name} is online in tenant ${tenantId}`)
  })

  socket.on('rider:offline', ({ riderId, tenantId, name }) => {
    io.to(`tenant:${tenantId}`).emit('rider:status', { riderId, name, online: false })
    console.log(`🔴 Rider ${name} is offline in tenant ${tenantId}`)
  })

  socket.on('admin:join', (tenantId) => {
    socket.join(`tenant:${tenantId}`)
    socket.join(`admin:${tenantId}`)
  })

  socket.on('disconnect', () => {
    if (socket.data.riderId && socket.data.tenantId) {
      io.to(`tenant:${socket.data.tenantId}`).emit('rider:status', {
        riderId: socket.data.riderId,
        name: socket.data.name,
        online: false,
      })
    }
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    server.listen(PORT, () => {
      console.log(`✅ Bdelivery server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
  })