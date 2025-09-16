import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const engineerId = decoded.userId

    // Get all job numbers for the engineer
    const mpis = await MPI.find({ engineerId, isActive: true })
      .select('jobNumber oldJobNumber')
      .sort({ createdAt: -1 })

    const jobNumbers = mpis.map(mpi => mpi.jobNumber).filter(Boolean)
    const oldJobNumbers = mpis.map(mpi => mpi.oldJobNumber).filter(Boolean)

    return NextResponse.json({
      jobNumbers,
      oldJobNumbers: [...new Set(oldJobNumbers)] // Remove duplicates
    })

  } catch (error) {
    console.error('Error fetching job numbers:', error)
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

    console.log('🔍 Job Numbers API - Engineer ID:', engineerId)

    // Generate unique job number starting with "U"
    let jobNumber = ''
    let counter = 1
    let isUnique = false

    while (!isUnique) {
      // Format: U + 6-digit number with leading zeros
      jobNumber = `U${counter.toString().padStart(6, '0')}`
      
      console.log(`🔍 Checking job number: ${jobNumber}`)
      
      // Check if this job number already exists
      const existingMPI = await MPI.findOne({ jobNumber })
      console.log(`🔍 Existing job number found:`, existingMPI ? 'YES' : 'NO')
      
      if (!existingMPI) {
        isUnique = true
        console.log(`✅ Unique job number found: ${jobNumber}`)
      } else {
        counter++
        console.log(`❌ Job number ${jobNumber} exists, trying ${counter}`)
      }
    }

    console.log(`🎯 Final job number: ${jobNumber}`)

    return NextResponse.json({
      jobNumber
    })

  } catch (error) {
    console.error('Error generating job number:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
