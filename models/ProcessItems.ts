import mongoose, { Document, Schema } from 'mongoose'

export interface IStep {
  title: string
  content: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IProcessItems extends Document {
  categoryName: string
  steps: IStep[]
  isGlobal: boolean
  createdBy: mongoose.Types.ObjectId
  createdByModel: string
  usageCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StepSchema = new Schema<IStep>({
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true,
    maxlength: [200, 'Step title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Step content is required'],
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    min: [0, 'Order cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const ProcessItemsSchema = new Schema<IProcessItems>({
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  steps: [StepSchema],
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
ProcessItemsSchema.index({ isGlobal: 1 })
ProcessItemsSchema.index({ isActive: 1 })
ProcessItemsSchema.index({ createdBy: 1 })

// Case-insensitive unique index for categoryName
ProcessItemsSchema.index({ categoryName: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
})

// Text index for search functionality
ProcessItemsSchema.index({ 
  categoryName: 'text',
  'steps.title': 'text',
  'steps.content': 'text'
})

// Clear the model cache to force schema refresh
if (mongoose.models.ProcessItems) {
  delete mongoose.models.ProcessItems
}

// Create the model
const ProcessItemsModel = mongoose.model<IProcessItems>('ProcessItems', ProcessItemsSchema)

export default ProcessItemsModel
