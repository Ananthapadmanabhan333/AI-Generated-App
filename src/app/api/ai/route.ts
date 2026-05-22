import { NextRequest, NextResponse } from 'next/server';

// Fallback dynamic templates mapping
const templates: Record<string, any> = {
  student: {
    name: 'Student Hub Manager',
    slug: 'students',
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
        trigger: 'form_submit',
        action: 'notification',
        config: { message: 'Alert: Student {{studentName}} successfully added to database!' },
      },
      {
        trigger: 'form_submit',
        action: 'log',
        config: { format: 'JSON' },
      },
    ],
  },
  employee: {
    name: 'HR Employee Hub',
    slug: 'employees',
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
        trigger: 'form_submit',
        action: 'notification',
        config: { message: 'Alert: Onboarded employee {{employeeName}} under {{department}} department!' },
      },
    ],
  },
  project: {
    name: 'Dynamic Task Planner',
    slug: 'projects',
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
        trigger: 'form_submit',
        action: 'notification',
        config: { message: 'Alert: Dynamic roadmap task "{{taskName}}" registered!' },
      },
      {
        trigger: 'form_submit',
        action: 'webhook',
        config: { url: 'https://api.talentos.dev/tasks/webhook' },
      },
    ],
  },
};

/**
 * POST: AI prompts parser generating declarative JSON application layouts
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Mandatory field "prompt" is missing.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      // Execute OpenAI API Chat Completion if active
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `You are an AI metadata model compiler that exports declarative JSON app definitions. 
                You must output a strictly valid JSON object matching this TypeScript structure:
                {
                  "name": "User-Friendly Title",
                  "slug": "lowercase-plural-collection-slug",
                  "config": {
                    "layout": {
                      "type": "dashboard",
                      "children": [
                        { "type": "stats", "title": "Widget KPI Title", "metrics": [{ "label": "Metrics Name", "value": "count", "source": "collection-slug" }] },
                        { "type": "card", "title": "Box Title", "children": [{ "type": "form", "collection": "collection-slug", "title": "Form Name", "fields": [{ "name": "fieldKey", "label": "User Field Name", "type": "text|number|email|select|checkbox", "required": true }] }] }
                      ]
                    },
                    "schema": {
                      "fields": [
                        { "name": "fieldKey", "type": "text|number|email|select|checkbox", "required": true, "options": ["Option1", "Option2"] }
                      ]
                    }
                  },
                  "workflows": [
                    { "trigger": "form_submit", "action": "notification", "config": { "message": "Alert message with {{fieldKey}}" } }
                  ]
                }
                Make the app fully rich, styled beautifully, and aligned. Avoid static placeholders, customize layout nodes to fit the user's specific prompt theme.`,
              },
              {
                role: 'user',
                content: `Compile a declarative application for: "${prompt}"`,
              },
            ],
          }),
        });

        const data = await res.json();
        const jsonText = data.choices[0]?.message?.content;
        
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return NextResponse.json({ success: true, data: parsed });
        }
      } catch (openAiError: any) {
        console.warn('OpenAI API request failed, engaging local heuristic template fallback:', openAiError?.message);
      }
    }

    // Heuristics Matching Fallback (Saves API Key dependencies for local sandboxes)
    const normalized = prompt.toLowerCase();
    let template = templates.student; // Default Roster Template

    if (normalized.includes('employee') || normalized.includes('staff') || normalized.includes('hr') || normalized.includes('onboard')) {
      template = templates.employee;
    } else if (normalized.includes('project') || normalized.includes('task') || normalized.includes('backlog') || normalized.includes('todo')) {
      template = templates.project;
    }

    // Emulate background delay to show visual loaders
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'AI Generator failed parsing prompt', details: error?.message },
      { status: 500 }
    );
  }
}
