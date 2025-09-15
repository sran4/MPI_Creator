import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import CustomerCompany from '@/models/CustomerCompany'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.userType !== 'engineer' && decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const customerCompanies = await CustomerCompany.find({ isActive: true })
      .sort({ companyName: 1 })
      .select('companyName city state')

    return NextResponse.json({ customerCompanies })

  } catch (error) {
    console.error('Error fetching customer companies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
