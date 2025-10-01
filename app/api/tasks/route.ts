import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Task from '@/models/Task'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const tasks = await Task.find({ isActive: true })
      .populate('processItem', 'categoryName')
      .sort({ categoryName: 1, createdAt: -1 })

    return NextResponse.json({ tasks })

  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const requestBody = await request.json()
    console.log('📝 Task creation request body:', requestBody)
    
    const { step, processItemId } = requestBody

    if (!step || !processItemId) {
      console.log('❌ Missing required fields:', { step: !!step, processItemId: !!processItemId })
      return NextResponse.json(
        { error: 'Step and process item are required' },
        { status: 400 }
      )
    }

    // Import ProcessItems model
    const ProcessItems = (await import('@/models/ProcessItems')).default

    // Verify the process item exists
    const processItem = await ProcessItems.findById(processItemId)
    if (!processItem) {
      return NextResponse.json(
        { error: 'Invalid process item' },
        { status: 400 }
      )
    }

    // Create new task
    const task = new Task({
      step,
      categoryName: processItem.categoryName,
      processItem: processItemId,
      isGlobal: true,
      createdBy: decoded.userId, // User creating the step (admin or engineer)
      createdByModel: decoded.userType === 'admin' ? 'Admin' : 'Engineer',
    })

    await task.save()

    return NextResponse.json({
      success: true,
      task: task
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating task:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
