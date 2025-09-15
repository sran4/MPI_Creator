import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Docs from '@/models/Docs'
import mongoose from 'mongoose'

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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid docs ID' }, { status: 400 })
    }

    const docs = await Docs.findById(params.id)
    if (!docs) {
      return NextResponse.json({ error: 'Docs record not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
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
    })
  } catch (error) {
    console.error('Error fetching docs record:', error)
    return NextResponse.json({ error: 'Failed to fetch docs record' }, { status: 500 })
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

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid docs ID' }, { status: 400 })
    }

    const { jobNo, oldJobNo, mpiNo, mpiRev, docId, formId, formRev } = await request.json()

    if (!jobNo || !mpiNo || !mpiRev || !docId || !formId || !formRev) {
      return NextResponse.json({ 
        error: 'Job number, MPI number, MPI revision, document ID, form ID, and form revision are required' 
      }, { status: 400 })
    }

    const docs = await Docs.findById(params.id)
    if (!docs) {
      return NextResponse.json({ error: 'Docs record not found' }, { status: 404 })
    }

    // Check if new job number or MPI number already exists (excluding current record)
    const existingDocs = await Docs.findOne({ 
      $and: [
        { _id: { $ne: params.id } },
        { $or: [{ jobNo }, { mpiNo }] }
      ]
    })
    if (existingDocs) {
      return NextResponse.json({ 
        error: 'Job number or MPI number already exists' 
      }, { status: 409 })
    }

    // Update docs record
    docs.jobNo = jobNo
    docs.oldJobNo = oldJobNo || null
    docs.mpiNo = mpiNo
    docs.mpiRev = mpiRev
    docs.docId = docId
    docs.formId = formId
    docs.formRev = formRev
    await docs.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Docs record updated successfully',
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
    })
  } catch (error: any) {
    console.error('Error updating docs record:', error)
    
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid docs ID' }, { status: 400 })
    }

    const docs = await Docs.findById(params.id)
    if (!docs) {
      return NextResponse.json({ error: 'Docs record not found' }, { status: 404 })
    }

    // Soft delete - set isActive to false
    docs.isActive = false
    await docs.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Docs record deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting docs record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
