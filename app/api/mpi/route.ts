import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'
import Engineer from '@/models/Engineer'
import Customer from '@/models/Customer'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const engineerId = decoded.userId

    const mpis = await MPI.find({ engineerId, isActive: true })
      .populate('customerId', 'customerName assemblyName')
      .sort({ updatedAt: -1 })

    return NextResponse.json({ mpis })

  } catch (error) {
    console.error('Error fetching MPIs:', error)
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
    const engineerId = decoded.userId

    const { customerId, mpiNumber, mpiVersion } = await request.json()

    if (!customerId || !mpiNumber || !mpiVersion) {
      return NextResponse.json(
        { error: 'Customer ID, MPI number, and version are required' },
        { status: 400 }
      )
    }

    // Check if MPI number already exists
    const existingMPI = await MPI.findOne({ mpiNumber })
    if (existingMPI) {
      return NextResponse.json(
        { error: 'MPI number already exists' },
        { status: 409 }
      )
    }

    // Verify customer belongs to engineer
    const customer = await Customer.findOne({ _id: customerId, engineerId })
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      )
    }

    // Create default sections
    const defaultSections = [
      { id: 'applicable-docs', title: 'Applicable Documents', content: '', order: 1, isCollapsed: false, images: [] },
      { id: 'general-instructions', title: 'General Instructions', content: '', order: 2, isCollapsed: false, images: [] },
      { id: 'misc', title: 'Misc', content: '', order: 3, isCollapsed: false, images: [] },
      { id: 'kit-release', title: 'Kit Release', content: '', order: 4, isCollapsed: false, images: [] },
      { id: 'smt-prep', title: 'SMT Preparation and Planning', content: '', order: 5, isCollapsed: false, images: [] },
      { id: 'smt-paste', title: 'SMT Paste Print', content: '', order: 6, isCollapsed: false, images: [] },
      { id: 'smt-special', title: 'SMT Special Instructions', content: '', order: 7, isCollapsed: false, images: [] },
      { id: 'smt-reflow', title: 'SMT Reflow', content: '', order: 8, isCollapsed: false, images: [] },
      { id: 'smt-first-article', title: 'SMT First Article Approval', content: '', order: 9, isCollapsed: false, images: [] },
      { id: 'smt-production', title: 'SMT Production Quantity Approval', content: '', order: 10, isCollapsed: false, images: [] },
      { id: 'smt-additional', title: 'SMT Additional Instructions', content: '', order: 11, isCollapsed: false, images: [] },
      { id: 'wash-1', title: 'Wash', content: '', order: 12, isCollapsed: false, images: [] },
      { id: 'second-operations', title: '2nd Operations', content: '', order: 13, isCollapsed: false, images: [] },
      { id: 'wash-2', title: 'Wash', content: '', order: 14, isCollapsed: false, images: [] },
      { id: 'test-section', title: 'Test Section', content: '', order: 15, isCollapsed: false, images: [] },
      { id: 'aoi', title: 'AOI', content: '', order: 16, isCollapsed: false, images: [] },
      { id: 'final-qc', title: 'Final QC, Ship and Delivery', content: '', order: 17, isCollapsed: false, images: [] },
      { id: 'improvement', title: 'Improvement Section', content: '', order: 18, isCollapsed: false, images: [] }
    ]

    const mpi = new MPI({
      mpiNumber,
      mpiVersion,
      engineerId,
      customerId,
      sections: defaultSections,
      status: 'draft',
      versionHistory: [{
        version: mpiVersion,
        date: new Date(),
        description: 'Initial creation',
        engineerName: decoded.fullName
      }]
    })

    await mpi.save()

    const populatedMPI = await MPI.findById(mpi._id)
      .populate('customerId', 'customerName assemblyName')

    return NextResponse.json({
      success: true,
      mpi: populatedMPI
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating MPI:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'MPI number already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
