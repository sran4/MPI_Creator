import mongoose, { Document, Schema } from 'mongoose'

export interface IMPISection {
  id: string
  title: string
  content: string
  order: number
  isCollapsed: boolean
  images: string[]
  documentId?: string
}

export interface IMPI extends Document {
  jobNumber: string
  oldJobNumber?: string
  mpiNumber: string
  mpiVersion?: string
  engineerId: mongoose.Types.ObjectId
  customerCompanyId: mongoose.Types.ObjectId
  customerAssemblyName: string
  assemblyRev: string
  drawingName: string
  drawingRev: string
  assemblyQuantity: number
  kitReceivedDate: Date
  dateReleased: string
  pages: string
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
  documentId: {
    type: String,
    required: false,
    trim: true,
  },
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
  jobNumber: {
    type: String,
    required: [true, 'Job number is required'],
    unique: true,
    trim: true,
  },
  oldJobNumber: {
    type: String,
    required: false,
    trim: true,
  },
  mpiNumber: {
    type: String,
    required: [true, 'MPI number is required'],
    unique: true,
    trim: true,
  },
  mpiVersion: {
    type: String,
    required: false,
    trim: true,
  },
  engineerId: {
    type: Schema.Types.ObjectId,
    ref: 'Engineer',
    required: [true, 'Engineer ID is required'],
  },
  customerCompanyId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomerCompany',
    required: [true, 'Customer company ID is required'],
  },
  customerAssemblyName: {
    type: String,
    required: [true, 'Customer assembly name is required'],
    trim: true,
  },
  assemblyRev: {
    type: String,
    required: [true, 'Assembly revision is required'],
    trim: true,
  },
  drawingName: {
    type: String,
    required: [true, 'Drawing name is required'],
    trim: true,
  },
  drawingRev: {
    type: String,
    required: [true, 'Drawing revision is required'],
    trim: true,
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
  dateReleased: {
    type: String,
    required: [true, 'Date released is required'],
    trim: true,
  },
  pages: {
    type: String,
    required: [true, 'Pages is required'],
    trim: true,
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
MPISchema.index({ oldJobNumber: 1 })
MPISchema.index({ engineerId: 1 })
MPISchema.index({ customerCompanyId: 1 })
MPISchema.index({ status: 1 })
MPISchema.index({ isActive: 1 })

// Text index for search functionality
MPISchema.index({ 
  mpiNumber: 'text',
  mpiVersion: 'text'
})

// Clear the model cache to force schema refresh
if (mongoose.models.MPI) {
  delete mongoose.models.MPI
}

export default mongoose.model<IMPI>('MPI', MPISchema)
