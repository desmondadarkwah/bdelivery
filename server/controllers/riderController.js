import Rider from '../models/Rider.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => jwt.sign({ id, role: 'rider' }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/riders — admin creates rider
export const createRider = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const exists = await Rider.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Rider with this email already exists.' })
    const rider = await Rider.create({ name, email, password, phone })
    res.status(201).json({ success: true, data: rider })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/riders/login
export const loginRider = async (req, res) => {
  try {
    const { email, password } = req.body
    const rider = await Rider.findOne({ email })
    if (!rider || !(await rider.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' })
    if (rider.status === 'suspended')
      return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' })
    res.json({
      success: true,
      token: generateToken(rider._id),
      rider: { id: rider._id, name: rider.name, email: rider.email, phone: rider.phone },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/riders — admin gets all riders
export const getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: riders })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/riders/me — rider gets own info
export const getRiderMe = async (req, res) => {
  try {
    const rider = await Rider.findById(req.rider.id).select('-password')
    res.json({ success: true, data: rider })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/riders/:id/status — admin suspends/activates rider
export const updateRiderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const rider = await Rider.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password')
    res.json({ success: true, data: rider })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/riders/:id — admin deletes rider
export const deleteRider = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Rider deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}