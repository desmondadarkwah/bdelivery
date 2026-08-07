import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const superAdminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true })

superAdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

superAdminSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

export default mongoose.model('SuperAdmin', superAdminSchema)