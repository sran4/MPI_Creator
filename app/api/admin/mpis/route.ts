import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'
import Engineer from '@/models/Engineer'
import MPI from '@/models/MPI'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// Ensure models are registered
const models = {
  MPI,
  Engineer,
  CustomerCompany
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 })
    }

    // Fetch all MPIs with populated engineer and customer company data
    const mpis = await MPI.find({ isActive: true })
      .populate('engineerId', 'fullName email')
      .populate('customerCompanyId', 'companyName')
      .sort({ createdAt: -1 })

    return NextResponse.json({ mpis })

  } catch (error: any) {
    console.error('Error fetching MPIs for admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 })
    }

    const { mpiId, status } = await request.json()

    if (!mpiId || !status) {
      return NextResponse.json({ error: 'MPI ID and status are required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['draft', 'in-review', 'approved', 'rejected', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update MPI status
    const updatedMpi = await MPI.findByIdAndUpdate(
      mpiId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('engineerId', 'fullName email')
     .populate('customerCompanyId', 'companyName')

    if (!updatedMpi) {
      return NextResponse.json({ error: 'MPI not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'MPI status updated successfully',
      mpi: updatedMpi 
    })

  } catch (error: any) {
    console.error('Error updating MPI status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
