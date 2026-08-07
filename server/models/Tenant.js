import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const tenantSchema = new mongoose.Schema({
  // Business Info
  businessName:  { type: String, required: true, trim: true },
  subdomain:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  // Branding
  logo:          { type: String, default: '' },
  brandColor:    { type: String, default: '#f97316' },
  
  // Contact
  whatsapp:      { type: String, default: '' },
  email:         { type: String, default: '' },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  coverageArea:  { type: String, default: '' },

  // Delivery Fees
  standardFee:   { type: Number, default: 30 },
  sameDayFee:    { type: Number, default: 50 },
  expressFee:    { type: Number, default: 80 },
  scheduledFee:  { type: Number, default: 40 },

  // Subscription
  plan:          { type: String, enum: ['trial', 'starter', 'growth', 'pro'], default: 'trial' },
  status:        { type: String, enum: ['active', 'suspended', 'trial', 'cancelled'], default: 'trial' },
  trialEndsAt:   { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },

  // Admin credentials for this tenant
  adminEmail:    { type: String, required: true, unique: true, lowercase: true },
  adminPassword: { type: String, required: true },

}, { timestamps: true })

tenantSchema.pre('save', async function () {
  if (!this.isModified('adminPassword')) return
  this.adminPassword = await bcrypt.hash(this.adminPassword, 10)
})

tenantSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.adminPassword)
}

export default mongoose.model('Tenant', tenantSchema)