import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Define schema inline to avoid import issues
const StepSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, trim: true },
  order: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const StepCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    enum: [
      'Applicable Documents', 'General Instructions', 'General', 'Kit Release',
      'SMT Preparation/Planning', 'Paste Print', 'Reflow',
      'First Article Approval', 'SMT Additional Instructions',
      'Production Quantity Approval', 'Wave Solder',
      'Through Hole Stuffing', '2nd Operations',
      'Selective Solder', 'Wash and Dry',
      'Flying Probe Test', 'AOI Test', 'TH Stuffing',
      'Final QC', 'Shipping and Delivery', 'Packaging'
    ],
  },
  description: { type: String, trim: true, maxlength: 500 },
  steps: [StepSchema],
  isGlobal: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
  createdByModel: { type: String, enum: ['Engineer', 'Admin'], required: true },
  usageCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Clear model cache and create model
if (mongoose.models.StepCategorySimple) {
  delete mongoose.models.StepCategorySimple
}
const StepCategory = mongoose.model('StepCategorySimple', StepCategorySchema)

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const categories = await StepCategory.find({ isActive: true }).sort({ categoryName: 1 })

    return NextResponse.json({ 
      success: true, 
      categories: categories.map(cat => ({
        _id: cat._id,
        categoryName: cat.categoryName,
        description: cat.description,
        steps: cat.steps.filter(step => step.isActive).sort((a, b) => a.order - b.order),
        usageCount: cat.usageCount,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching step categories:', error)
    return NextResponse.json({ error: 'Failed to fetch step categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Simple step categories POST request received')
    await dbConnect()
    console.log('Database connected')

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { categoryName, description, stepTitle, stepContent } = await request.json()
    console.log('Request data:', { categoryName, description, stepTitle, stepContent })

    if (!categoryName || !stepTitle || !stepContent) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Category name, step title, and content are required' }, { status: 400 })
    }

    // Find or create the category
    console.log('Looking for category:', categoryName)
    let category = await StepCategory.findOne({ categoryName })
    console.log('Found category:', category ? 'Yes' : 'No')
    
    if (!category) {
      console.log('Creating new category')
      const placeholderUserId = new mongoose.Types.ObjectId()
      
      category = new StepCategory({
        categoryName,
        description: description || '',
        steps: [],
        createdBy: placeholderUserId,
        createdByModel: 'Engineer',
        usageCount: 0,
        isActive: true
      })
      console.log('New category created')
    }

    // Add the new step to the category
    console.log('Adding step to category')
    const newStep = {
      title: stepTitle,
      content: stepContent,
      order: category.steps.length,
      isActive: true
    }

    category.steps.push(newStep)
    console.log('Step added, saving category')
    await category.save()
    console.log('Category saved successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Step added to category successfully',
      category: {
        _id: category._id,
        categoryName: category.categoryName,
        description: category.description,
        steps: category.steps.filter(step => step.isActive).sort((a, b) => a.order - b.order),
        usageCount: category.usageCount
      }
    })
  } catch (error) {
    console.error('Error adding step to category:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: 'Failed to add step to category',
      details: error.message 
    }, { status: 500 })
  }
}
