import { prisma } from '@/lib/prisma';

export interface WorkflowActionConfig {
  message?: string;
  url?: string;
  format?: string;
}

export interface WorkflowRule {
  trigger: string;
  action: string;
  config: WorkflowActionConfig;
}

/**
 * Interpolates string variables wrapped in double curly braces (e.g. {{studentName}})
 * using properties present in a dynamic payload block.
 */
function interpolateTemplate(template: string, data: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * Automates system workflows asynchronously without blocking primary CRUD performance.
 * Never throws exceptions, containing logs for debugging directly within PostgreSQL telemetry.
 */
export async function executeWorkflows(
  appConfigId: string,
  trigger: 'form_submit',
  recordData: Record<string, any>
) {
  try {
    const appConfig = await prisma.appConfig.findUnique({
      where: { id: appConfigId },
      include: { workflows: true },
    });

    if (!appConfig) {
      console.warn(`Workflow execution skipped: AppConfig ID "${appConfigId}" not found.`);
      return;
    }

    const matchedWorkflows = appConfig.workflows.filter(
      (w) => w.trigger === trigger
    );

    for (const workflow of matchedWorkflows) {
      const config = (workflow.config as unknown as WorkflowActionConfig) || {};
      let status = 'SUCCESS';
      let executionMsg = '';

      try {
        switch (workflow.action) {
          case 'notification': {
            const messageTemplate = config.message || 'Notification triggered for action.';
            const interpolated = interpolateTemplate(messageTemplate, recordData);
            executionMsg = `Alert: "${interpolated}"`;
            break;
          }

          case 'log': {
            executionMsg = `Captured transaction item: ${JSON.stringify(recordData)}`;
            break;
          }

          case 'webhook': {
            const endpoint = config.url || 'https://api.talentos.dev/webhook-receiver';
            executionMsg = `Simulated webhook dispatch containing payload successfully delivered to endpoint ${endpoint}`;
            break;
          }

          default: {
            status = 'FAILED';
            executionMsg = `Unknown automation action type requested: "${workflow.action}"`;
            break;
          }
        }
      } catch (err: any) {
        status = 'FAILED';
        executionMsg = `Action failed: ${err?.message || String(err)}`;
      }

      // Log execution trace inside PostgreSQL
      await prisma.workflowLog.create({
        data: {
          workflowId: workflow.id,
          trigger: workflow.trigger,
          action: workflow.action,
          status,
          message: executionMsg,
          payload: recordData as any,
        },
      });
    }
  } catch (error) {
    console.error('CRITICAL: Workflow Engine encountered background runtime execution error:', error);
  }
}
