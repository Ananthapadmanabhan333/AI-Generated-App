import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sandboxDb } from '@/lib/sandboxDb';

/**
 * Robust session helper mapping admin and sandbox contexts.
 */
async function getUserOrSandboxId(): Promise<string> {
  try {
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
  } catch (error) {
    console.warn('Database connection unavailable in getUserOrSandboxId, defaulting to sandbox-user-id:', error);
  }
  return 'sandbox-user-id';
}

/**
 * GET: Fetch all user application configurations
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = await getUserOrSandboxId();
    let configs;
    let sandboxMode = false;
    try {
      configs = await prisma.appConfig.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { workflows: true },
      });
    } catch (dbError: any) {
      console.warn('PostgreSQL database offline or unconfigured. Engaging Sandbox Mode configs retrieval.', dbError.message || dbError);
      configs = sandboxDb.configs;
      sandboxMode = true;
    }
    return NextResponse.json({ success: true, data: configs, sandboxMode });
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
    let saved;
    let sandboxMode = false;

    try {
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
      saved = await prisma.appConfig.findUnique({
        where: { id: appConfig.id },
        include: { workflows: true },
      });
    } catch (dbError: any) {
      console.warn('PostgreSQL database offline or unconfigured. Saving config inside Sandbox Memory Store.', dbError.message || dbError);
      sandboxMode = true;
      
      const existingIndex = sandboxDb.configs.findIndex((c) => c.slug === cleanSlug);
      const mockConfigId = existingIndex !== -1 ? sandboxDb.configs[existingIndex].id : 'mock-config-' + Math.random().toString(36).substr(2, 9);
      
      const mockConfigObj: any = {
        id: mockConfigId,
        name,
        slug: cleanSlug,
        userId: 'sandbox-user-id',
        config: config,
        workflows: Array.isArray(workflows) ? workflows.map((w, idx) => ({
          id: `mock-wf-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          appConfigId: mockConfigId,
          trigger: w.trigger,
          action: w.action,
          config: w.config || {},
        })) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        sandboxDb.configs[existingIndex] = mockConfigObj;
      } else {
        sandboxDb.configs.unshift(mockConfigObj);
      }
      
      saved = mockConfigObj;
    }

    return NextResponse.json({ success: true, data: saved, sandboxMode });
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

    try {
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
    } catch (dbError: any) {
      console.warn('PostgreSQL database offline or unconfigured. Deleting config inside Sandbox Memory Store.', dbError.message || dbError);
      
      const existingIndex = sandboxDb.configs.findIndex((c) => c.id === configId);
      if (existingIndex !== -1) {
        sandboxDb.configs.splice(existingIndex, 1);
      } else {
        return NextResponse.json(
          { success: false, error: `App configuration ID "${configId}" not found in Sandbox` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Configuration and associated workflows successfully purged' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed deleting configuration', details: error.message },
      { status: 500 }
    );
  }
}
