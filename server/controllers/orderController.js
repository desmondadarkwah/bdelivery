import Order from '../models/Order.js'
import Counter from '../models/Counter.js'
import Rider from '../models/Rider.js'

import { getIO } from '../socket.js'

// Generate unique Order ID
const generateOrderID = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'SWG-'
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}



// POST /api/orders — public (customer books)
export const createOrder = async (req, res) => {
  try {

    console.log('customerId received:', req.body.customerId)
    console.log('customer object:', req.body.customer)

    const {
      customerName, customerPhone,
      recipientName, recipientPhone,
      pickupLocation, dropoffLocation,
      pickupCoords, dropoffCoords, distance,
      deliveryType, scheduledDate, scheduledTime,
      packageDescription, additionalNotes,
      deliveryFee, paymentMethod, customerId,
    } = req.body

    const orderID = generateOrderID()
    const packageImage = req.file ? req.file.path : ''

    const customer = customerId && customerId !== 'undefined' && customerId !== 'null'
      ? customerId
      : null

    const order = await Order.create({
      orderID,
      tenantId: req.tenantId,
      customer,
      customerName, customerPhone,
      recipientName, recipientPhone,
      pickupLocation, dropoffLocation,
      pickupCoords: pickupCoords || null,
      dropoffCoords: dropoffCoords || null,
      distance: distance || 0,
      deliveryType, scheduledDate, scheduledTime,
      packageDescription, additionalNotes,
      packageImage,
      deliveryFee, paymentMethod,
    })

    // Notify all riders and admin in this tenant of new order
  getIO()?.to(`tenant:${order.tenantId}`).emit('order:new', {
      orderID: order.orderID,
      pickupLocation: order.pickupLocation,
      dropoffLocation: order.dropoffLocation,
      deliveryType: order.deliveryType,
      deliveryFee: order.deliveryFee,
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/orders — admin gets all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status, tenantId: req.tenantId } : { tenantId: req.tenantId }
    const orders = await Order.find(filter)
      .populate('assignedRider', 'name phone email')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/orders/track/:orderID — public (customer tracks)
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderID: req.params.orderID, tenantId: req.tenantId })
      .populate('assignedRider', 'name phone')
    if (!order) return res.status(404).json({ error: 'Order not found. Check your Order ID.' })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/orders/rider — rider gets assigned orders
export const getRiderOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedRider: req.rider.id, tenantId: req.tenantId })
      .sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/orders/:id/assign — admin assigns rider
export const assignRider = async (req, res) => {
  try {
    const { riderId } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedRider: riderId, status: 'assigned' },
      { returnDocument: 'after' }
    ).populate('assignedRider', 'name phone email')
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/orders/:id/status — admin or rider updates status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    ).populate('assignedRider', 'name phone')

    getIO()?.to(`tenant:${updated.tenantId}`).emit('order:updated', {
      orderId: updated._id,
      orderID: updated.orderID,
      status: updated.status,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/orders/:id/proof — rider uploads proof of delivery
export const uploadProof = async (req, res) => {
  try {
    const { proofRecipientName } = req.body
    const proofPhoto = req.file ? req.file.path : ''
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { proofPhoto, proofRecipientName, status: 'delivered' },
      { returnDocument: 'after' }
    )
    // Increment rider total deliveries
    if (order.assignedRider) {
      const Rider = (await import('../models/Rider.js')).default
      await Rider.findByIdAndUpdate(order.assignedRider, { $inc: { totalDeliveries: 1 } })
    }

    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/orders/stats — admin gets stats
export const getStats = async (req, res) => {
  try {
    const total = await Order.countDocuments({ tenantId: req.tenantId })
    const pending = await Order.countDocuments({ tenantId: req.tenantId, status: { $in: ['received', 'assigned', 'picked-up', 'in-transit'] } })
    const completed = await Order.countDocuments({ tenantId: req.tenantId, status: 'delivered' })
    const cancelled = await Order.countDocuments({ tenantId: req.tenantId, status: 'cancelled' })
    const revenue = await Order.aggregate([
      { $match: { tenantId: req.tenantId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$deliveryFee' } } }
    ])
    res.json({
      success: true,
      data: {
        total, pending, completed, cancelled,
        revenue: revenue[0]?.total || 0,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/orders/available — rider sees all unassigned orders
export const getAvailableOrders = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider.id)
    
    if (!rider) return res.status(404).json({ error: 'Rider not found.' })

    // If offline return empty array
    if (!rider.isOnline) {
      return res.json({ success: true, data: [] })
    }

    const orders = await Order.find({
      status: 'received',
      assignedRider: null,
      tenantId: req.tenantId,
    })
    .populate('assignedRider', 'name phone')
    .sort({ createdAt: -1 })

    res.json({ success: true, data: orders })
  } catch (err) {
    console.error('getAvailableOrders error:', err)
    res.status(500).json({ error: err.message })
  }
}
// PUT /api/orders/:id/self-assign — rider accepts available order
export const selfAssignOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found.' })
    if (order.assignedRider) return res.status(400).json({ error: 'This order has already been taken by another rider.' })
    if (order.status !== 'received') return res.status(400).json({ error: 'This order is no longer available.' })

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedRider: req.rider.id, status: 'assigned' },
      { returnDocument: 'after' }
    ).populate('assignedRider', 'name phone')

    getIO()?.to(`tenant:${updated.tenantId}`).emit('order:updated', {
      orderId: updated._id,
      orderID: updated.orderID,
      status: updated.status,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/orders/:id/payment — rider marks payment as collected
export const markPaymentCollected = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      assignedRider: req.rider.id,
      tenantId: req.tenantId,
    })

    if (!order) return res.status(404).json({ error: 'Order not found.' })
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Order must be delivered before marking payment.' })

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentCollected: true, paymentCollectedAt: new Date() },
      { returnDocument: 'after' }
    )

    // Notify admin via socket
    getIO()?.to(`tenant:${updated.tenantId}`).emit('payment:collected', {
      orderId: updated._id,
      orderID: updated.orderID,
      amount: updated.deliveryFee,
      riderName: req.rider.name,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}