import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Form from '@/models/Form'

export async function GET() {
  try {
    await dbConnect()
    const forms = await Form.find({ isActive: true }).sort({ formId: 1 })
    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { formId, formRev, description } = await request.json()
    
    const form = new Form({
      formId,
      formRev,
      description,
      isActive: true
    })
    
    await form.save()
    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
