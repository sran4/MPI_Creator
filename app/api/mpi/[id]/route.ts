import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'
import Customer from '@/models/Customer'

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
    const engineerId = decoded.userId

    const mpi = await MPI.findOne({ _id: params.id, engineerId, isActive: true })
      .populate('customerId')

    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ mpi })

  } catch (error) {
    console.error('Error fetching MPI:', error)
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
    const engineerId = decoded.userId

    const updateData = await request.json()

    const mpi = await MPI.findOne({ _id: params.id, engineerId, isActive: true })
    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      )
    }

    // Update MPI
    Object.assign(mpi, updateData)
    await mpi.save()

    const updatedMPI = await MPI.findById(mpi._id)
      .populate('customerId')

    return NextResponse.json({
      success: true,
      mpi: updatedMPI
    })

  } catch (error) {
    console.error('Error updating MPI:', error)
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
    const engineerId = decoded.userId

    const mpi = await MPI.findOne({ _id: params.id, engineerId, isActive: true })
    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      )
    }

    // Hard delete - actually remove from database
    await MPI.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'MPI deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting MPI:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
