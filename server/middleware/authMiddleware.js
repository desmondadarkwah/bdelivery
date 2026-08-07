import jwt from 'jsonwebtoken'

// Super Admin
export const protectSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'super-admin') return res.status(403).json({ error: 'Super admin access only' })
    req.superAdmin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Tenant Admin
export const protectTenant = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'tenant-admin') return res.status(403).json({ error: 'Tenant admin access only' })
    req.tenant = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Existing Admin (keep for backward compat)
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Rider
export const protectRider = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'rider') return res.status(403).json({ error: 'Rider access only' })
    req.rider = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Customer
export const protectCustomer = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'customer') return res.status(403).json({ error: 'Customer access only' })
    req.customer = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}