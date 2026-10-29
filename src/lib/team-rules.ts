/**
 * "Minha Equipe" rules. The database functions enforce the same rules; these
 * helpers drive what the page shows and how server errors read in Portuguese.
 */

/** Maximum team size, captain included. */
export const MAX_TEAM_SIZE = 5;

export type TeamStatus = { key: "none" | "open" | "full"; label: string };

export function teamStatus(memberCount: number): TeamStatus {
  if (memberCount <= 0) return { key: "none", label: "Sem equipe" };
  if (memberCount >= MAX_TEAM_SIZE) return { key: "full", label: "Equipe completa" };
  return { key: "open", label: "Vagas abertas" };
}

export function canAddMember(memberCount: number): boolean {
  return memberCount > 0 && memberCount < MAX_TEAM_SIZE;
}

export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const TEAM_ERRORS: Record<string, string> = {
  TEAM_FULL: `A equipe já tem ${MAX_TEAM_SIZE} integrantes, o máximo permitido.`,
  ALREADY_MEMBER: "Este participante já faz parte da sua equipe.",
  ALREADY_IN_TEAM: "Este participante já faz parte de outra equipe.",
  IS_CAPTAIN: "Você já é o capitão desta equipe.",
  NOT_CAPTAIN: "Somente o capitão pode gerenciar os integrantes.",
  PARTICIPANT_NOT_FOUND: "Participante não encontrado.",
  PROFILE_INCOMPLETE: "Complete seus dados acadêmicos antes de criar uma equipe.",
  NOT_AUTHENTICATED: "Sua sessão expirou. Entre novamente.",
};

export function translateTeamError(error: unknown): string {
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error ?? "");
  for (const [code, text] of Object.entries(TEAM_ERRORS)) {
    if (message.includes(code)) return text;
  }
  return "Não foi possível concluir a ação. Tente novamente.";
}
