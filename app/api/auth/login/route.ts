import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Admin from '@/models/Admin'
import Engineer from '@/models/Engineer'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { email, password, userType } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      )
    }

    let user = null
    let userModel = null

    if (userType === 'admin') {
      user = await Admin.findOne({ email })
      userModel = Admin
    } else if (userType === 'engineer') {
      user = await Engineer.findOne({ email, isActive: true })
      userModel = Engineer
    } else {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        userType,
        fullName: user.fullName || (userType === 'admin' ? 'Admin' : user.fullName)
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    // Return user data without password
    const userData = user.toObject()
    delete userData.password

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      userType
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
