import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Admin from '@/models/Admin'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { email, password, adminKey } = await request.json()

    if (!email || !password || !adminKey) {
      return NextResponse.json(
        { error: 'Email, password, and admin key are required' },
        { status: 400 }
      )
    }

    // Verify admin key (you can change this to a more secure method)
    const validAdminKey = process.env.ADMIN_SIGNUP_KEY || 'ADMIN_MPI_2024'
    if (adminKey !== validAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 403 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      )
    }

    // Create new admin
    const admin = new Admin({
      email,
      password,
    })

    await admin.save()

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: admin._id, 
        email: admin.email, 
        userType: 'admin'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    // Return admin data without password
    const adminData = admin.toObject()
    delete adminData.password

    return NextResponse.json({
      success: true,
      token,
      user: adminData,
      userType: 'admin'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Admin signup error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
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
