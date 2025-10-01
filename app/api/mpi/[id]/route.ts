import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import CustomerCompany from '@/models/CustomerCompany';
import Docs from '@/models/Docs';
import Form from '@/models/Form';
import MPI from '@/models/MPI';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Ensure models are registered
const models = {
  MPI,
  Customer,
  Docs,
  CustomerCompany,
  Form,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log(
      '🔑 MPI API - Token received:',
      token ? 'Token exists' : 'No token'
    );

    if (!token) {
      console.error('❌ MPI API - No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Validate token format
    if (!token.includes('.')) {
      console.error('❌ MPI API - Invalid token format');
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('✅ MPI API - Token verified, Engineer ID:', decoded.userId);
    } catch (jwtError) {
      console.error('❌ MPI API - JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const engineerId = decoded.userId;
    console.log(
      '🔍 MPI API - Searching for MPI:',
      params.id,
      'by engineer:',
      engineerId
    );

    const mpi = await MPI.findOne({
      _id: params.id,
      engineerId,
      isActive: true,
    })
      .populate('customerCompanyId')
      .populate('formId', 'formId formRev description')
      .populate('engineerId', 'fullName email');

    if (!mpi) {
      console.error('❌ MPI API - MPI not found or access denied');
      console.log(
        '🔍 MPI API - Checked for MPI ID:',
        params.id,
        'Engineer ID:',
        engineerId,
        'isActive: true'
      );

      // Check if MPI exists but belongs to different engineer
      const mpiExists = await MPI.findOne({ _id: params.id });
      if (mpiExists) {
        console.log(
          '🔍 MPI API - MPI exists but belongs to different engineer:',
          mpiExists.engineerId
        );
        return NextResponse.json(
          { error: 'Access denied - MPI belongs to different engineer' },
          { status: 403 }
        );
      } else {
        console.log('🔍 MPI API - MPI does not exist in database');
        return NextResponse.json({ error: 'MPI not found' }, { status: 404 });
      }
    }

    console.log('✅ MPI API - MPI found:', mpi.mpiNumber);
    return NextResponse.json({ mpi });
  } catch (error) {
    console.error('❌ MPI API - Error fetching MPI:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const engineerId = decoded.userId;

    const updateData = await request.json();

    console.log(
      '🔄 API: Received update data with sections:',
      updateData.sections
    );
    if (updateData.sections) {
      updateData.sections.forEach((section: any, index: number) => {
        console.log(
          `API Section ${index + 1}:`,
          section.title,
          'Document ID:',
          section.documentId
        );
      });
    }

    const mpi = await MPI.findOne({
      _id: params.id,
      engineerId,
      isActive: true,
    });
    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      );
    }

    // Update MPI
    Object.assign(mpi, updateData);

    try {
      await mpi.save();
      console.log('✅ API: MPI saved successfully');
      console.log('Saved sections:', mpi.sections);
    } catch (saveError) {
      console.error('❌ API: Error saving MPI:', saveError);
      return NextResponse.json(
        { error: 'Failed to save MPI: ' + (saveError as Error).message },
        { status: 400 }
      );
    }

    // Update corresponding Docs record if MPI fields changed
    try {
      const docsRecord = await Docs.findOne({ mpiNo: mpi.mpiNumber });
      if (docsRecord) {
        docsRecord.jobNo = mpi.jobNumber;
        docsRecord.oldJobNo = mpi.oldJobNumber || undefined;
        docsRecord.mpiNo = mpi.mpiNumber;
        docsRecord.mpiRev = mpi.mpiVersion || undefined;
        await docsRecord.save();
        console.log(`✅ Updated Docs record for MPI: ${mpi.mpiNumber}`);
      }
    } catch (docsError) {
      console.error('Error updating Docs record:', docsError);
      // Don't fail the MPI update if Docs update fails
    }

    // Update corresponding Customer record if MPI fields changed
    try {
      const customerRecord = await Customer.findOne({
        customerCompanyId: mpi.customerCompanyId,
        assemblyName: mpi.customerAssemblyName,
        engineerId: mpi.engineerId,
      });
      if (customerRecord) {
        customerRecord.assemblyName = mpi.customerAssemblyName;
        customerRecord.assemblyRev = mpi.assemblyRev;
        customerRecord.drawingName = mpi.drawingName;
        customerRecord.drawingRev = mpi.drawingRev;
        customerRecord.assemblyQuantity = mpi.assemblyQuantity;
        customerRecord.kitReceivedDate = mpi.kitReceivedDate;
        customerRecord.comments = `MPI: ${mpi.mpiNumber} - Job: ${mpi.jobNumber}`;
        await customerRecord.save();
        console.log(`✅ Updated Customer record for MPI: ${mpi.mpiNumber}`);
      }
    } catch (customerError) {
      console.error('Error updating Customer record:', customerError);
      // Don't fail the MPI update if Customer update fails
    }

    const updatedMPI = await MPI.findById(mpi._id)
      .populate('customerCompanyId')
      .populate('formId', 'formId formRev description')
      .populate('engineerId', 'fullName email');

    return NextResponse.json({
      success: true,
      mpi: updatedMPI,
    });
  } catch (error) {
    console.error('Error updating MPI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const engineerId = decoded.userId;

    const mpi = await MPI.findOne({
      _id: params.id,
      engineerId,
      isActive: true,
    });
    if (!mpi) {
      return NextResponse.json(
        { error: 'MPI not found or access denied' },
        { status: 404 }
      );
    }

    // Delete corresponding Docs record
    try {
      await Docs.findOneAndDelete({ mpiNo: mpi.mpiNumber });
      console.log(`✅ Deleted Docs record for MPI: ${mpi.mpiNumber}`);
    } catch (docsError) {
      console.error('Error deleting Docs record:', docsError);
      // Don't fail the MPI deletion if Docs deletion fails
    }

    // Delete corresponding Customer record
    try {
      await Customer.findOneAndDelete({
        customerCompanyId: mpi.customerCompanyId,
        assemblyName: mpi.customerAssemblyName,
        engineerId: mpi.engineerId,
      });
      console.log(`✅ Deleted Customer record for MPI: ${mpi.mpiNumber}`);
    } catch (customerError) {
      console.error('Error deleting Customer record:', customerError);
      // Don't fail the MPI deletion if Customer deletion fails
    }

    // Hard delete - actually remove from database
    await MPI.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'MPI deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting MPI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
