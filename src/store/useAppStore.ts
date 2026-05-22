import { create } from 'zustand';
import { ApplicationConfig, ComponentConfig } from '@/types';

interface AppStore {
  configs: ApplicationConfig[];
  activeConfig: ApplicationConfig | null;
  previewData: Record<string, any[]>;
  workflowLogs: any[];
  isLoading: boolean;
  error: string | null;

  fetchConfigs: () => Promise<void>;
  saveConfig: (
    name: string,
    slug: string,
    layout: ComponentConfig,
    schemaFields: any[],
    workflows: any[]
  ) => Promise<any>;
  deleteConfig: (id: string) => Promise<boolean>;
  setActiveConfig: (config: ApplicationConfig | null) => void;
  fetchCollectionData: (collection: string) => Promise<void>;
  addRecord: (collection: string, data: any) => Promise<boolean>;
  deleteRecord: (collection: string, id: string) => Promise<boolean>;
  fetchWorkflowLogs: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  configs: [],
  activeConfig: null,
  previewData: {},
  workflowLogs: [],
  isLoading: false,
  error: null,

  fetchConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        set({ configs: data.data });
      } else {
        set({ error: data.error || 'Failed to load configurations' });
      }
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load configurations' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveConfig: async (name, slug, layout, schemaFields, workflows) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        name,
        slug,
        config: {
          layout,
          schema: { fields: schemaFields },
        },
        workflows,
      };

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await get().fetchConfigs();
        set({ activeConfig: data.data });
        return data.data;
      } else {
        set({ error: data.error || 'Failed to save configuration' });
        return null;
      }
    } catch (err: any) {
      set({ error: err?.message || 'Failed to save configuration' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteConfig: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/config?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchConfigs();
        if (get().activeConfig?.id === id) {
          set({ activeConfig: null });
        }
        return true;
      } else {
        set({ error: data.error || 'Failed to delete configuration' });
        return false;
      }
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete configuration' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveConfig: (config) => {
    set({ activeConfig: config });
  },

  fetchCollectionData: async (collection) => {
    try {
      const res = await fetch(`/api/${collection}`);
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          previewData: {
            ...state.previewData,
            [collection]: data.data,
          },
        }));
      }
    } catch (err) {
      console.error(`Failed loading records list for dynamic path "/api/${collection}":`, err);
    }
  },

  addRecord: async (collection, recordData) => {
    try {
      const res = await fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchCollectionData(collection);
        return true;
      } else {
        if (data.errors) {
          throw new Error(JSON.stringify(data.errors));
        }
        throw new Error(data.error || `Failed committing record insertion on path "/api/${collection}"`);
      }
    } catch (err: any) {
      console.error(`Dynamic CRUD creation failed:`, err);
      throw err;
    }
  },

  deleteRecord: async (collection, id) => {
    try {
      const res = await fetch(`/api/${collection}?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchCollectionData(collection);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Dynamic CRUD deletion failed for item "${id}" on path "/api/${collection}":`, err);
      return false;
    }
  },

  fetchWorkflowLogs: async () => {
    try {
      const res = await fetch('/api/workflows/logs');
      const data = await res.json();
      if (data.success) {
        set({ workflowLogs: data.data });
      }
    } catch (err) {
      console.error('Failed retrieving workflow executions logs telemetry:', err);
    }
  },
}));
