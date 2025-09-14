import mongoose, { Document, Schema } from 'mongoose'

export interface IStep {
  title: string
  content: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IStepCategory extends Document {
  categoryName: string
  description: string
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

const StepCategorySchema = new Schema<IStepCategory>({
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    enum: [
      'Applicable Documents',
      'General Instructions',
      'General',
      'Kit Release',
      'SMT Preparation/Planning',
      'Paste Print',
      'Reflow',
      'First Article Approval',
      'SMT Additional Instructions',
      'Production Quantity Approval',
      'Wave Solder',
      'Through Hole Stuffing',
      '2nd Operations',
      'Selective Solder',
      'Wash and Dry',
      'Flying Probe Test',
      'AOI Test',
      'TH Stuffing',
      'Final QC',
      'Shipping and Delivery',
      'Packaging'
    ],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
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
StepCategorySchema.index({ categoryName: 1 })
StepCategorySchema.index({ isGlobal: 1 })
StepCategorySchema.index({ isActive: 1 })
StepCategorySchema.index({ createdBy: 1 })

// Text index for search functionality
StepCategorySchema.index({ 
  categoryName: 'text', 
  description: 'text',
  'steps.title': 'text',
  'steps.content': 'text'
})

// Clear the model cache to force schema refresh
if (mongoose.models.StepCategory) {
  delete mongoose.models.StepCategory
}

// Create the model
const StepCategoryModel = mongoose.model<IStepCategory>('StepCategory', StepCategorySchema)

export default StepCategoryModel
