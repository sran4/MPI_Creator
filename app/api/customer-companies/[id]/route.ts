import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

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
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the company
    const deletedCompany = await CustomerCompany.findByIdAndDelete(id)

    if (!deletedCompany) {
      return NextResponse.json(
        { error: 'Customer company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Customer company deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting customer company:', error)
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
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { companyName, city, state, contactPerson, email, phone, address, isActive } = body

    // Validate required fields
    if (!companyName || !city || !state) {
      return NextResponse.json(
        { error: 'Company name, city, and state are required' },
        { status: 400 }
      )
    }

    // Check if company already exists (excluding current company)
    const existingCompany = await CustomerCompany.findOne({
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
      _id: { $ne: id }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    // Update the company
    const updatedCompany = await CustomerCompany.findByIdAndUpdate(
      id,
      {
        companyName,
        city,
        state,
        contactPerson: contactPerson || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    )

    if (!updatedCompany) {
      return NextResponse.json(
        { error: 'Customer company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Customer company updated successfully',
        customerCompany: {
          _id: updatedCompany._id,
          companyName: updatedCompany.companyName,
          city: updatedCompany.city,
          state: updatedCompany.state,
          contactPerson: updatedCompany.contactPerson,
          email: updatedCompany.email,
          phone: updatedCompany.phone,
          address: updatedCompany.address
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating customer company:', error)
    
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
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Find the company
    const company = await CustomerCompany.findById(id)

    if (!company) {
      return NextResponse.json(
        { error: 'Customer company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      customerCompany: {
        _id: company._id,
        companyName: company.companyName,
        city: company.city,
        state: company.state,
        contactPerson: company.contactPerson,
        email: company.email,
        phone: company.phone,
        address: company.address,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching customer company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
