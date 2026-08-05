import express from 'express'
import { protect, protectRider, protectCustomer } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'
import { setupAdmin, loginAdmin, changePassword } from '../controllers/authController.js'
import { createRider, loginRider, getAllRiders, getRiderMe, updateRiderStatus, deleteRider } from '../controllers/riderController.js'
import {
  createOrder, getAllOrders, trackOrder, getRiderOrders,
  assignRider, updateOrderStatus, uploadProof, getStats,
  getAvailableOrders, selfAssignOrder,
} from '../controllers/orderController.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'

import { registerCustomer, loginCustomer, getCustomerMe, updateCustomerProfile, changeCustomerPassword, getCustomerOrders, getAllCustomers, deleteCustomer } from '../controllers/customerController.js'

const router = express.Router()

// ─── HEALTH ───────────────────────────────────────────
router.get('/health', (req, res) => res.json({ message: 'SwiftByGwyn server is running ✅' }))

// ─── ADMIN AUTH ───────────────────────────────────────
router.post('/auth/setup', setupAdmin)
router.post('/auth/login', loginAdmin)

// ─── SETTINGS ─────────────────────────────────────────
router.get('/settings', getSettings)
router.put('/settings', protect, updateSettings)

// ─── CHANGE PASSWORD ──────────────────────────────────
router.put('/auth/change-password', protect, changePassword)

// ─── RIDERS ───────────────────────────────────────────
router.post('/riders/login', loginRider)
router.get('/riders/me', protectRider, getRiderMe)
router.post('/riders', protect, createRider)
router.get('/riders', protect, getAllRiders)
router.put('/riders/:id/status', protect, updateRiderStatus)
router.delete('/riders/:id', protect, deleteRider)

router.get('/orders/available', protectRider, getAvailableOrders)
router.put('/orders/:id/self-assign', protectRider, selfAssignOrder)

// ─── ORDERS ───────────────────────────────────────────
router.post('/orders', upload.single('packageImage'), createOrder)
router.get('/orders/track/:orderID', trackOrder)
router.get('/orders/stats', protect, getStats)
router.get('/orders', protect, getAllOrders)
router.get('/orders/rider', protectRider, getRiderOrders)
router.put('/orders/:id/assign', protect, assignRider)
router.put('/orders/:id/status', protect, updateOrderStatus)
router.put('/orders/:id/proof', protectRider, upload.single('proofPhoto'), uploadProof)

// ─── CUSTOMER AUTH ────────────────────────────────────
router.post('/customers/register', registerCustomer)
router.post('/customers/login', loginCustomer)
router.get('/customers/me', protectCustomer, getCustomerMe)
router.put('/customers/me', protectCustomer, updateCustomerProfile)
router.put('/customers/me/password', protectCustomer, changeCustomerPassword)
router.get('/customers/orders', protectCustomer, getCustomerOrders)
router.get('/customers/all', protect, getAllCustomers)
router.delete('/customers/:id', protect, deleteCustomer)

export default router