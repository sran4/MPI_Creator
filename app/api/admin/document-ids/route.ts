import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import DocumentId from '@/models/DocumentId'

export async function GET(request: NextRequest) {
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

    const documentIds = await DocumentId.find({ isActive: true })
      .sort({ docId: 1 })

    return NextResponse.json({ documentIds })

  } catch (error: any) {
    console.error('Error fetching document IDs:', error)
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
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { docId, description } = await request.json()

    if (!docId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Check if document ID already exists
    const existingDocumentId = await DocumentId.findOne({ 
      docId: { $regex: new RegExp(`^${docId}$`, 'i') }
    })

    if (existingDocumentId) {
      return NextResponse.json(
        { error: 'Document ID already exists' },
        { status: 409 }
      )
    }

    const documentId = new DocumentId({
      docId,
      description: description || '',
    })

    await documentId.save()

    return NextResponse.json({
      success: true,
      documentId: documentId.toObject()
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating document ID:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Document ID already exists' },
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
