import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ProcessItems from '@/models/ProcessItems'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      category: {
        _id: category._id,
        categoryName: category.categoryName,
        steps: category.steps,
        usageCount: category.usageCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const { categoryName } = await request.json()

    if (!categoryName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if new category name already exists (excluding current category)
    const existingCategory = await ProcessItems.findOne({ 
      categoryName, 
      _id: { $ne: params.id } 
    })
    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }

    // Update category
    category.categoryName = categoryName
    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Category updated successfully',
      category: {
        _id: category._id,
        categoryName: category.categoryName,
        steps: category.steps,
        usageCount: category.usageCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has steps
    if (category.steps && category.steps.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing steps. Please remove all steps first.' 
      }, { status: 400 })
    }

    // Soft delete - set isActive to false
    category.isActive = false
    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}