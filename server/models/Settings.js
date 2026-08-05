import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'SwiftByGwyn' },
  whatsapp: { type: String, default: '233000000000' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  coverageArea: { type: String, default: 'Greater Accra Region' },
  standardFee: { type: Number, default: 30 },
  sameDayFee: { type: Number, default: 50 },
  expressFee: { type: Number, default: 80 },
  scheduledFee: { type: Number, default: 40 },
}, { timestamps: true })

export default mongoose.model('Settings', settingsSchema)