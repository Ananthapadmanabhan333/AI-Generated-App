import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sandboxDb } from '@/lib/sandboxDb';

/**
 * GET: Retrieve recent system execution history
 */
export async function GET(_request: NextRequest) {
  try {
    let logs;
    try {
      logs = await prisma.workflowLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (dbError: any) {
      console.warn('PostgreSQL database offline or unconfigured. Pulling workflow logs from Sandbox Memory.', dbError.message || dbError);
      logs = sandboxDb.workflowLogs;
    }
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed retrieving execution trace logs', details: error.message },
      { status: 500 }
    );
  }
}
