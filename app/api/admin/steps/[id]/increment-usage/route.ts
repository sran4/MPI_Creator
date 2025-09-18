import dbConnect from '@/lib/mongodb'
import Task from '@/models/Task'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

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
    if (decoded.userType !== 'admin' && decoded.userType !== 'engineer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const task = await Task.findById(params.id)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Increment the usage count
    task.usageCount = (task.usageCount || 0) + 1
    await task.save()

    return NextResponse.json({
      success: true,
      usageCount: task.usageCount
    })

  } catch (error) {
    console.error('Error incrementing task usage count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
