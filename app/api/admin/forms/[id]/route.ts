import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Form from '@/models/Form'

export async function GET(
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

    const form = await Form.findById(params.id)

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ form })

  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { formId, formRev, description } = await request.json()

    if (!formId || !formRev) {
      return NextResponse.json(
        { error: 'Form ID and Form Revision are required' },
        { status: 400 }
      )
    }

    const form = await Form.findById(params.id)

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Check if another form with same ID and revision exists (excluding current form)
    const existingForm = await Form.findOne({ 
      _id: { $ne: params.id },
      formId: { $regex: new RegExp(`^${formId}$`, 'i') },
      formRev: { $regex: new RegExp(`^${formRev}$`, 'i') }
    })

    if (existingForm) {
      return NextResponse.json(
        { error: 'Form with this ID and revision already exists' },
        { status: 409 }
      )
    }

    form.formId = formId
    form.formRev = formRev
    form.description = description || ''

    await form.save()

    return NextResponse.json({
      success: true,
      form: form.toObject()
    })

  } catch (error: any) {
    console.error('Error updating form:', error)
    
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

    const form = await Form.findById(params.id)

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Soft delete
    form.isActive = false
    await form.save()

    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
