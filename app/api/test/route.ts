import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Form from '@/models/Form'
import CustomerCompany from '@/models/CustomerCompany'

export async function GET() {
  try {
    console.log('🧪 Test API called')
    await dbConnect()
    console.log('✅ Database connected')
    
    // Test Forms
    const forms = await Form.find({ isActive: true })
    console.log('📋 Forms found:', forms.length)
    
    // Test Customer Companies
    const companies = await CustomerCompany.find({ isActive: true })
    console.log('🏢 Companies found:', companies.length)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        formsCount: forms.length,
        companiesCount: companies.length,
        forms: forms.map(f => ({ id: f._id, formId: f.formId, formRev: f.formRev })),
        companies: companies.map(c => ({ id: c._id, name: c.companyName, city: c.city, state: c.state }))
      }
    })
  } catch (error: any) {
    console.error('❌ Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
