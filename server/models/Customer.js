import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
}, { timestamps: true })

customerSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

customerSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

export default mongoose.model('Customer', customerSchema)