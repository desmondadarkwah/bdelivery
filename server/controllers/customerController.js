import Customer from '../models/Customer.js'
import Order from '../models/Order.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' })

// POST /api/customers/register
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' })
    const exists = await Customer.findOne({ email })
    if (exists) return res.status(400).json({ error: 'An account with this email already exists.' })
    const customer = await Customer.create({ name, email, password, phone })
    res.status(201).json({
      success: true,
      token: generateToken(customer._id),
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// POST /api/customers/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body
    const customer = await Customer.findOne({ email })
    if (!customer || !(await customer.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' })
    res.json({
      success: true,
      token: generateToken(customer._id),
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/customers/me
export const getCustomerMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password')
    res.json({ success: true, customer })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// PUT /api/customers/me
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { name, phone },
      { new: true }
    ).select('-password')
    res.json({ success: true, customer })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// PUT /api/customers/me/password
export const changeCustomerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const customer = await Customer.findById(req.customer.id)
    if (!(await customer.matchPassword(currentPassword)))
      return res.status(400).json({ error: 'Current password is incorrect.' })
    customer.password = newPassword
    await customer.save()
    res.json({ success: true, message: 'Password changed successfully.' })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/customers/orders — customer sees their own orders
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer.id })
      .populate('assignedRider', 'name phone')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// GET /api/customers/all — admin only
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 })
    res.json({ success: true, data: customers })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// DELETE /api/customers/:id — admin only
export const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Customer deleted.' })
  } catch (err) { res.status(500).json({ error: err.message }) }
}