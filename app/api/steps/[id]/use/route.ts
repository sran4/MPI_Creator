import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import GlobalSteps from '@/models/GlobalSteps'

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

    const step = await GlobalSteps.findById(params.id)
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Increment usage count
    step.usageCount += 1
    await step.save()

    return NextResponse.json({ 
      success: true, 
      usageCount: step.usageCount 
    })

  } catch (error) {
    console.error('Error updating step usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
