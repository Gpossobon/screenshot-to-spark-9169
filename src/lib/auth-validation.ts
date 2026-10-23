import { z } from "zod";

/** Password rules for Mouse RaceTrap accounts. */
export const PASSWORD_MIN_LENGTH = 7;

export type PasswordRuleId = "length" | "letter" | "number";

export const passwordRules: { id: PasswordRuleId; label: string; test: (v: string) => boolean }[] =
  [
    {
      id: "length",
      label: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`,
      test: (v) => v.length >= PASSWORD_MIN_LENGTH,
    },
    { id: "letter", label: "Pelo menos uma letra", test: (v) => /\p{L}/u.test(v) },
    { id: "number", label: "Pelo menos um número", test: (v) => /\d/.test(v) },
  ];

export function checkPassword(value: string): Record<PasswordRuleId, boolean> {
  return Object.fromEntries(passwordRules.map((r) => [r.id, r.test(value)])) as Record<
    PasswordRuleId,
    boolean
  >;
}

export function isPasswordValid(value: string): boolean {
  return passwordRules.every((r) => r.test(value));
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(255, "O e-mail deve ter no máximo 255 caracteres.")
  .email("Digite um endereço de e-mail válido.");

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome completo.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

export function validateEmail(value: string): string | null {
  const r = emailSchema.safeParse(value);
  return r.success ? null : (r.error.issues[0]?.message ?? "Campo inválido.");
}

export function validateFullName(value: string): string | null {
  const r = fullNameSchema.safeParse(value);
  return r.success ? null : (r.error.issues[0]?.message ?? "Campo inválido.");
}

/** Translate auth service errors into clear Portuguese messages. */
export function translateAuthError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error ?? "");
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail pelo link enviado antes de entrar.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Já existe uma conta com este e-mail.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.";
  if (m.includes("password") && (m.includes("weak") || m.includes("pwned") || m.includes("leaked")))
    return "Esta senha é fraca ou já apareceu em vazamentos. Escolha outra.";
  if (m.includes("password should be at least"))
    return `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (m.includes("same password") || m.includes("different from the old"))
    return "A nova senha precisa ser diferente da anterior.";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  if (m.includes("popup")) return "A janela do Google foi bloqueada ou fechada. Tente novamente.";
  return "Algo deu errado. Tente novamente em instantes.";
}
