import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const customerCompanies = await CustomerCompany.find({})
      .sort({ companyName: 1 })

    return NextResponse.json({ customerCompanies })

  } catch (error) {
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
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { companyName, city, state, contactPerson, email, phone, address } = body

    // Validate required fields
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

    // Create new customer company
    const newCustomerCompany = new CustomerCompany({
      companyName,
      city,
      state,
      contactPerson: contactPerson || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      isActive: true
    })

    await newCustomerCompany.save()

    return NextResponse.json(
      { 
        message: 'Customer company created successfully',
        customerCompany: {
          _id: newCustomerCompany._id,
          companyName: newCustomerCompany.companyName,
          city: newCustomerCompany.city,
          state: newCustomerCompany.state,
          contactPerson: newCustomerCompany.contactPerson,
          email: newCustomerCompany.email,
          phone: newCustomerCompany.phone,
          address: newCustomerCompany.address
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating customer company:', error)
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
