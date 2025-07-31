import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
    try {
      // Log the incoming request for debugging
      console.log('=== INCOMING REQUEST ===');
      const body = await req.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
      
      // Validate required fields
      if (!body.name) {
        console.error('Validation error: Project name is required');
        return NextResponse.json(
          { error: 'Project name is required' },
          { status: 400 }
        );
      }
  
      // Convert dates to ISO strings
      const startDate = new Date(body.startDate || new Date());
      const endDate = new Date(body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
      const newProject = await prisma.project.create({
        data: {
          name: body.name,
          description: body.description || '',
          status: body.status || 'planning',
          progress: body.progress ? Number(body.progress) : 0,
          startDate: startDate,
          endDate: endDate,
          teamSize: body.teamSize ? Number(body.teamSize) : 1,
        },
      });
  
      console.log('Created project:', newProject);
      return NextResponse.json(newProject, { status: 201 });
    } catch (error: any) {
      // Log the complete error object with all possible details
      console.error('=== START ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error meta:', error.meta);
      console.error('Error stack:', error.stack);
      console.error('Error properties:', Object.getOwnPropertyNames(error));
      
      // Try to get more details from Prisma errors
      if (error instanceof Error) {
        console.error('Error cause:', error.cause);
        if ('clientVersion' in error) {
          console.error('Prisma client version:', error.clientVersion);
        }
      }
      
      console.error('Complete error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error('=== END ERROR ===');
      
      // Return a more detailed error response
      return NextResponse.json(
        { 
          error: 'Failed to create project',
          message: error.message || 'Unknown error occurred',
          // Include additional error details in development
          ...(process.env.NODE_ENV === 'development' && {
            name: error.name,
            code: error.code,
            meta: error.meta,
            stack: error.stack
          })
        },
        { status: 500 }
      );
    }
  }