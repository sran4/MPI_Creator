import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Customer from '@/models/Customer'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Customer API GET request started')
    await dbConnect()
    console.log('✅ Database connected')

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('❌ No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const engineerId = decoded.userId
    console.log(`👤 Engineer ID: ${engineerId}`)

    // First, try to find customers with populate
    let customers
    try {
      customers = await Customer.find({ engineerId, isActive: true })
        .populate('customerCompanyId', 'companyName city state')
        .sort({ createdAt: -1 })
      
      console.log(`Found ${customers.length} customers for engineer ${engineerId}`)
    } catch (populateError: any) {
      console.log('Populate failed, trying without populate:', populateError.message)
      
      // If populate fails, try without it
      customers = await Customer.find({ engineerId, isActive: true })
        .sort({ createdAt: -1 })
      
      console.log(`Found ${customers.length} customers for engineer ${engineerId} (without populate)`)
      
      // Add default customerCompanyId structure for customers without it
      customers = customers.map(customer => {
        if (!customer.customerCompanyId) {
          customer.customerCompanyId = {
            companyName: 'Unknown Company',
            city: 'Unknown',
            state: 'Unknown'
          }
        }
        return customer
      })
    }

    console.log(`✅ Returning ${customers.length} customers`)
    return NextResponse.json({ customers })

  } catch (error: any) {
    console.error('Error fetching customers:', error)
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid engineer ID format' },
        { status: 400 }
      )
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Data validation error' },
        { status: 400 }
      )
    }
    
    // If all else fails, return empty array instead of error
    console.log('⚠️  All customer fetch methods failed, returning empty array')
    return NextResponse.json({ customers: [] })
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

    const {
      customerCompanyId,
      assemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate,
      kitCompleteDate,
      comments
    } = await request.json()

    if (!customerCompanyId || !assemblyName || !assemblyRev || !drawingName || !drawingRev || !assemblyQuantity) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const customer = new Customer({
      customerCompanyId,
      assemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate: new Date(kitReceivedDate),
      kitCompleteDate: new Date(kitCompleteDate),
      comments,
      engineerId
    })

    await customer.save()

    return NextResponse.json({
      success: true,
      customer
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating customer:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Customer with this assembly already exists for you' },
        { status: 409 }
      )
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
