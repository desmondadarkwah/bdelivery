import Tenant from '../models/Tenant.js'
import jwt from 'jsonwebtoken'

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/tenants — super admin creates a new tenant
export const createTenant = async (req, res) => {
  try {
    const {
      businessName, subdomain, brandColor,
      whatsapp, email, phone, address, coverageArea,
      standardFee, sameDayFee, expressFee, scheduledFee,
      plan, adminEmail, adminPassword,
    } = req.body

    const exists = await Tenant.findOne({ $or: [{ subdomain }, { adminEmail }] })
    if (exists) return res.status(400).json({ error: 'Subdomain or admin email already exists.' })

    const tenant = await Tenant.create({
      businessName, subdomain, brandColor,
      whatsapp, email, phone, address, coverageArea,
      standardFee, sameDayFee, expressFee, scheduledFee,
      plan, adminEmail, adminPassword,
      status: 'active',
    })

    res.status(201).json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/tenants — super admin gets all tenants
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().select('-adminPassword').sort({ createdAt: -1 })
    res.json({ success: true, data: tenants })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/tenants/:subdomain — get tenant by subdomain (public — for frontend branding)
export const getTenantBySubdomain = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ subdomain: req.params.subdomain }).select('-adminPassword')
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' })
    if (tenant.status === 'suspended') return res.status(403).json({ error: 'This account has been suspended.' })
    res.json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/tenants/:id — super admin updates tenant
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-adminPassword')
    res.json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/tenants/:id/status — super admin suspends/activates tenant
export const updateTenantStatus = async (req, res) => {
  try {
    const { status } = req.body
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-adminPassword')
    res.json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/tenants/:id — super admin deletes tenant
export const deleteTenant = async (req, res) => {
  try {
    await Tenant.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Tenant deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/tenants/login — tenant admin login
export const loginTenantAdmin = async (req, res) => {
  try {
    const { email, password, subdomain } = req.body
    const tenant = await Tenant.findOne({ adminEmail: email, subdomain })
    if (!tenant) return res.status(401).json({ error: 'Invalid credentials.' })
    if (tenant.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended. Contact Bdelivery support.' })
    if (!(await tenant.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials.' })

    res.json({
      success: true,
      token: generateToken(tenant._id, 'tenant-admin'),
      tenant: {
        id: tenant._id,
        businessName: tenant.businessName,
        subdomain: tenant.subdomain,
        brandColor: tenant.brandColor,
        logo: tenant.logo,
        plan: tenant.plan,
        status: tenant.status,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/tenants/me — tenant admin gets their own info
export const getTenantMe = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenant.id).select('-adminPassword')
    res.json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/tenants/me — tenant admin updates their own settings
export const updateTenantMe = async (req, res) => {
  try {
    const {
      businessName, brandColor, whatsapp, email,
      phone, address, coverageArea,
      standardFee, sameDayFee, expressFee, scheduledFee,
    } = req.body

    const logo = req.file ? req.file.path : undefined

    const updateData = {
      businessName, brandColor, whatsapp, email,
      phone, address, coverageArea,
      standardFee, sameDayFee, expressFee, scheduledFee,
    }
    if (logo) updateData.logo = logo

    const tenant = await Tenant.findByIdAndUpdate(req.tenant.id, updateData, { new: true }).select('-adminPassword')
    res.json({ success: true, data: tenant })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/tenant/plan — get tenant plan info and usage
export const getTenantPlanInfo = async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default
    const Rider = (await import('../models/Rider.js')).default

    const tenant = await Tenant.findById(req.tenant.id).select('-adminPassword')

    const PLAN_LIMITS = {
      trial:   { orders: 50,   riders: 3 },
      starter: { orders: 200,  riders: 5 },
      growth:  { orders: 1000, riders: 15 },
      pro:     { orders: Infinity, riders: Infinity },
    }

    const limits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.trial

    // Orders this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const ordersThisMonth = await Order.countDocuments({
      tenantId: tenant._id.toString(),
      createdAt: { $gte: startOfMonth }
    })

    const riderCount = await Rider.countDocuments({ tenantId: tenant._id.toString() })

    // Days left on trial
    let trialDaysLeft = null
    if (tenant.status === 'trial' && tenant.trialEndsAt) {
      const diff = new Date(tenant.trialEndsAt) - new Date()
      trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    res.json({
      success: true,
      data: {
        plan: tenant.plan,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
        trialDaysLeft,
        limits,
        usage: {
          ordersThisMonth,
          riderCount,
        }
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}