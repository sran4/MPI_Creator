import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const mpi = await MPI.findById(params.id)
      .populate('engineerId', 'fullName email')
      .populate('customerCompanyId', 'companyName city state')
      .populate('formId', 'formId formRev description')

    if (!mpi) {
      return NextResponse.json({ error: 'MPI not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      mpi 
    })

  } catch (error) {
    console.error('Error fetching MPI:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      customerCompanyId,
      jobNumber,
      mpiNumber,
      formId,
      formRev,
      customerAssemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate,
      dateReleased,
      pages,
      engineerId
    } = body

    // Validate required fields
    if (!customerCompanyId || !jobNumber || !mpiNumber || !customerAssemblyName || !engineerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const mpi = await MPI.findByIdAndUpdate(
      params.id,
      {
        customerCompanyId,
        jobNumber,
        mpiNumber,
        formId: formId || undefined,
        formRev: formRev || undefined,
        customerAssemblyName,
        assemblyRev,
        drawingName,
        drawingRev,
        assemblyQuantity: parseInt(assemblyQuantity) || 1,
        kitReceivedDate,
        dateReleased,
        pages,
        engineerId
      },
      { new: true, runValidators: true }
    )
      .populate('engineerId', 'fullName email')
      .populate('customerCompanyId', 'companyName city state')
      .populate('formId', 'formId formRev description')

    if (!mpi) {
      return NextResponse.json({ error: 'MPI not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      mpi 
    })

  } catch (error) {
    console.error('Error updating MPI:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
