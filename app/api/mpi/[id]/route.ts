import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'
import Customer from '@/models/Customer'
import Docs from '@/models/Docs'
import CustomerCompany from '@/models/CustomerCompany'

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
      .populate('customerCompanyId')

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

    console.log('🔄 API: Received update data with sections:', updateData.sections)
    if (updateData.sections) {
      updateData.sections.forEach((section: any, index: number) => {
        console.log(`API Section ${index + 1}:`, section.title, 'Document ID:', section.documentId)
      })
    }

    const mpi = await MPI.findOne({ _id: params.id, engineerId, isActive: true })
    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      )
    }

    // Update MPI
    Object.assign(mpi, updateData)
    
    try {
      await mpi.save()
      console.log('✅ API: MPI saved successfully')
      console.log('Saved sections:', mpi.sections)
    } catch (saveError) {
      console.error('❌ API: Error saving MPI:', saveError)
      return NextResponse.json(
        { error: 'Failed to save MPI: ' + (saveError as Error).message },
        { status: 400 }
      )
    }

    // Update corresponding Docs record if MPI fields changed
    try {
      const docsRecord = await Docs.findOne({ mpiNo: mpi.mpiNumber })
      if (docsRecord) {
        docsRecord.jobNo = mpi.jobNumber
        docsRecord.oldJobNo = mpi.oldJobNumber || null
        docsRecord.mpiNo = mpi.mpiNumber
        docsRecord.mpiRev = mpi.mpiVersion || null
        await docsRecord.save()
        console.log(`✅ Updated Docs record for MPI: ${mpi.mpiNumber}`)
      }
    } catch (docsError) {
      console.error('Error updating Docs record:', docsError)
      // Don't fail the MPI update if Docs update fails
    }

    // Update corresponding Customer record if MPI fields changed
    try {
      const customerRecord = await Customer.findOne({ 
        customerCompanyId: mpi.customerCompanyId,
        assemblyName: mpi.customerAssemblyName,
        engineerId: mpi.engineerId
      })
      if (customerRecord) {
        customerRecord.assemblyName = mpi.customerAssemblyName
        customerRecord.assemblyRev = mpi.assemblyRev
        customerRecord.drawingName = mpi.drawingName
        customerRecord.drawingRev = mpi.drawingRev
        customerRecord.assemblyQuantity = mpi.assemblyQuantity
        customerRecord.kitReceivedDate = mpi.kitReceivedDate
        customerRecord.comments = `MPI: ${mpi.mpiNumber} - Job: ${mpi.jobNumber}`
        await customerRecord.save()
        console.log(`✅ Updated Customer record for MPI: ${mpi.mpiNumber}`)
      }
    } catch (customerError) {
      console.error('Error updating Customer record:', customerError)
      // Don't fail the MPI update if Customer update fails
    }

    const updatedMPI = await MPI.findById(mpi._id)
      .populate('customerCompanyId')

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

    // Delete corresponding Docs record
    try {
      await Docs.findOneAndDelete({ mpiNo: mpi.mpiNumber })
      console.log(`✅ Deleted Docs record for MPI: ${mpi.mpiNumber}`)
    } catch (docsError) {
      console.error('Error deleting Docs record:', docsError)
      // Don't fail the MPI deletion if Docs deletion fails
    }

    // Delete corresponding Customer record
    try {
      await Customer.findOneAndDelete({ 
        customerCompanyId: mpi.customerCompanyId,
        assemblyName: mpi.customerAssemblyName,
        engineerId: mpi.engineerId
      })
      console.log(`✅ Deleted Customer record for MPI: ${mpi.mpiNumber}`)
    } catch (customerError) {
      console.error('Error deleting Customer record:', customerError)
      // Don't fail the MPI deletion if Customer deletion fails
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
