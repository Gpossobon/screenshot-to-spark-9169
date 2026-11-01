import { formatPublishedAt, type NewsItem } from "@/lib/portal-content";
import { cn } from "@/lib/utils";

function Meta({ item, demo, inverted }: { item: NewsItem; demo: boolean; inverted?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.14em]">
      <span className={cn("rounded px-2 py-0.5", inverted ? "bg-ink-foreground text-ink" : "bg-brand text-ink-foreground")}>
        {item.category}
      </span>
      <time dateTime={item.publishedAt} className={inverted ? "text-ink-foreground/70" : "text-muted-foreground"}>
        {formatPublishedAt(item.publishedAt)}
      </time>
      {demo && (
        <span className={cn("normal-case tracking-normal", inverted ? "text-ink-foreground/60" : "text-muted-foreground")}>
          · Exemplo
        </span>
      )}
    </p>
  );
}

export function NewsGrid({ items, demo, secondaryLimit = 3 }: { items: NewsItem[]; demo: boolean; secondaryLimit?: number }) {
  const [featured, ...rest] = items;
  if (!featured) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
        Nenhum comunicado publicado ainda.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <article className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-xl bg-ink text-ink-foreground lg:col-span-7 lg:row-span-2">
        <img
          src={featured.image}
          alt=""
          width={1280}
          height={800}
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/0" />
        <div className="p-6 sm:p-8">
          <Meta item={featured} demo={demo} inverted />
          <h3 className="mt-4 font-headline text-[clamp(1.6rem,3.4vw,2.5rem)]">{featured.title}</h3>
          <p className="mt-3 max-w-xl text-ink-foreground/80">{featured.summary}</p>
        </div>
      </article>

      <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
        {rest.slice(0, secondaryLimit).map((item) => (
          <article
            key={item.id}
            className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-1 lg:grid-cols-[10rem_1fr]"
          >
            <img
              src={item.image}
              alt=""
              width={1280}
              height={800}
              loading="lazy"
              className="aspect-[16/9] size-full object-cover lg:aspect-auto"
            />
            <div className="p-5">
              <Meta item={item} demo={demo} />
              <h3 className="mt-3 font-display text-lg font-bold leading-snug">{item.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
