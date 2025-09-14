import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Engineer from '@/models/Engineer'

export async function GET(request: NextRequest) {
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

    const engineers = await Engineer.find()
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({ engineers })

  } catch (error) {
    console.error('Error fetching engineers:', error)
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
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { fullName, email, password, title } = await request.json()

    if (!fullName || !email || !password || !title) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if engineer already exists
    const existingEngineer = await Engineer.findOne({ email })
    if (existingEngineer) {
      return NextResponse.json(
        { error: 'Engineer with this email already exists' },
        { status: 409 }
      )
    }

    // Create new engineer
    const engineer = new Engineer({
      fullName,
      email,
      password,
      title,
    })

    await engineer.save()

    // Return engineer data without password
    const engineerData = engineer.toObject()
    delete engineerData.password

    return NextResponse.json({
      success: true,
      engineer: engineerData
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating engineer:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Engineer with this email already exists' },
        { status: 409 }
      )
    }

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
