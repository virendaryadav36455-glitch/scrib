// apps/web/lib/errors.ts
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS:   "Wrong email or password. Please try again.",
  EMAIL_TAKEN:           "An account with this email already exists. Try logging in!",
  SESSION_EXPIRED:       "Your session has expired. Please log in again.",
  RESET_TOKEN_INVALID:   "This reset link is invalid or expired. Please request a new one.",
  RESET_TOKEN_EXPIRED:   "This reset link has expired. Please request a new one.",
  FORM_NOT_FOUND:        "This form is not available.",
  FORM_NOT_PUBLISHED:    "This form is not accepting responses right now.",
  FORM_VERSION_OUTDATED: "The form was updated. Please refresh and try again.",
  FORM_EXPIRED:          "This form has expired and is no longer accepting responses.",
  FORM_RESPONSE_LIMIT:   "This form has reached its response limit.",
  FORM_EMPTY:            "Add at least one field before publishing!",
  FORM_SLUG_TAKEN:       "This URL is already taken. Try a different one.",
  PLAN_LIMIT_FORMS:      "You've reached your plan's form limit. Upgrade to create more!",
  PLAN_LIMIT_RESPONSES:  "You've reached your monthly response limit. Upgrade for unlimited!",
  PLAN_FEATURE_LOCKED:   "This feature requires a Creator or Studio plan. Upgrade to unlock!",
  VALIDATION_FAILED:     "One or more answers are invalid. Please check and try again.",
  DUPLICATE_SUBMISSION:  "You have already submitted this form.",
  NOT_FOUND:             "Not found.",
  FORBIDDEN:             "You don't have access to this.",
  INTERNAL:              "Something went wrong on our end. Please try again.",
  RATE_LIMITED:          "Too many requests. Please wait a moment and try again.",
};

export function getErrorMessage(err: unknown): string {
  const e = err as any;
  const code = e?.cause?.domainCode ?? e?.data?.code ?? e?.code;
  return ERROR_MESSAGES[code] ?? e?.message ?? "Something went wrong. Please try again.";
}
