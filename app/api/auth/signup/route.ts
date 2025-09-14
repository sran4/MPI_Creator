import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Engineer from '@/models/Engineer'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

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

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: engineer._id, 
        email: engineer.email, 
        userType: 'engineer',
        fullName: engineer.fullName
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    // Return engineer data without password
    const engineerData = engineer.toObject()
    delete engineerData.password

    return NextResponse.json({
      success: true,
      token,
      user: engineerData,
      userType: 'engineer'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Signup error:', error)
    
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
