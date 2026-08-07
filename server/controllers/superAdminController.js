import SuperAdmin from '../models/SuperAdmin.js'
import Tenant from '../models/Tenant.js'
import Order from '../models/Order.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => jwt.sign({ id, role: 'super-admin' }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/super/setup — create super admin (run once)
export const setupSuperAdmin = async (req, res) => {
  try {
    const exists = await SuperAdmin.findOne()
    if (exists) return res.status(400).json({ error: 'Super admin already exists.' })
    const { email, password } = req.body
    await SuperAdmin.create({ email, password })
    res.status(201).json({ success: true, message: 'Super admin created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/super/login
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await SuperAdmin.findOne({ email })
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid credentials.' })
    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: { id: admin._id, email: admin.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/super/stats — platform wide stats
export const getPlatformStats = async (req, res) => {
  try {
    const totalTenants    = await Tenant.countDocuments()
    const activeTenants   = await Tenant.countDocuments({ status: 'active' })
    const suspendedTenants = await Tenant.countDocuments({ status: 'suspended' })
    const trialTenants    = await Tenant.countDocuments({ status: 'trial' })
    const totalOrders     = await Order.countDocuments()
    const revenue         = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$deliveryFee' } } }
    ])
    res.json({
      success: true,
      data: {
        totalTenants, activeTenants, suspendedTenants, trialTenants,
        totalOrders,
        platformRevenue: revenue[0]?.total || 0,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}