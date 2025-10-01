import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'

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

    const customerCompanies = await CustomerCompany.find({ isActive: true })
      .sort({ companyName: 1 })

    return NextResponse.json({ customerCompanies })

  } catch (error: any) {
    console.error('Error fetching customer companies:', error)
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

    const { companyName, city, state, contactPerson, email, phone, address } = await request.json()

    if (!companyName || !city || !state) {
      return NextResponse.json(
        { error: 'Company name, city, and state are required' },
        { status: 400 }
      )
    }

    // Check if company already exists
    const existingCompany = await CustomerCompany.findOne({ 
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    const customerCompany = new CustomerCompany({
      companyName,
      city,
      state,
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
    })

    await customerCompany.save()

    return NextResponse.json({
      success: true,
      customerCompany: customerCompany.toObject()
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating customer company:', error)
    
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
