import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ProcessItems from '@/models/ProcessItems'
import jwt from 'jsonwebtoken'

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete all categories (hard delete for testing)
    const result = await ProcessItems.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} categories`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Error resetting categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}