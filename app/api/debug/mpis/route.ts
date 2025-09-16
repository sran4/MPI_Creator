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

    console.log('🔍 DEBUG: Engineer ID from token:', engineerId)
    console.log('🔍 DEBUG: Token decoded:', decoded)

    // Get all MPIs without any filters first
    const allMPIs = await MPI.find({})
    console.log('🔍 DEBUG: Total MPIs in database:', allMPIs.length)
    
    // Get MPIs for this engineer without isActive filter
    const mpisForEngineer = await MPI.find({ engineerId })
    console.log('🔍 DEBUG: MPIs for engineer (no isActive filter):', mpisForEngineer.length)
    
    // Get MPIs for this engineer with isActive filter
    const mpisForEngineerActive = await MPI.find({ engineerId, isActive: true })
    console.log('🔍 DEBUG: MPIs for engineer (with isActive filter):', mpisForEngineerActive.length)

    // Get MPIs with isActive filter only
    const activeMPIs = await MPI.find({ isActive: true })
    console.log('🔍 DEBUG: All active MPIs:', activeMPIs.length)

    // Sample some MPIs to see their structure
    const sampleMPIs = allMPIs.slice(0, 3).map(mpi => ({
      _id: mpi._id,
      mpiNumber: mpi.mpiNumber,
      engineerId: mpi.engineerId,
      isActive: mpi.isActive,
      status: mpi.status,
      createdAt: mpi.createdAt
    }))

    return NextResponse.json({
      debug: {
        engineerId,
        totalMPIs: allMPIs.length,
        mpisForEngineer: mpisForEngineer.length,
        mpisForEngineerActive: mpisForEngineerActive.length,
        activeMPIs: activeMPIs.length,
        sampleMPIs
      }
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
