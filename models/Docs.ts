import mongoose, { Document, Schema } from 'mongoose'

export interface IDocs extends Document {
  jobNo?: string
  oldJobNo?: string
  mpiNo?: string
  mpiRev?: string
  processItem: string
  docId: string
  formId: string
  formRev: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DocsSchema = new Schema<IDocs>({
  jobNo: {
    type: String,
    required: false,
    trim: true,
  },
  oldJobNo: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  mpiNo: {
    type: String,
    required: false,
    trim: true,
  },
  mpiRev: {
    type: String,
    required: false,
    trim: true,
  },
  processItem: {
    type: String,
    required: [true, 'Process item is required'],
    trim: true,
    maxlength: [100, 'Process item cannot exceed 100 characters'],
  },
  docId: {
    type: String,
    required: [true, 'Document ID is required'],
    trim: true,
  },
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
    trim: true,
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
DocsSchema.index({ jobNo: 1 })
DocsSchema.index({ oldJobNo: 1 })
DocsSchema.index({ mpiNo: 1 })
DocsSchema.index({ processItem: 1 })
DocsSchema.index({ docId: 1 })
DocsSchema.index({ formId: 1 })
DocsSchema.index({ isActive: 1 })

// Clear the model cache to force schema refresh
if (mongoose.models.Docs) {
  delete mongoose.models.Docs
}

export default mongoose.model<IDocs>('Docs', DocsSchema)
