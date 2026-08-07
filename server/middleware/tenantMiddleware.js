import Tenant from '../models/Tenant.js'

export const resolveTenant = async (req, res, next) => {
  try {
    // Get subdomain from header (frontend sends it)
    const subdomain = req.headers['x-tenant-subdomain']
    
    if (!subdomain) {
      req.tenantId = null
      return next()
    }

    const tenant = await Tenant.findOne({ subdomain })
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' })
    if (tenant.status === 'suspended') return res.status(403).json({ error: 'Account suspended.' })

    req.tenantId = tenant._id.toString()
    req.tenant   = tenant
    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}