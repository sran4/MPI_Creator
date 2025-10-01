import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import MPI from '@/models/MPI'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const engineerId = decoded.userId

    console.log('🔍 MPI Numbers API - Engineer ID:', engineerId)

    // Generate unique MPI number
    let mpiNumber = ''
    let counter = 1
    let isUnique = false

    while (!isUnique) {
      // Format: MPI- + 6-digit number with leading zeros
      mpiNumber = `MPI-${counter.toString().padStart(6, '0')}`
      
      console.log(`🔍 Checking MPI number: ${mpiNumber}`)
      
      // Check if this MPI number already exists
      const existingMPI = await MPI.findOne({ mpiNumber })
      console.log(`🔍 Existing MPI found:`, existingMPI ? 'YES' : 'NO')
      
      if (!existingMPI) {
        isUnique = true
        console.log(`✅ Unique MPI number found: ${mpiNumber}`)
      } else {
        counter++
        console.log(`❌ MPI number ${mpiNumber} exists, trying ${counter}`)
      }
    }

    console.log(`🎯 Final MPI number: ${mpiNumber}`)

    return NextResponse.json({
      mpiNumber
    })

  } catch (error: any) {
    console.error('Error generating MPI number:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
