import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import GlobalSteps from '@/models/GlobalSteps'

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

    const updateData = await request.json()

    const step = await GlobalSteps.findById(params.id)
    if (!step) {
      return NextResponse.json(
        { error: 'Global step not found' },
        { status: 404 }
      )
    }

    // Update step
    Object.assign(step, updateData)
    await step.save()

    const updatedStep = await GlobalSteps.findById(step._id)
      .populate('createdBy', 'fullName')

    return NextResponse.json({
      success: true,
      step: updatedStep
    })

  } catch (error) {
    console.error('Error updating global step:', error)
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

    const step = await GlobalSteps.findById(params.id)
    if (!step) {
      return NextResponse.json(
        { error: 'Global step not found' },
        { status: 404 }
      )
    }

    // Hard delete - actually remove from database
    await GlobalSteps.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Global step deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting global step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
