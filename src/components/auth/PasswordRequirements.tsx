import { Check, Circle } from "lucide-react";
import { passwordRules } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul aria-label="Requisitos da senha" className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
      {passwordRules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
              ok ? "text-success" : "text-muted-foreground",
            )}
          >
            {ok ? (
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            ) : (
              <Circle aria-hidden="true" className="size-3" strokeWidth={2.5} />
            )}
            <span>{rule.label}</span>
            <span className="sr-only">{ok ? "(atendido)" : "(pendente)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
