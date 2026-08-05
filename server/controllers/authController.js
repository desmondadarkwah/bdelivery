import Admin from '../models/Admin.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/auth/setup — create first admin
export const setupAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne()
    if (exists) return res.status(400).json({ error: 'Admin already exists.' })
    const { email, password } = req.body
    const admin = await Admin.create({ email, password })
    res.status(201).json({ success: true, message: 'Admin created successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email })
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' })
    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: { id: admin._id, email: admin.email },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/auth/change-password — admin only
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const admin = await Admin.findById(req.admin.id)
    if (!admin) return res.status(404).json({ error: 'Admin not found.' })
    if (!(await admin.matchPassword(currentPassword)))
      return res.status(400).json({ error: 'Current password is incorrect.' })
    admin.password = newPassword
    await admin.save()
    res.json({ success: true, message: 'Password changed successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}