import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import DocumentId from '@/models/DocumentId'

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
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const documentId = await DocumentId.findById(params.id)

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID not found' }, { status: 404 })
    }

    return NextResponse.json({ documentId })

  } catch (error) {
    console.error('Error fetching document ID:', error)
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

    const documentId = await DocumentId.findById(params.id)

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID not found' }, { status: 404 })
    }

    // Check if another document ID with same name exists (excluding current one)
    const existingDocumentId = await DocumentId.findOne({ 
      _id: { $ne: params.id },
      docId: { $regex: new RegExp(`^${docId}$`, 'i') }
    })

    if (existingDocumentId) {
      return NextResponse.json(
        { error: 'Document ID already exists' },
        { status: 409 }
      )
    }

    documentId.docId = docId
    documentId.description = description || ''

    await documentId.save()

    return NextResponse.json({
      success: true,
      documentId: documentId.toObject()
    })

  } catch (error: any) {
    console.error('Error updating document ID:', error)
    
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
    if (decoded.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const documentId = await DocumentId.findById(params.id)

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID not found' }, { status: 404 })
    }

    // Soft delete
    documentId.isActive = false
    await documentId.save()

    return NextResponse.json({
      success: true,
      message: 'Document ID deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting document ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
