import collegeLogo from "@/assets/uniritter-logo.png.asset.json";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-5 py-3 text-center sm:flex-row sm:justify-between sm:gap-3 sm:px-8 sm:py-4 sm:text-left short:gap-1 short:py-2 sm:short:py-2.5">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={collegeLogo.url}
            alt="UniRitter"
            width={169}
            height={34}
            className="h-6 w-auto shrink-0 sm:h-7"
          />
          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
          <span className="text-sm font-semibold text-brand">Projeto acadêmico</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Mouse RaceTrap · Competição de carrinhos movidos a ratoeira
        </p>
      </div>
    </footer>
  );
}
