// packages/validators/src/field-conditions.ts
// Conditional logic evaluator — shared between submit handler and frontend preview.
// The frontend uses this to show/hide fields in real time.
// The backend uses this to determine which fields are active before validation.

export interface ConditionRule {
  fieldId:  string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value:    string | number | boolean;
}

export interface FieldConditions {
  show:  boolean;
  logic: "and" | "or";
  rules: ConditionRule[];
}

export interface FieldWithConditions {
  id:         string;
  type:       string;
  required?:  boolean;
  config?:    Record<string, unknown> | null;
  conditions?: FieldConditions | null;
  [key: string]: unknown;
}

/**
 * Evaluates a single condition rule against the current answers.
 */
function evalRule(rule: ConditionRule, answers: Record<string, unknown>): boolean {
  const val = answers[rule.fieldId];
  switch (rule.operator) {
    case "equals":       return String(val ?? "") === String(rule.value);
    case "not_equals":   return String(val ?? "") !== String(rule.value);
    case "contains":     return String(val ?? "").includes(String(rule.value));
    case "is_empty":     return val == null || val === "" || (Array.isArray(val) && val.length === 0);
    case "is_not_empty": return val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
    case "greater_than": return Number(val) > Number(rule.value);
    case "less_than":    return Number(val) < Number(rule.value);
    default:             return true;
  }
}

/**
 * Returns only the fields that should be visible given the current answers.
 * Used by submit handler (backend) and form renderer (frontend).
 */
export function applyConditions(
  fields: FieldWithConditions[],
  answers: Record<string, unknown>
): FieldWithConditions[] {
  return fields.filter((field) => {
    const cond = field.conditions;
    if (!cond || !cond.rules?.length) return true;

    const results = cond.rules.map((r) => evalRule(r, answers));
    const passes  = cond.logic === "and" ? results.every(Boolean) : results.some(Boolean);
    return cond.show ? passes : !passes;
  });
}
