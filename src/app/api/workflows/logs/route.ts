import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET: Retrieve recent system execution history
 */
export async function GET(_request: NextRequest) {
  try {
    const logs = await prisma.workflowLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed retrieving execution trace logs', details: error.message },
      { status: 500 }
    );
  }
}
