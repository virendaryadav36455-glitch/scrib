// packages/constants/src/field-registry.ts

export interface SerializedAnswer {
  valueText?: string | null;
  valueNumber?: string | null;
  valueArray?: unknown[] | null;
  valueJson?: unknown | null;
}

export interface FieldRegistryEntry {
  supportsOptions: boolean;
  serializeAnswer: (value: unknown) => SerializedAnswer;
  deserializeAnswer: (row: SerializedAnswer) => unknown;
}

export const FIELD_REGISTRY: Record<string, FieldRegistryEntry> = {
  short_text:     textField(),
  long_text:      textField(),
  email:          textField(),
  phone:          textField(),
  section_title:  textField(),
  divider:        noOpField(),
  number: {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueNumber: String(v) }),
    deserializeAnswer: (r) => r.valueNumber ? parseFloat(r.valueNumber) : null,
  },
  date: {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueText: String(v) }),
    deserializeAnswer: (r) => r.valueText,
  },
  rating: {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueNumber: String(v) }),
    deserializeAnswer: (r) => r.valueNumber ? parseInt(r.valueNumber) : null,
  },
  checkbox: {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueText: String(v) }),
    deserializeAnswer: (r) => r.valueText === "true",
  },
  single_select: {
    supportsOptions: true,
    serializeAnswer: (v) => ({ valueText: String(v) }),
    deserializeAnswer: (r) => r.valueText,
  },
  multi_select: {
    supportsOptions: true,
    serializeAnswer: (v) => ({ valueArray: v as unknown[] }),
    deserializeAnswer: (r) => r.valueArray ?? [],
  },
  file_upload: {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueText: String(v) }),
    deserializeAnswer: (r) => r.valueText,
  },
};

function textField(): FieldRegistryEntry {
  return {
    supportsOptions: false,
    serializeAnswer: (v) => ({ valueText: String(v) }),
    deserializeAnswer: (r) => r.valueText,
  };
}

function noOpField(): FieldRegistryEntry {
  return {
    supportsOptions: false,
    serializeAnswer: () => ({}),
    deserializeAnswer: () => null,
  };
}
