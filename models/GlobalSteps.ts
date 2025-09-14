import mongoose, { Document, Schema } from 'mongoose'

export interface IGlobalSteps extends Document {
  title: string
  content: string
  category: string
  section: string
  isGlobal: boolean
  createdBy: mongoose.Types.ObjectId
  usageCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const GlobalStepsSchema = new Schema<IGlobalSteps>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Kitting',
      'SMT Single Side',
      'SMT Double Side',
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
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [100, 'Section name cannot exceed 100 characters'],
    // Removed strict enum validation to allow flexibility
    // Common sections are still suggested in the UI
  },
  isGlobal: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: [true, 'Created by is required'],
  },
  createdByModel: {
    type: String,
    enum: ['Engineer', 'Admin'],
    required: [true, 'Created by model is required'],
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
GlobalStepsSchema.index({ category: 1 })
GlobalStepsSchema.index({ section: 1 })
GlobalStepsSchema.index({ isGlobal: 1 })
GlobalStepsSchema.index({ isActive: 1 })
GlobalStepsSchema.index({ createdBy: 1 })

// Text index for search functionality
GlobalStepsSchema.index({ 
  title: 'text', 
  content: 'text' 
})

// Clear the model cache to force schema refresh
if (mongoose.models.GlobalSteps) {
  delete mongoose.models.GlobalSteps
}

export default mongoose.model<IGlobalSteps>('GlobalSteps', GlobalStepsSchema)
