import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Engineer from '@/models/Engineer'

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

    const engineer = await Engineer.findById(params.id)
    if (!engineer) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      )
    }

    // Update engineer
    Object.assign(engineer, updateData)
    await engineer.save()

    // Return engineer data without password
    const engineerData = engineer.toObject()
    delete engineerData.password

    return NextResponse.json({
      success: true,
      engineer: engineerData
    })

  } catch (error) {
    console.error('Error updating engineer:', error)
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

    const engineer = await Engineer.findById(params.id)
    if (!engineer) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      )
    }

    // Hard delete - actually remove from database
    await Engineer.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Engineer deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting engineer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
