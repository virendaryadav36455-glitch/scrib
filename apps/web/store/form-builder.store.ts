// apps/web/stores/form-builder.store.ts
import { create } from "zustand";

interface FieldRow {
  id: string;
  type: string;
  label: string;
  required: boolean;
  order: number;
  config?: Record<string, unknown> | null;
  conditions?: unknown;
  description?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
}

interface FormBuilderState {
  selectedFieldId: string | null;
  setSelectedField: (id: string | null) => void;

  activeTab: "fields" | "design" | "logic";
  setActiveTab: (tab: FormBuilderState["activeTab"]) => void;

  localFields: FieldRow[];
  setLocalFields: (fields: FieldRow[]) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  selectedFieldId: null,
  setSelectedField: (id) => set({ selectedFieldId: id }),

  activeTab: "fields",
  setActiveTab: (tab) => set({ activeTab: tab }),

  localFields: [],
  setLocalFields: (fields) => set({ localFields: fields }),
}));
