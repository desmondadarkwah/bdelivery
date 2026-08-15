import express from 'express'
import { protectSuperAdmin, protectTenant, protectRider, protectCustomer } from '../middleware/authMiddleware.js'
import { resolveTenant, checkOrderLimit, checkRiderLimit } from '../middleware/tenantMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

// Controllers
import { setupSuperAdmin, loginSuperAdmin, getPlatformStats } from '../controllers/superAdminController.js'
import { createTenant, getAllTenants, getTenantBySubdomain, updateTenant, updateTenantStatus, deleteTenant, loginTenantAdmin, getTenantMe, updateTenantMe, getTenantPlanInfo } from '../controllers/tenantController.js'
import { createRider, loginRider, getAllRiders, getRiderMe, updateRiderStatus, deleteRider } from '../controllers/riderController.js'
import { createOrder, getAllOrders, trackOrder, getRiderOrders, assignRider, updateOrderStatus, uploadProof, getStats, getAvailableOrders, selfAssignOrder } from '../controllers/orderController.js'
import { registerCustomer, loginCustomer, getCustomerMe, updateCustomerProfile, changeCustomerPassword, getCustomerOrders, getAllCustomers, deleteCustomer } from '../controllers/customerController.js'

const router = express.Router()

// ─── HEALTH ───────────────────────────────────────────
router.get('/health', (req, res) => res.json({ message: 'Bdelivery server is running ✅' }))

// ─── SUPER ADMIN ──────────────────────────────────────
router.post('/super/setup', setupSuperAdmin)
router.post('/super/login', loginSuperAdmin)
router.get('/super/stats', protectSuperAdmin, getPlatformStats)
router.get('/super/tenants', protectSuperAdmin, getAllTenants)
router.post('/super/tenants', protectSuperAdmin, createTenant)
router.put('/super/tenants/:id', protectSuperAdmin, updateTenant)
router.put('/super/tenants/:id/status', protectSuperAdmin, updateTenantStatus)
router.delete('/super/tenants/:id', protectSuperAdmin, deleteTenant)

// ─── TENANT (PUBLIC) ──────────────────────────────────
router.get('/tenant/:subdomain', getTenantBySubdomain)
router.post('/tenant/login', loginTenantAdmin)
router.get('/tenant/me', protectTenant, getTenantMe)
router.put('/tenant/me', protectTenant, upload.single('logo'), updateTenantMe)
router.get('/tenant/plan', protectTenant, getTenantPlanInfo)

// ─── ALL ROUTES BELOW NEED TENANT CONTEXT ─────────────
router.use(resolveTenant)

// ─── RIDERS ───────────────────────────────────────────
router.post('/riders/login', loginRider)
router.get('/riders/me', protectRider, getRiderMe)
router.post('/riders', protectTenant,checkRiderLimit, createRider)
router.get('/riders', protectTenant, getAllRiders)
router.put('/riders/:id/status', protectTenant, updateRiderStatus)
router.delete('/riders/:id', protectTenant, deleteRider)

// ─── ORDERS ───────────────────────────────────────────
router.post('/orders',resolveTenant, checkOrderLimit, upload.single('packageImage'), createOrder)
router.get('/orders/track/:orderID', trackOrder)
router.get('/orders/stats', protectTenant, getStats)
router.get('/orders', protectTenant, getAllOrders)
router.get('/orders/rider', protectRider, getRiderOrders)
router.get('/orders/available', protectRider, getAvailableOrders)
router.put('/orders/:id/assign', protectTenant, assignRider)
router.put('/orders/:id/self-assign', protectRider, selfAssignOrder)
router.put('/orders/:id/status', protectTenant, updateOrderStatus)
router.put('/orders/:id/proof', protectRider, upload.single('proofPhoto'), uploadProof)

// ─── CUSTOMERS ────────────────────────────────────────
router.post('/customers/register', registerCustomer)
router.post('/customers/login', loginCustomer)
router.get('/customers/me', protectCustomer, getCustomerMe)
router.put('/customers/me', protectCustomer, updateCustomerProfile)
router.put('/customers/me/password', protectCustomer, changeCustomerPassword)
router.get('/customers/orders', protectCustomer, getCustomerOrders)
router.get('/customers/all', protectTenant, getAllCustomers)
router.delete('/customers/:id', protectTenant, deleteCustomer)

export default router