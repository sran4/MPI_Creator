import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import GlobalSteps from '@/models/GlobalSteps'
import Engineer from '@/models/Engineer'
import Admin from '@/models/Admin'

export async function GET(request: NextRequest) {
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

    const steps = await GlobalSteps.find({ isActive: true })
      .sort({ createdAt: -1 })

    return NextResponse.json({ steps })

  } catch (error) {
    console.error('Error fetching global steps:', error)
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
    if (decoded.userType !== 'admin' && decoded.userType !== 'engineer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { title, content, category, section } = await request.json()

    if (!title || !content || !category || !section) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create new global step
    const step = new GlobalSteps({
      title,
      content,
      category,
      section,
      isGlobal: true,
      createdBy: decoded.userId, // User creating the step (admin or engineer)
      createdByModel: decoded.userType === 'admin' ? 'Admin' : 'Engineer',
    })

    await step.save()

    return NextResponse.json({
      success: true,
      step: step
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating global step:', error)
    
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
