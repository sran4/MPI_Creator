import mongoose, { Document, Schema } from 'mongoose'

export interface IMPISection {
  id: string
  title: string
  content: string
  order: number
  isCollapsed: boolean
  images: string[]
}

export interface IMPI extends Document {
  mpiNumber: string
  mpiVersion: string
  engineerId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  sections: IMPISection[]
  status: 'draft' | 'in-review' | 'approved' | 'archived'
  versionHistory: {
    version: string
    date: Date
    description: string
    engineerName: string
  }[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const MPISectionSchema = new Schema<IMPISection>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  images: [{
    type: String,
  }],
}, { _id: false })

const VersionHistorySchema = new Schema({
  version: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  engineerName: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false })

const MPISchema = new Schema<IMPI>({
  mpiNumber: {
    type: String,
    required: [true, 'MPI number is required'],
    unique: true,
    trim: true,
  },
  mpiVersion: {
    type: String,
    required: [true, 'MPI version is required'],
    trim: true,
  },
  engineerId: {
    type: Schema.Types.ObjectId,
    ref: 'Engineer',
    required: [true, 'Engineer ID is required'],
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
  },
  sections: [MPISectionSchema],
  status: {
    type: String,
    enum: ['draft', 'in-review', 'approved', 'archived'],
    default: 'draft',
  },
  versionHistory: [VersionHistorySchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
MPISchema.index({ mpiNumber: 1 })
MPISchema.index({ engineerId: 1 })
MPISchema.index({ customerId: 1 })
MPISchema.index({ status: 1 })
MPISchema.index({ isActive: 1 })

// Text index for search functionality
MPISchema.index({ 
  mpiNumber: 'text',
  mpiVersion: 'text'
})

export default mongoose.models.MPI || mongoose.model<IMPI>('MPI', MPISchema)
