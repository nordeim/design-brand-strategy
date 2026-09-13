/**
 * Contact inquiry schema — shared by the client form (inline validation)
 * and the API route (authoritative validation).
 */

import { z } from "zod";

export const PROJECT_TYPES = [
  "brand-identity",
  "visual-design-system",
  "art-direction",
  "brand-guidelines",
  "naming-verbal-identity",
  "packaging-print",
  "other",
] as const;

export const BUDGET_RANGES = [
  "under-25k",
  "25-50k",
  "50-100k",
  "100k-plus",
  "not-sure",
] as const;

/** Display labels for the project type options — lives beside the enum it labels. */
export const PROJECT_TYPE_LABELS: Record<(typeof PROJECT_TYPES)[number], string> = {
  "brand-identity": "Brand Identity",
  "visual-design-system": "Visual Design System",
  "art-direction": "Art Direction",
  "brand-guidelines": "Brand Guidelines",
  "naming-verbal-identity": "Naming & Verbal Identity",
  "packaging-print": "Packaging & Print",
  other: "Something else",
};

/** Display labels for the budget range options — lives beside the enum it labels. */
export const BUDGET_LABELS: Record<(typeof BUDGET_RANGES)[number], string> = {
  "under-25k": "Under $25k",
  "25-50k": "$25k – $50k",
  "50-100k": "$50k – $100k",
  "100k-plus": "$100k+",
  "not-sure": "Not sure yet",
};

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share your name.")
    .max(100, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please share a valid email address.")
    .max(200, "Email is too long."),
  company: z
    .string()
    .trim()
    .max(100, "Company name is too long.")
    .optional()
    .default(""),
  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: "Please choose a project type." }),
  }),
  budget: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Please choose a budget range." }),
  }),
  message: z
    .string()
    .trim()
    .min(20, "A sentence or two about the project helps me respond well.")
    .max(2_000, "Please keep the message under 2,000 characters."),
  referral: z
    .string()
    .trim()
    .max(200, "Referral is too long.")
    .optional()
    .default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Flattens a ZodError into a field → message map for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}
