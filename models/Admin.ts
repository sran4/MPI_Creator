import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAdmin extends Document {
  email: string
  password: string
  jobNo: string
  mpiNo: string
  mpiRev: string
  docId: string
  formId: string
  formRev: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const AdminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  jobNo: {
    type: String,
    required: [true, 'Job number is required'],
    unique: true,
  },
  mpiNo: {
    type: String,
    required: [true, 'MPI number is required'],
    unique: true,
  },
  mpiRev: {
    type: String,
    required: [true, 'MPI revision is required'],
  },
  docId: {
    type: String,
    required: [true, 'Document ID is required'],
  },
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Index for better performance
AdminSchema.index({ email: 1 })
AdminSchema.index({ jobNo: 1 })
AdminSchema.index({ mpiNo: 1 })

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema)
