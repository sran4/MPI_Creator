import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomer extends Document {
  customerName: string
  assemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: Date
  kitCompleteDate: Date
  comments: string
  engineerId: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters'],
  },
  assemblyName: {
    type: String,
    required: [true, 'Assembly name is required'],
    trim: true,
    maxlength: [100, 'Assembly name cannot exceed 100 characters'],
  },
  assemblyRev: {
    type: String,
    required: [true, 'Assembly revision is required'],
    trim: true,
    maxlength: [20, 'Assembly revision cannot exceed 20 characters'],
  },
  drawingName: {
    type: String,
    required: [true, 'Drawing name is required'],
    trim: true,
    maxlength: [100, 'Drawing name cannot exceed 100 characters'],
  },
  drawingRev: {
    type: String,
    required: [true, 'Drawing revision is required'],
    trim: true,
    maxlength: [20, 'Drawing revision cannot exceed 20 characters'],
  },
  assemblyQuantity: {
    type: Number,
    required: [true, 'Assembly quantity is required'],
    min: [1, 'Assembly quantity must be at least 1'],
  },
  kitReceivedDate: {
    type: Date,
    required: [true, 'Kit received date is required'],
  },
  kitCompleteDate: {
    type: Date,
    required: [true, 'Kit complete date is required'],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, 'Comments cannot exceed 500 characters'],
  },
  engineerId: {
    type: Schema.Types.ObjectId,
    ref: 'Engineer',
    required: [true, 'Engineer ID is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
CustomerSchema.index({ customerName: 1 })
CustomerSchema.index({ assemblyName: 1 })
CustomerSchema.index({ engineerId: 1 })
CustomerSchema.index({ isActive: 1 })

// Compound index for unique customer-assembly combination per engineer
CustomerSchema.index({ 
  customerName: 1, 
  assemblyName: 1, 
  engineerId: 1 
}, { 
  unique: true,
  partialFilterExpression: { isActive: true }
})

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema)
