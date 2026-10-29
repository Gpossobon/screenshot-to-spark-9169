import { z } from "zod";
import { fullNameSchema } from "./auth-validation";

/**
 * Academic data rules. Values are trimmed before saving; RA stays text so
 * leading zeros survive, and campus/turma are free text with no format rules.
 */
export const academicProfileSchema = z.object({
  full_name: fullNameSchema,
  ra: z
    .string()
    .trim()
    .min(1, "Informe seu RA.")
    .max(50, "O RA deve ter no máximo 50 caracteres."),
  campus: z
    .string()
    .trim()
    .min(1, "Informe seu campus.")
    .max(100, "O campus deve ter no máximo 100 caracteres."),
  turma: z
    .string()
    .trim()
    .min(1, "Informe sua turma.")
    .max(100, "A turma deve ter no máximo 100 caracteres."),
});

export type AcademicProfileInput = z.infer<typeof academicProfileSchema>;
export type AcademicField = keyof AcademicProfileInput;
export type AcademicErrors = Partial<Record<AcademicField, string>>;

export function validateAcademicProfile(
  values: Record<AcademicField, string>,
): { ok: true; data: AcademicProfileInput } | { ok: false; errors: AcademicErrors } {
  const r = academicProfileSchema.safeParse(values);
  if (r.success) return { ok: true, data: r.data };
  const errors: AcademicErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as AcademicField;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** A saved profile counts as complete only when every required field is filled. */
export function isAcademicProfileComplete(
  profile: Partial<Record<AcademicField, string | null>> | null | undefined,
): boolean {
  if (!profile) return false;
  return academicProfileSchema.safeParse({
    full_name: profile.full_name ?? "",
    ra: profile.ra ?? "",
    campus: profile.campus ?? "",
    turma: profile.turma ?? "",
  }).success;
}
