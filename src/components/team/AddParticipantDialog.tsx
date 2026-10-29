import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { participantSearchQueryOptions } from "@/lib/team-queries";
import { MAX_TEAM_SIZE, memberInitials, translateTeamError } from "@/lib/team-rules";
import { cn } from "@/lib/utils";

export function AddParticipantDialog({
  open,
  onOpenChange,
  memberIds,
  memberCount,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberIds: string[];
  memberCount: number;
  onAdd: (userId: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!open) {
      setText("");
      setQuery("");
      setSelected(null);
      setError("");
    }
  }, [open]);

  const search = useQuery({ ...participantSearchQueryOptions(query), enabled: open && query.length >= 2 });
  const results = search.data ?? [];
  const spotsLeft = MAX_TEAM_SIZE - memberCount;

  async function handleAdd() {
    if (!selected || adding) return;
    setError("");
    setAdding(true);
    try {
      await onAdd(selected);
      onOpenChange(false);
    } catch (e) {
      setError(translateTeamError(e));
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Adicionar participante</DialogTitle>
          <DialogDescription>
            Pesquise por nome ou matrícula. {spotsLeft === 1 ? "Resta 1 vaga" : `Restam ${spotsLeft} vagas`} na
            equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSelected(null);
            }}
            placeholder="Nome ou matrícula (RA)"
            aria-label="Pesquisar participante por nome ou matrícula"
            className="h-12 bg-field pl-9 text-base"
          />
        </div>

        <div aria-live="polite" className="min-h-24">
          {query.length < 2 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Digite pelo menos 2 caracteres.</p>
          ) : search.isPending ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Buscando participantes…
            </p>
          ) : search.isError ? (
            <FormAlert tone="error">{translateTeamError(search.error)}</FormAlert>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum participante encontrado.</p>
          ) : (
            <ul role="listbox" aria-label="Participantes encontrados" className="divide-y divide-border rounded-lg border border-border">
              {results.map((p) => {
                const isMember = memberIds.includes(p.user_id);
                const unavailable = isMember || p.in_team;
                const isSelected = selected === p.user_id;
                return (
                  <li key={p.user_id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={unavailable}
                      onClick={() => setSelected(p.user_id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        isSelected ? "bg-brand-soft" : "hover:bg-accent",
                        unavailable && "cursor-not-allowed opacity-60 hover:bg-transparent",
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-ink-foreground">
                        {memberInitials(p.full_name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{p.full_name}</span>
                        <span className="block text-xs text-muted-foreground">
                          Matrícula {p.ra}
                          {isMember ? " • Já está na sua equipe" : p.in_team ? " • Já está em outra equipe" : ""}
                        </span>
                      </span>
                      {isSelected && <Check aria-hidden="true" className="size-5 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <FormAlert tone="error">{error}</FormAlert>}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-11 rounded-full px-6" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="h-11 rounded-full px-6" disabled={!selected || adding} onClick={handleAdd}>
            {adding ? <Loader2 aria-hidden="true" className="animate-spin" /> : <UserPlus aria-hidden="true" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
