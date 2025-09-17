import mongoose, { Document, Schema } from 'mongoose'

export interface IDocumentId extends Document {
  docId: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DocumentIdSchema = new Schema<IDocumentId>({
  docId: {
    type: String,
    required: [true, 'Document ID is required'],
    trim: true,
    maxlength: [50, 'Document ID cannot exceed 50 characters'],
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
DocumentIdSchema.index({ isActive: 1 })

// Case-insensitive unique index for docId
DocumentIdSchema.index({ docId: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
})

// Clear the model cache to force schema refresh
if (mongoose.models.DocumentId) {
  delete mongoose.models.DocumentId
}

export default mongoose.model<IDocumentId>('DocumentId', DocumentIdSchema)
