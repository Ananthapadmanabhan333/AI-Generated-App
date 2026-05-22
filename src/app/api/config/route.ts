import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Robust session helper mapping admin and sandbox contexts.
 */
async function getUserOrSandboxId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).id) {
    return (session.user as any).id;
  }
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@talentos.dev' },
  });
  if (admin) return admin.id;
  const fallback = await prisma.user.findFirst();
  if (fallback) return fallback.id;
  return 'sandbox-user-id';
}

/**
 * GET: Fetch all user application configurations
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = await getUserOrSandboxId();
    const configs = await prisma.appConfig.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { workflows: true },
    });
    return NextResponse.json({ success: true, data: configs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed retrieving configurations', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Save or overwrite an application configuration and associated workflows
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserOrSandboxId();
    const { name, slug, config, workflows } = await request.json();

    if (!name || !slug || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: name, slug, or config JSON' },
        { status: 400 }
      );
    }

    // Ensure slug is lowercase URL-friendly
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');

    const existing = await prisma.appConfig.findFirst({
      where: { slug: cleanSlug, userId },
    });

    let appConfig;

    if (existing) {
      // Update config
      appConfig = await prisma.appConfig.update({
        where: { id: existing.id },
        data: {
          name,
          config: config,
        },
      });

      // Erase old workflows
      await prisma.workflow.deleteMany({
        where: { appConfigId: existing.id },
      });

      // Bind new workflows
      if (Array.isArray(workflows)) {
        for (const wf of workflows) {
          if (!wf.trigger || !wf.action) continue;
          await prisma.workflow.create({
            data: {
              appConfigId: existing.id,
              trigger: wf.trigger,
              action: wf.action,
              config: wf.config || {},
            },
          });
        }
      }
    } else {
      // Create new config
      appConfig = await prisma.appConfig.create({
        data: {
          name,
          slug: cleanSlug,
          config: config,
          userId,
        },
      });

      // Bind workflows
      if (Array.isArray(workflows)) {
        for (const wf of workflows) {
          if (!wf.trigger || !wf.action) continue;
          await prisma.workflow.create({
            data: {
              appConfigId: appConfig.id,
              trigger: wf.trigger,
              action: wf.action,
              config: wf.config || {},
            },
          });
        }
      }
    }

    // Retrieve final structure with workflows loaded
    const saved = await prisma.appConfig.findUnique({
      where: { id: appConfig.id },
      include: { workflows: true },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed saving configuration', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a config
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserOrSandboxId();
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { success: false, error: 'App configuration ID parameter is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.appConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `App configuration not found` },
        { status: 404 }
      );
    }

    await prisma.appConfig.delete({
      where: { id: configId },
    });

    return NextResponse.json({ success: true, message: 'Configuration and associated workflows successfully purged' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed deleting configuration', details: error.message },
      { status: 500 }
    );
  }
}
