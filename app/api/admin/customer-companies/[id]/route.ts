import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'

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

    const customerCompany = await CustomerCompany.findById(params.id)

    if (!customerCompany) {
      return NextResponse.json({ error: 'Customer company not found' }, { status: 404 })
    }

    return NextResponse.json({ customerCompany })

  } catch (error) {
    console.error('Error fetching customer company:', error)
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

    const { companyName, city, state, contactPerson, email, phone, address } = await request.json()

    if (!companyName || !city || !state) {
      return NextResponse.json(
        { error: 'Company name, city, and state are required' },
        { status: 400 }
      )
    }

    const customerCompany = await CustomerCompany.findById(params.id)

    if (!customerCompany) {
      return NextResponse.json({ error: 'Customer company not found' }, { status: 404 })
    }

    // Check if another company with same name exists (excluding current one)
    const existingCompany = await CustomerCompany.findOne({ 
      _id: { $ne: params.id },
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    customerCompany.companyName = companyName
    customerCompany.city = city
    customerCompany.state = state
    customerCompany.contactPerson = contactPerson || ''
    customerCompany.email = email || ''
    customerCompany.phone = phone || ''
    customerCompany.address = address || ''

    await customerCompany.save()

    return NextResponse.json({
      success: true,
      customerCompany: customerCompany.toObject()
    })

  } catch (error: any) {
    console.error('Error updating customer company:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
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

    const customerCompany = await CustomerCompany.findById(params.id)

    if (!customerCompany) {
      return NextResponse.json({ error: 'Customer company not found' }, { status: 404 })
    }

    // Soft delete
    customerCompany.isActive = false
    await customerCompany.save()

    return NextResponse.json({
      success: true,
      message: 'Customer company deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting customer company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
