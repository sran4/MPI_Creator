import mongoose, { Document, Schema } from 'mongoose'

export interface ITask extends Document {
  step: string
  categoryName: string
  processItem: mongoose.Types.ObjectId
  isGlobal: boolean
  createdBy: mongoose.Types.ObjectId
  createdByModel: string
  usageCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>({
  step: {
    type: String,
    required: [true, 'Step is required'],
    trim: true,
    validate: {
      validator: function(step: string) {
        // Count words (split by whitespace and filter out empty strings)
        const wordCount = step.trim().split(/\s+/).filter(word => word.length > 0).length
        return wordCount <= 150
      },
      message: 'Step cannot exceed 150 words'
    }
  },
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  processItem: {
    type: Schema.Types.ObjectId,
    ref: 'ProcessItems',
    required: [true, 'Process item reference is required'],
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
TaskSchema.index({ categoryName: 1 })
TaskSchema.index({ processItem: 1 })
TaskSchema.index({ isGlobal: 1 })
TaskSchema.index({ isActive: 1 })
TaskSchema.index({ createdBy: 1 })

// Text index for search functionality
TaskSchema.index({ 
  step: 'text'
})

// Clear the model cache to force schema refresh
if (mongoose.models.Task) {
  delete mongoose.models.Task
}

export default mongoose.model<ITask>('Task', TaskSchema)
