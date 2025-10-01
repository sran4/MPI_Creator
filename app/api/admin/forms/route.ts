import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Form from '@/models/Form'

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

    const forms = await Form.find({ isActive: true })
      .sort({ formId: 1, formRev: 1 })

    return NextResponse.json({ forms })

  } catch (error: any) {
    console.error('Error fetching forms:', error)
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

    const { formId, formRev, description } = await request.json()

    if (!formId || !formRev) {
      return NextResponse.json(
        { error: 'Form ID and Form Revision are required' },
        { status: 400 }
      )
    }

    // Check if form already exists
    const existingForm = await Form.findOne({ 
      formId: { $regex: new RegExp(`^${formId}$`, 'i') },
      formRev: { $regex: new RegExp(`^${formRev}$`, 'i') }
    })

    if (existingForm) {
      return NextResponse.json(
        { error: 'Form with this ID and revision already exists' },
        { status: 409 }
      )
    }

    const form = new Form({
      formId,
      formRev,
      description: description || '',
    })

    await form.save()

    return NextResponse.json({
      success: true,
      form: form.toObject()
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating form:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Form with this ID and revision already exists' },
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
