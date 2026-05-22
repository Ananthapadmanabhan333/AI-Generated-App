export interface FieldDefinition {
  name: string;
  label?: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'boolean' | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[]; // Used for select dropdown items
  default?: any;
}

export interface SchemaDefinition {
  fields: FieldDefinition[];
}

export interface ComponentConfig {
  type: 'form' | 'table' | 'card' | 'dashboard' | 'stats' | 'modal' | 'text' | 'button' | string;
  title?: string;
  collection?: string;
  fields?: FieldDefinition[];
  columns?: { key: string; label: string }[];
  metrics?: { label: string; value: string | number; source?: string }[];
  children?: ComponentConfig[];
  content?: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | string;
}

export interface WorkflowConfig {
  id?: string;
  trigger: string;
  action: string;
  config: Record<string, any>;
}

export interface ApplicationConfig {
  id?: string;
  name: string;
  slug: string;
  config: {
    layout: ComponentConfig;
    schema: SchemaDefinition;
    workflows?: WorkflowConfig[];
  };
  workflows?: WorkflowConfig[];
  createdAt?: string;
  updatedAt?: string;
}
