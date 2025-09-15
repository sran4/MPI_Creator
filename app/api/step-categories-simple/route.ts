import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ProcessItems from '@/models/ProcessItems'
import Task from '@/models/Task'
import jwt from 'jsonwebtoken'

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

    // Get categories and their associated tasks
    const categories = await ProcessItems.find({ isActive: true }).sort({ categoryName: 1 })
    const tasks = await Task.find({ isActive: true }).populate('processItem', 'categoryName')

    // Group tasks by category
    const categoriesWithSteps = categories.map(cat => {
      const categorySteps = tasks
        .filter(task => task.processItem && task.processItem._id.toString() === cat._id.toString())
        .map(task => ({
          _id: task._id,
          step: task.step,
          order: 0, // Tasks don't have order, so we'll use 0
          isActive: task.isActive
        }))
        .sort((a, b) => a.step.localeCompare(b.step)) // Sort by step content

      return {
        _id: cat._id,
        categoryName: cat.categoryName,
        steps: categorySteps,
        usageCount: cat.usageCount,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }
    })

    return NextResponse.json({ 
      success: true, 
      categories: categoriesWithSteps
    })
  } catch (error) {
    console.error('Error fetching step categories:', error)
    return NextResponse.json({ error: 'Failed to fetch step categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { categoryName, step } = await request.json()

    if (!categoryName || !step) {
      return NextResponse.json({ error: 'Category name and step are required' }, { status: 400 })
    }

    // Find the category
    const category = await ProcessItems.findOne({ categoryName })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Create a new Task
    const task = new Task({
      step,
      categoryName: category.categoryName,
      processItem: category._id,
      isGlobal: true,
      createdBy: decoded.userId,
      createdByModel: decoded.userType === 'admin' ? 'Admin' : 'Engineer',
    })

    await task.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Step created successfully',
      step: {
        _id: task._id,
        step: task.step,
        categoryName: task.categoryName,
        processItem: category._id
      }
    })
  } catch (error: any) {
    console.error('Error creating step:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to create step',
      details: error.message 
    }, { status: 500 })
  }
}