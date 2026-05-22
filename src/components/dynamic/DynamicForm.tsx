import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store/useAppStore';
import { generateZodSchema, FieldConfig } from '@/lib/validators/schemaGenerator';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface DynamicFormProps {
  title?: string;
  collection: string;
  fields: FieldConfig[];
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  title = 'Register Details',
  collection,
  fields = [],
}) => {
  const { addRecord } = useAppStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Compile Zod schema dynamically
  const zodSchema = generateZodSchema(fields);

  // Extract initial default values
  const defaultValues = fields.reduce((acc, f) => {
    if (f.default !== undefined) {
      acc[f.name] = f.default;
    } else {
      acc[f.name] = f.type === 'checkbox' || f.type === 'boolean' ? false : '';
    }
    return acc;
  }, {} as Record<string, any>);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const onSubmit = async (data: any) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Cast fields to proper types before saving (e.g. coerce numbers)
      const sanitized: Record<string, any> = {};
      fields.forEach((field) => {
        const val = data[field.name];
        if (field.type === 'number' && val !== '' && val !== undefined && val !== null) {
          sanitized[field.name] = Number(val);
        } else if ((field.type === 'checkbox' || field.type === 'boolean') && typeof val !== 'boolean') {
          sanitized[field.name] = Boolean(val);
        } else {
          sanitized[field.name] = val;
        }
      });

      await addRecord(collection, sanitized);
      setSubmitSuccess(true);
      reset(defaultValues);
      
      // Auto fade-out success message
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      let friendlyMsg = 'An unexpected error occurred during saving.';
      try {
        const parsed = JSON.parse(err.message);
        // If it is a mapping of Zod issues
        if (typeof parsed === 'object') {
          friendlyMsg = Object.entries(parsed)
            .map(([field, msgs]: any) => `${field}: ${msgs.join(', ')}`)
            .join(' | ');
        }
      } catch {
        friendlyMsg = err.message || friendlyMsg;
      }
      setSubmitError(friendlyMsg);
    }
  };

  if (!collection) {
    return (
      <div className="p-4 border border-rose-500/30 rounded-xl bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-rose-400" />
        <span>Failed rendering form: &quot;collection&quot; parameter is missing from configuration nodes.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl backdrop-blur-md">
      <h3 className="text-base font-semibold text-white tracking-wide border-b border-zinc-800 pb-3 mb-5">
        {title}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitSuccess && (
          <div className="p-4 border border-emerald-500/20 rounded-lg bg-emerald-500/5 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Record created successfully! Workflows matching &quot;form_submit&quot; triggered.</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 border border-rose-500/20 rounded-lg bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono">{submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-zinc-500">
              No fields configured for this form view.
            </div>
          ) : (
            fields.map((field) => {
              if (!field.name) return null;
              const inputId = `form-field-${collection}-${field.name}`;

              return (
                <div key={field.name} className="space-y-1.5 col-span-1">
                  <label htmlFor={inputId} className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center">
                    {field.label || field.name}
                    {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      id={inputId}
                      {...register(field.name)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Choose Option --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' || field.type === 'boolean' ? (
                    <div className="flex items-center space-x-3 py-2">
                      <input
                        id={inputId}
                        type="checkbox"
                        {...register(field.name)}
                        className="w-4 h-4 border border-zinc-800 rounded bg-zinc-900 focus:ring-indigo-500/50 text-indigo-600 transition cursor-pointer"
                      />
                      <span className="text-xs text-zinc-400 select-none cursor-pointer" onClick={() => {
                        const el = document.getElementById(inputId);
                        if (el) el.click();
                      }}>
                        Enable status toggle or confirmation
                      </span>
                    </div>
                  ) : (
                    <input
                      id={inputId}
                      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                      step={field.type === 'number' ? 'any' : undefined}
                      placeholder={`Enter ${field.label?.toLowerCase() || field.name}...`}
                      {...register(field.name)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-zinc-600"
                    />
                  )}

                  {errors[field.name] && (
                    <p className="text-[10px] text-rose-400 font-medium tracking-wide flex items-center">
                      <AlertCircle className="w-3 h-3 text-rose-400 mr-1 shrink-0" />
                      {String(errors[field.name]?.message)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-zinc-800/50 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-semibold text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to {collection}...</span>
              </>
            ) : (
              <span>Add Record</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
