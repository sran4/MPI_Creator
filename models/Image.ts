import mongoose, { Document, Schema } from 'mongoose'

export interface IImage extends Document {
  filename: string
  originalName: string
  url: string
  cloudinaryId: string
  size: number
  mimeType: string
  uploadedBy: mongoose.Types.ObjectId
  category: string
  tags: string[]
  isGlobal: boolean
  usageCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ImageSchema = new Schema<IImage>({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required'],
    trim: true,
  },
  size: {
    type: Number,
    required: [true, 'Size is required'],
    min: [0, 'Size cannot be negative'],
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Engineer',
    required: [true, 'Uploaded by is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Kitting',
      'SMT',
      '2nd Operations',
      'Through Hole',
      'Wash',
      'Test',
      'AOI',
      'Final QC',
      'Packaging',
      'General',
      'Other'
    ],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isGlobal: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for better performance
ImageSchema.index({ uploadedBy: 1 })
ImageSchema.index({ category: 1 })
ImageSchema.index({ isGlobal: 1 })
ImageSchema.index({ isActive: 1 })
ImageSchema.index({ tags: 1 })

// Text index for search functionality
ImageSchema.index({ 
  filename: 'text',
  originalName: 'text',
  tags: 'text'
})

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema)
