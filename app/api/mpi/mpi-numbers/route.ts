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

    // Generate unique MPI number
    let mpiNumber = ''
    let counter = 1
    let isUnique = false

    while (!isUnique) {
      // Format: MPI + 6-digit number with leading zeros
      mpiNumber = `MPI${counter.toString().padStart(6, '0')}`
      
      // Check if this MPI number already exists
      const existingMPI = await MPI.findOne({ mpiNumber })
      if (!existingMPI) {
        isUnique = true
      } else {
        counter++
      }
    }

    return NextResponse.json({
      mpiNumber
    })

  } catch (error) {
    console.error('Error generating MPI number:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
