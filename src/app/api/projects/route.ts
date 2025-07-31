import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
    try {
      // Initialize Prisma client explicitly
      await prisma.$connect();
      
      const body = await req.json();
      console.log('Received data:', body);
      
      // Validate required fields
      if (!body.name) {
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
      console.error('Detailed error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create project',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }
  