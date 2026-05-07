import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground flex-wrap">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-foreground transition-colors">{c.label}</Link>
              ) : (
                <span className={isLast ? "text-foreground" : ""}>{c.label}</span>
              )}
              {!isLast && <span aria-hidden="true" className="text-muted-foreground/75">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
