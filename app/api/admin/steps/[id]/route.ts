import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Task from '@/models/Task'
import ProcessItems from '@/models/ProcessItems'
import mongoose from 'mongoose'

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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 })
    }

    const { step: stepContent, processItemId } = await request.json()

    if (!stepContent || !processItemId) {
      return NextResponse.json(
        { error: 'Step and process item are required' },
        { status: 400 }
      )
    }

    // Verify the process item exists
    const processItem = await ProcessItems.findById(processItemId)
    if (!processItem) {
      return NextResponse.json(
        { error: 'Invalid process item' },
        { status: 400 }
      )
    }

    const task = await Task.findById(params.id)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Update step
    task.step = stepContent
    task.categoryName = processItem.categoryName
    task.processItem = processItemId
    await task.save()

    const updatedStep = await Task.findById(task._id)
      .populate('processItem', 'categoryName')
      .populate('createdBy', 'fullName')

    return NextResponse.json({
      success: true,
      step: updatedStep
    })

  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const step = await Task.findById(params.id)
    if (!step) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Hard delete - actually remove from database
    await Task.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}