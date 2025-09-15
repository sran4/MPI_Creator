import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ProcessItems from '@/models/ProcessItems'
import Engineer from '@/models/Engineer'
import Admin from '@/models/Admin'
import jwt from 'jsonwebtoken'

export async function POST(
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { stepTitle, stepContent } = await request.json()

    if (!stepTitle || !stepContent) {
      return NextResponse.json({ error: 'Step title and content are required' }, { status: 400 })
    }

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Add the new step to the category
    const newStep = {
      title: stepTitle,
      content: stepContent,
      order: category.steps.length,
      isActive: true
    }

    category.steps.push(newStep)
    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Step added successfully',
      step: newStep
    })
  } catch (error) {
    console.error('Error adding step to category:', error)
    return NextResponse.json({ error: 'Failed to add step to category' }, { status: 500 })
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { stepId, title, content, order } = await request.json()

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const step = category.steps.id(stepId)
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Update step
    if (title) step.title = title
    if (content) step.content = content
    if (order !== undefined) step.order = order

    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Step updated successfully'
    })
  } catch (error) {
    console.error('Error updating step:', error)
    return NextResponse.json({ error: 'Failed to update step' }, { status: 500 })
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { stepId } = await request.json()

    const category = await ProcessItems.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const step = category.steps.id(stepId)
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Hard delete - actually remove the step
    category.steps.pull(stepId)
    await category.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Step deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting step:', error)
    return NextResponse.json({ error: 'Failed to delete step' }, { status: 500 })
  }
}