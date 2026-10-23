import collegeLogo from "@/assets/uniritter-logo.png.asset.json";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-6 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <img
            src={collegeLogo.url}
            alt="UniRitter"
            width={169}
            height={34}
            className="h-7 w-auto"
          />
          <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />
          <span className="text-sm font-semibold text-brand">Projeto acadêmico</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Mouse RaceTrap · Competição de carrinhos movidos a ratoeira
        </p>
      </div>
    </footer>
  );
}
