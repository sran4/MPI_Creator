import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'
import Engineer from '@/models/Engineer'
import Docs from '@/models/Docs'
import Customer from '@/models/Customer'
import CustomerCompany from '@/models/CustomerCompany'

// Ensure models are registered
const models = {
  MPI,
  Engineer,
  Docs,
  Customer,
  CustomerCompany
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔑 Dashboard API - Token received:', token ? 'Token exists' : 'No token')
    
    if (!token) {
      console.error('❌ Dashboard API - No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Validate token format
    if (!token.includes('.')) {
      console.error('❌ Dashboard API - Invalid token format')
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      console.log('✅ Dashboard API - Token verified, Engineer ID:', decoded.userId)
    } catch (jwtError) {
      console.error('❌ Dashboard API - JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const engineerId = decoded.userId
    console.log('🔍 Dashboard API - Fetching MPIs for engineer:', engineerId)

    // Fetch MPIs and handle populate gracefully
    const mpis = await MPI.find({ engineerId, isActive: true })
      .sort({ updatedAt: -1 })
    
    // Try to populate customerCompanyId for each MPI individually
    const mpisWithPopulate = await Promise.all(
      mpis.map(async (mpi) => {
        try {
          if (mpi.customerCompanyId) {
            await mpi.populate('customerCompanyId', 'companyName city state')
          }
          return mpi
        } catch (error) {
          console.log('Failed to populate customerCompanyId for MPI:', mpi.mpiNumber, error.message)
          return mpi
        }
      })
    )

    console.log('Found MPIs:', mpisWithPopulate.length)
    return NextResponse.json({ mpis: mpisWithPopulate })

  } catch (error) {
    console.error('Error fetching MPIs:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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

    const { 
      customerCompanyId, 
      jobNumber, 
      oldJobNumber, 
      mpiNumber, 
      mpiVersion,
      formId,        // Add this
      formRev,       // Add this
      customerAssemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate,
      dateReleased,
      pages
    } = await request.json()

    if (!customerCompanyId || !jobNumber || !mpiNumber) {
      return NextResponse.json(
        { error: 'Customer company, Job number, and MPI number are required' },
        { status: 400 }
      )
    }

    // Check if job number already exists
    const existingJobNumber = await MPI.findOne({ jobNumber })
    if (existingJobNumber) {
      return NextResponse.json(
        { error: 'Job number already exists' },
        { status: 409 }
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

    // Verify customer company exists (no engineer restriction for customer companies)
    const CustomerCompany = require('@/models/CustomerCompany').default
    const customerCompany = await CustomerCompany.findById(customerCompanyId)
    if (!customerCompany) {
      return NextResponse.json(
        { error: 'Customer company not found' },
        { status: 404 }
      )
    }

    // Create default sections
    const defaultSections = [
      { id: 'applicable-docs', title: 'Applicable Documents', content: '', order: 1, isCollapsed: false, images: [] },
      { id: 'general-instructions', title: 'General Instructions', content: '', order: 2, isCollapsed: false, images: [] },
      { id: 'kit-release', title: 'Kit Release', content: '', order: 3, isCollapsed: false, images: [] },
      { id: 'smt-prep', title: 'SMT Preparation/Planning', content: '', order: 4, isCollapsed: false, images: [] },
      { id: 'paste-print', title: 'Paste Print', content: '', order: 5, isCollapsed: false, images: [] },
      { id: 'reflow', title: 'Reflow', content: '', order: 6, isCollapsed: false, images: [] },
      { id: 'first-article', title: 'First Article Approval', content: '', order: 7, isCollapsed: false, images: [] },
      { id: 'smt-additional', title: 'SMT Additional Instructions', content: '', order: 8, isCollapsed: false, images: [] },
      { id: 'wave-solder', title: 'Wave Solder', content: '', order: 9, isCollapsed: false, images: [] },
      { id: 'through-hole', title: 'Through Hole Stuffing', content: '', order: 10, isCollapsed: false, images: [] },
      { id: 'second-operations', title: '2nd Operations', content: '', order: 11, isCollapsed: false, images: [] },
      { id: 'selective-solder', title: 'Selective Solder', content: '', order: 12, isCollapsed: false, images: [] },
      { id: 'wash-dry', title: 'Wash and Dry', content: '', order: 13, isCollapsed: false, images: [] },
      { id: 'flying-probe', title: 'Flying Probe Test', content: '', order: 14, isCollapsed: false, images: [] },
      { id: 'solder-paste-inspection', title: 'Solder Paste Inspection', content: '', order: 15, isCollapsed: false, images: [] },
      { id: 'aoi', title: 'Automatic Optical Inspection (AOI)', content: '', order: 16, isCollapsed: false, images: [] },
      { id: 'final-qc', title: 'Final QC', content: '', order: 17, isCollapsed: false, images: [] },
      { id: 'ship-delivery', title: 'Ship and Delivery', content: '', order: 18, isCollapsed: false, images: [] },
      { id: 'packaging', title: 'Packaging', content: '', order: 19, isCollapsed: false, images: [] },
      { id: 'test', title: 'Test', content: '', order: 20, isCollapsed: false, images: [] }
    ]

    const mpi = new MPI({
      jobNumber,
      oldJobNumber: oldJobNumber || undefined,
      mpiNumber,
      mpiVersion: mpiVersion || undefined,
      engineerId,
      customerCompanyId,
      customerAssemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate: new Date(kitReceivedDate),
      dateReleased,
      pages,
      formId: formId || undefined,
      formRev: formRev || undefined,
      sections: defaultSections,
      status: 'draft',
      versionHistory: [{
        version: mpiVersion || 'Rev A',
        date: new Date(),
        description: 'Initial creation',
        engineerName: decoded.fullName
      }]
    })

    await mpi.save()

    // Create corresponding Docs record
    try {
      const docsRecord = new Docs({
        jobNo: jobNumber,
        oldJobNo: oldJobNumber || null,
        mpiNo: mpiNumber,
        mpiRev: mpiVersion || null,
        processItem: 'MPI Creation', // Default process item for MPI creation
        docId: `DOC-${mpiNumber}`, // Generate doc ID based on MPI number
        formId: 'FORM-MPI', // Default form ID for MPI
        formRev: 'Rev A' // Default form revision
      })

      await docsRecord.save()
      console.log(`✅ Created Docs record for MPI: ${mpiNumber}`)
    } catch (docsError) {
      console.error('Error creating Docs record:', docsError)
      // Don't fail the MPI creation if Docs creation fails
    }

    // Create corresponding Customer record
    try {
      const customerRecord = new Customer({
        customerCompanyId,
        assemblyName: customerAssemblyName, // Map customerAssemblyName to assemblyName
        assemblyRev,
        drawingName,
        drawingRev,
        assemblyQuantity,
        kitReceivedDate: new Date(kitReceivedDate),
        kitCompleteDate: new Date(kitReceivedDate), // Use kitReceivedDate as default for kitCompleteDate
        comments: `MPI: ${mpiNumber} - Job: ${jobNumber}`, // Generate comments from MPI data
        engineerId
      })

      await customerRecord.save()
      console.log(`✅ Created Customer record for MPI: ${mpiNumber}`)
    } catch (customerError) {
      console.error('Error creating Customer record:', customerError)
      // Don't fail the MPI creation if Customer creation fails
    }

    const populatedMPI = await MPI.findById(mpi._id)
      .populate('customerCompanyId', 'companyName city state')

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
