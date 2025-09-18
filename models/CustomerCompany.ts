import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomerCompany extends Document {
  companyName: string
  city: string
  state: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerCompanySchema = new Schema<ICustomerCompany>({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters'],
  },
  contactPerson: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  address: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
CustomerCompanySchema.index({ city: 1 })
CustomerCompanySchema.index({ state: 1 })
CustomerCompanySchema.index({ isActive: 1 })

// Case-insensitive unique index for company name
CustomerCompanySchema.index({ companyName: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
})

// Clear the model cache to force schema refresh
if (mongoose.models.CustomerCompany) {
  delete mongoose.models.CustomerCompany
}

export default mongoose.model<ICustomerCompany>('CustomerCompany', CustomerCompanySchema)
