// packages/constants/src/plan-limits.ts
export interface PlanLimits {
  maxForms: number;          // -1 = unlimited
  maxResponsesPerMonth: number;
  maxFieldsPerForm: number;
  hasCustomSlug: boolean;
  hasPasswordProtection: boolean;
  hasWebhooks: boolean;
  hasApiKeys: boolean;
  hasAnalytics: boolean;
  hasExport: boolean;
  hasFileUpload: boolean;
  hasConditionalLogic: boolean;
  maxFileSizeMb: number;
}

export const PLAN_LIMITS: Record<"free" | "creator" | "studio", PlanLimits> = {
  free: {
    maxForms: 3,
    maxResponsesPerMonth: 100,
    maxFieldsPerForm: 10,
    hasCustomSlug: false,
    hasPasswordProtection: false,
    hasWebhooks: false,
    hasApiKeys: false,
    hasAnalytics: true,
    hasExport: false,
    hasFileUpload: false,
    hasConditionalLogic: false,
    maxFileSizeMb: 0,
  },
  creator: {
    maxForms: 20,
    maxResponsesPerMonth: 1000,
    maxFieldsPerForm: 50,
    hasCustomSlug: true,
    hasPasswordProtection: true,
    hasWebhooks: false,
    hasApiKeys: false,
    hasAnalytics: true,
    hasExport: true,
    hasFileUpload: true,
    hasConditionalLogic: true,
    maxFileSizeMb: 10,
  },
  studio: {
    maxForms: -1,
    maxResponsesPerMonth: -1,
    maxFieldsPerForm: -1,
    hasCustomSlug: true,
    hasPasswordProtection: true,
    hasWebhooks: true,
    hasApiKeys: true,
    hasAnalytics: true,
    hasExport: true,
    hasFileUpload: true,
    hasConditionalLogic: true,
    maxFileSizeMb: 50,
  },
};
