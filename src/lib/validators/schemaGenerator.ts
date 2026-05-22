import { z } from 'zod';

export interface FieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'boolean' | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  default?: any;
}

export interface AppConfigSchema {
  fields: FieldConfig[];
}

/**
 * Dynamically builds a Zod validation schema for a dynamic record based on its schema configuration.
 * Catches any failures and recovers by returning a permissive schema (allowing any shape) to guarantee the platform never crashes.
 */
export function generateZodSchema(fields: FieldConfig[]): z.ZodObject<any> {
  try {
    const shape: Record<string, z.ZodTypeAny> = {};

    if (!Array.isArray(fields)) {
      return z.object({});
    }

    for (const field of fields) {
      if (!field.name) continue;

      let fieldSchema: z.ZodTypeAny;

      // Compile types
      switch (field.type) {
        case 'number': {
          let numSchema = z.coerce.number({
            message: `${field.label || field.name} must be a number`,
          });
          if (field.min !== undefined && field.min !== null && !isNaN(Number(field.min))) {
            numSchema = numSchema.min(Number(field.min), { message: `${field.label || field.name} must be at least ${field.min}` });
          }
          if (field.max !== undefined && field.max !== null && !isNaN(Number(field.max))) {
            numSchema = numSchema.max(Number(field.max), { message: `${field.label || field.name} must be at most ${field.max}` });
          }
          fieldSchema = numSchema;
          break;
        }

        case 'email': {
          let emailSchema = z.string().email({ message: `Invalid email address format for ${field.label || field.name}` });
          if (field.minLength !== undefined && field.minLength !== null && !isNaN(Number(field.minLength))) {
            emailSchema = emailSchema.min(Number(field.minLength), { message: `${field.label || field.name} must be at least ${field.minLength} characters` });
          }
          if (field.maxLength !== undefined && field.maxLength !== null && !isNaN(Number(field.maxLength))) {
            emailSchema = emailSchema.max(Number(field.maxLength), { message: `${field.label || field.name} must be at most ${field.maxLength} characters` });
          }
          fieldSchema = emailSchema;
          break;
        }

        case 'select': {
          if (Array.isArray(field.options) && field.options.length > 0) {
            // Zod enum requires a non-empty array of strings
            const validOptions = field.options.filter(opt => typeof opt === 'string' && opt.trim() !== '');
            if (validOptions.length > 0) {
              fieldSchema = z.enum(validOptions as [string, ...string[]], {
                message: `Please select a valid option for ${field.label || field.name}`,
              });
            } else {
              fieldSchema = z.string();
            }
          } else {
            fieldSchema = z.string();
          }
          break;
        }

        case 'checkbox':
        case 'boolean': {
          fieldSchema = z.boolean({
            message: `${field.label || field.name} must be yes or no`,
          });
          break;
        }

        case 'text':
        default: {
          let strSchema = z.string();
          if (field.minLength !== undefined && field.minLength !== null && !isNaN(Number(field.minLength))) {
            strSchema = strSchema.min(Number(field.minLength), { message: `${field.label || field.name} must be at least ${field.minLength} characters` });
          }
          if (field.maxLength !== undefined && field.maxLength !== null && !isNaN(Number(field.maxLength))) {
            strSchema = strSchema.max(Number(field.maxLength), { message: `${field.label || field.name} must be at most ${field.maxLength} characters` });
          }
          fieldSchema = strSchema;
          break;
        }
      }

      // Handle optional vs required fields
      if (!field.required) {
        fieldSchema = fieldSchema.optional().nullable().or(z.literal(''));
      } else {
        if (field.type === 'text' || field.type === 'email') {
          fieldSchema = (fieldSchema as z.ZodString).min(1, { message: `${field.label || field.name} is required` });
        }
      }

      // Incorporate fallback default values
      if (field.default !== undefined && field.default !== null) {
        fieldSchema = fieldSchema.default(field.default);
      }

      shape[field.name] = fieldSchema;
    }

    return z.object(shape);
  } catch (error) {
    console.error('CRITICAL: Failed dynamically compiling Zod validator schema. Defaulting to permissive fallback object.', error);
    return z.object({});
  }
}
