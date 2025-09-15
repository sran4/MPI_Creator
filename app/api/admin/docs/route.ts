import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Docs from '@/models/Docs'

export async function GET(request: NextRequest) {
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

    const docs = await Docs.find({ isActive: true })
      .sort({ createdAt: -1 })

    return NextResponse.json({ 
      success: true, 
      docs 
    })
  } catch (error) {
    console.error('Error fetching docs:', error)
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 })
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { jobNo, oldJobNo, mpiNo, mpiRev, docId, formId, formRev } = await request.json()

    if (!jobNo || !mpiNo || !mpiRev || !docId || !formId || !formRev) {
      return NextResponse.json({ 
        error: 'Job number, MPI number, MPI revision, document ID, form ID, and form revision are required' 
      }, { status: 400 })
    }

    // Check if job number or MPI number already exists
    const existingDocs = await Docs.findOne({ 
      $or: [
        { jobNo },
        { mpiNo }
      ]
    })
    if (existingDocs) {
      return NextResponse.json({ 
        error: 'Job number or MPI number already exists' 
      }, { status: 409 })
    }

    const docs = new Docs({
      jobNo,
      oldJobNo: oldJobNo || null,
      mpiNo,
      mpiRev,
      docId,
      formId,
      formRev,
      isActive: true
    })

    await docs.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Docs record created successfully',
      docs: {
        _id: docs._id,
        jobNo: docs.jobNo,
        oldJobNo: docs.oldJobNo,
        mpiNo: docs.mpiNo,
        mpiRev: docs.mpiRev,
        docId: docs.docId,
        formId: docs.formId,
        formRev: docs.formRev,
        isActive: docs.isActive,
        createdAt: docs.createdAt,
        updatedAt: docs.updatedAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating docs record:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Job number or MPI number already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
