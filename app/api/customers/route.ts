import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Customer from '@/models/Customer'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const engineerId = decoded.userId

    const customers = await Customer.find({ engineerId, isActive: true })
      .sort({ createdAt: -1 })

    return NextResponse.json({ customers })

  } catch (error) {
    console.error('Error fetching customers:', error)
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

    const {
      customerName,
      assemblyName,
      assemblyRev,
      drawingName,
      drawingRev,
      assemblyQuantity,
      kitReceivedDate,
      kitCompleteDate,
      comments
    } = await request.json()

    if (!customerName || !assemblyName || !assemblyRev || !drawingName || !drawingRev || !assemblyQuantity) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const customer = new Customer({
      customerName,
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
