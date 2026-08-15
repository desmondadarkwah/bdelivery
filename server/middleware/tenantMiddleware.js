import Tenant from '../models/Tenant.js'

const PLAN_LIMITS = {
  trial:   { orders: 50,   riders: 3 },
  starter: { orders: 200,  riders: 5 },
  growth:  { orders: 1000, riders: 15 },
  pro:     { orders: Infinity, riders: Infinity },
}

export const resolveTenant = async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tenant-subdomain']
    if (!subdomain) { req.tenantId = null; return next() }

    const tenant = await Tenant.findOne({ subdomain })
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' })

    // Check if trial has expired
    if (tenant.status === 'trial' && tenant.trialEndsAt && new Date() > new Date(tenant.trialEndsAt)) {
      await Tenant.findByIdAndUpdate(tenant._id, { status: 'suspended' })
      return res.status(403).json({ error: 'Your free trial has ended. Please contact Bdelivery to upgrade your plan.' })
    }

    if (tenant.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended. Please contact Bdelivery support.' })
    if (tenant.status === 'cancelled') return res.status(403).json({ error: 'This account has been cancelled.' })

    req.tenantId  = tenant._id.toString()
    req.tenant    = tenant
    req.planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.trial
    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const checkOrderLimit = async (req, res, next) => {
  try {
    const Order = (await import('../models/Order.js')).default
    const limits = req.planLimits || PLAN_LIMITS.trial

    if (limits.orders === Infinity) return next()

    // Count orders this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const count = await Order.countDocuments({
      tenantId: req.tenantId,
      createdAt: { $gte: startOfMonth }
    })

    if (count >= limits.orders) {
      return res.status(403).json({
        error: `You have reached your plan limit of ${limits.orders} orders this month. Please upgrade your plan to continue accepting bookings.`
      })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const checkRiderLimit = async (req, res, next) => {
  try {
    const Rider = (await import('../models/Rider.js')).default
    const limits = req.planLimits || PLAN_LIMITS.trial

    if (limits.riders === Infinity) return next()

    const count = await Rider.countDocuments({ tenantId: req.tenantId })

    if (count >= limits.riders) {
      return res.status(403).json({
        error: `You have reached your plan limit of ${limits.riders} riders. Please upgrade your plan to add more riders.`
      })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}