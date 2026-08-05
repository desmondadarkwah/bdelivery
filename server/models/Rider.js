import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  totalDeliveries: { type: Number, default: 0 },
}, { timestamps: true })

riderSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

riderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('Rider', riderSchema)