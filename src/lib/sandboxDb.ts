/**
 * TalentOS Resilient Sandbox Database Fallback
 * Provides pre-seeded metadata structures and mock dynamic tables to ensure the platform
 * remains active and testable in headless / unconfigured database environments.
 */

export interface SandboxConfig {
  id: string;
  name: string;
  slug: string;
  userId: string;
  config: any;
  workflows: any[];
  createdAt: string;
  updatedAt: string;
}

export interface SandboxDb {
  configs: SandboxConfig[];
  records: Record<string, any[]>;
  workflowLogs: any[];
}

const getGlobalSandboxDb = (): SandboxDb => {
  const g = globalThis as any;
  if (!g.sandboxDb) {
    g.sandboxDb = {
      configs: [
        {
          id: 'preset-student-id',
          name: 'Student Hub Manager',
          slug: 'students',
          userId: 'sandbox-user-id',
          config: {
            layout: {
              type: 'dashboard',
              children: [
                {
                  type: 'stats',
                  title: 'Roster Metrics',
                  metrics: [
                    { label: 'Total Enrolled', value: 'count', source: 'students' },
                    { label: 'Platform Classrooms', value: 'const', source: 8 },
                  ],
                },
                {
                  type: 'card',
                  title: 'Student Registration Form',
                  children: [
                    {
                      type: 'form',
                      collection: 'students',
                      title: 'Enter Student Details',
                      fields: [
                        { name: 'studentName', label: 'Student Name', type: 'text', required: true, minLength: 2 },
                        { name: 'email', label: 'Academic Email', type: 'email', required: true },
                        { name: 'age', label: 'Age Check', type: 'number', required: false, min: 16, max: 80 },
                        { name: 'status', label: 'Enrollment Status', type: 'select', required: true, options: ['Active', 'On Leave', 'Graduated'], default: 'Active' },
                      ],
                    },
                  ],
                },
                {
                  type: 'card',
                  title: 'All Active Records',
                  children: [
                    {
                      type: 'table',
                      collection: 'students',
                      title: 'Registered Student Roster',
                      columns: [
                        { key: 'studentName', label: 'Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'age', label: 'Age' },
                        { key: 'status', label: 'Status' },
                      ],
                    },
                  ],
                },
              ],
            },
            schema: {
              fields: [
                { name: 'studentName', type: 'text', required: true, minLength: 2 },
                { name: 'email', type: 'email', required: true },
                { name: 'age', type: 'number', required: false, min: 16, max: 80 },
                { name: 'status', type: 'select', required: true, options: ['Active', 'On Leave', 'Graduated'], default: 'Active' },
              ],
            },
          },
          workflows: [
            {
              id: 'wf-stu-1',
              trigger: 'form_submit',
              action: 'notification',
              config: { message: 'Alert: Student {{studentName}} successfully added to sandbox!' },
            },
            {
              id: 'wf-stu-2',
              trigger: 'form_submit',
              action: 'log',
              config: { format: 'JSON' },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'preset-employee-id',
          name: 'HR Employee Hub',
          slug: 'employees',
          userId: 'sandbox-user-id',
          config: {
            layout: {
              type: 'dashboard',
              children: [
                {
                  type: 'stats',
                  title: 'Staffing Status',
                  metrics: [
                    { label: 'Active Roster Count', value: 'count', source: 'employees' },
                    { label: 'Workplace Locations', value: 'const', source: 3 },
                  ],
                },
                {
                  type: 'card',
                  title: 'Staff Onboarding Portal',
                  children: [
                    {
                      type: 'form',
                      collection: 'employees',
                      title: 'Onboard Employee',
                      fields: [
                        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true, minLength: 3 },
                        { name: 'email', label: 'Corporate Email', type: 'email', required: true },
                        { name: 'department', label: 'Department Segment', type: 'select', required: true, options: ['Engineering', 'Marketing', 'Product', 'Human Resources'], default: 'Engineering' },
                        { name: 'salary', label: 'Annual Compensation ($)', type: 'number', required: true, min: 30000, max: 250000 },
                      ],
                    },
                  ],
                },
                {
                  type: 'card',
                  title: 'Directory Records',
                  children: [
                    {
                      type: 'table',
                      collection: 'employees',
                      title: 'Corporate Employee Directory',
                      columns: [
                        { key: 'employeeName', label: 'Employee Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'department', label: 'Department' },
                        { key: 'salary', label: 'Annual Salary ($)' },
                      ],
                    },
                  ],
                },
              ],
            },
            schema: {
              fields: [
                { name: 'employeeName', type: 'text', required: true, minLength: 3 },
                { name: 'email', type: 'email', required: true },
                { name: 'department', type: 'select', required: true, options: ['Engineering', 'Marketing', 'Product', 'Human Resources'], default: 'Engineering' },
                { name: 'salary', type: 'number', required: true, min: 30000, max: 250000 },
              ],
            },
          },
          workflows: [
            {
              id: 'wf-emp-1',
              trigger: 'form_submit',
              action: 'notification',
              config: { message: 'Alert: Onboarded employee {{employeeName}} under {{department}} department!' },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'preset-project-id',
          name: 'Dynamic Task Planner',
          slug: 'projects',
          userId: 'sandbox-user-id',
          config: {
            layout: {
              type: 'dashboard',
              children: [
                {
                  type: 'stats',
                  title: 'Operational Metrics',
                  metrics: [
                    { label: 'Active Plan Tasks', value: 'count', source: 'projects' },
                    { label: 'Platform Backlogs', value: 'const', source: 12 },
                  ],
                },
                {
                  type: 'card',
                  title: 'New Task Creator',
                  children: [
                    {
                      type: 'form',
                      collection: 'projects',
                      title: 'Add Backlog Item',
                      fields: [
                        { name: 'taskName', label: 'Backlog Item Title', type: 'text', required: true, minLength: 4 },
                        { name: 'priority', label: 'Severity Level', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
                        { name: 'estimatedDays', label: 'Effort Estimate (Days)', type: 'number', required: false, min: 1, max: 90 },
                      ],
                    },
                  ],
                },
                {
                  type: 'card',
                  title: 'Project Roadmap Backlogs',
                  children: [
                    {
                      type: 'table',
                      collection: 'projects',
                      title: 'Roadmap Tasks List',
                      columns: [
                        { key: 'taskName', label: 'Task Title' },
                        { key: 'priority', label: 'Priority' },
                        { key: 'estimatedDays', label: 'Days Mapped' },
                      ],
                    },
                  ],
                },
              ],
            },
            schema: {
              fields: [
                { name: 'taskName', type: 'text', required: true, minLength: 4 },
                { name: 'priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
                { name: 'estimatedDays', type: 'number', required: false, min: 1, max: 90 },
              ],
            },
          },
          workflows: [
            {
              id: 'wf-proj-1',
              trigger: 'form_submit',
              action: 'notification',
              config: { message: 'Alert: Dynamic roadmap task "{{taskName}}" registered!' },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      records: {
        students: [
          { id: 'rec-stu-1', studentName: 'Alice Vance', email: 'alice@talentos.dev', age: 21, status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'rec-stu-2', studentName: 'Bob Sterling', email: 'bob@talentos.dev', age: 24, status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        employees: [
          { id: 'rec-emp-1', employeeName: 'Sarah Jenkins', email: 'sarah.j@talentos.dev', department: 'Engineering', salary: 125000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        projects: [
          { id: 'rec-proj-1', taskName: 'Integrate Neon Schema Sync', priority: 'Critical', estimatedDays: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      },
      workflowLogs: [
        {
          id: 'log-1',
          workflowId: 'wf-stu-1',
          trigger: 'form_submit',
          action: 'notification',
          status: 'SUCCESS',
          message: 'Notification sent successfully!',
          payload: { studentName: 'Alice Vance' },
          createdAt: new Date().toISOString(),
        }
      ]
    };
  }
  return g.sandboxDb;
};

export const sandboxDb = getGlobalSandboxDb();
export default sandboxDb;
