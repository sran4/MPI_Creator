import mongoose, { Document, Schema } from 'mongoose'

export interface IForm extends Document {
  formId: string
  formRev: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FormSchema = new Schema<IForm>({
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
    trim: true,
    maxlength: [50, 'Form ID cannot exceed 50 characters'],
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
    trim: true,
    maxlength: [20, 'Form revision cannot exceed 20 characters'],
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
FormSchema.index({ formId: 1 })
FormSchema.index({ formRev: 1 })
FormSchema.index({ isActive: 1 })

// Case-insensitive unique compound index for formId and formRev
FormSchema.index({ formId: 1, formRev: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
})

// Clear the model cache to force schema refresh
if (mongoose.models.Form) {
  delete mongoose.models.Form
}

export default mongoose.model<IForm>('Form', FormSchema)
