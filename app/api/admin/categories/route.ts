import dbConnect from '@/lib/mongodb'
import ProcessItems from '@/models/ProcessItems'
import Task from '@/models/Task'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const categories = await ProcessItems.find({ isActive: true })
      .sort({ categoryName: 1 })
      .select('_id categoryName createdAt updatedAt')

    // Calculate task counts and usage statistics for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        // Count tasks in this category
        const taskCount = await Task.countDocuments({ 
          processItem: category._id, 
          isActive: true 
        })

        // Calculate total usage count for tasks in this category
        const tasks = await Task.find({ 
          processItem: category._id, 
          isActive: true 
        }).select('usageCount')

        const totalUsage = tasks.reduce((sum, task) => sum + (task.usageCount || 0), 0)

        return {
          _id: category._id,
          categoryName: category.categoryName,
          steps: taskCount, // Number of tasks in this category
          usageCount: totalUsage, // Total usage count of all tasks in this category
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      categories: categoriesWithStats 
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
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
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { categoryName } = await request.json()

    if (!categoryName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await ProcessItems.findOne({ categoryName })
    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }

    const category = new ProcessItems({
      categoryName,
      steps: [],
      createdBy: decoded.userId,
      createdByModel: 'Admin',
      usageCount: 0,
      isActive: true
    })

    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Category created successfully',
      category: {
        _id: category._id,
        categoryName: category.categoryName,
        steps: category.steps,
        usageCount: category.usageCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
