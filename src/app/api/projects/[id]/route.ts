// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        progress: body.progress,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        teamSize: body.teamSize,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
