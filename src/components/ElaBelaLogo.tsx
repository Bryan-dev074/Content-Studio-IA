import { cn } from "@/lib/utils";

/**
 * Marca compacta de ElaBela para la cabecera (monograma "eb" + corazón).
 * Discreta a propósito: el logo es un recurso de marca, no el protagonista de la UI.
 */
export function ElaBelaLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="gradient-primary relative grid h-10 w-10 place-items-center rounded-2xl shadow-soft">
        <span className="font-serif text-lg font-semibold leading-none text-primary-foreground">
          eb
        </span>
        <svg
          viewBox="0 0 24 24"
          className="absolute -right-1 -top-1 h-3.5 w-3.5 text-primary-foreground drop-shadow"
          fill="currentColor"
        >
          <path d="M12 21s-7-4.5-9.5-8.5C.8 9.6 2.2 6 5.5 6c2 0 3.2 1.3 3.9 2.4C10.3 7.3 11.5 6 13.5 6c3.3 0 4.7 3.6 3 6.5C19 16.5 12 21 12 21z" />
        </svg>
      </div>

      {showWordmark && (
        <div className="leading-none">
          <p className="font-serif text-base font-semibold tracking-tight text-foreground">
            Ela<span className="text-accent">,</span> Bela
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            glow
          </p>
        </div>
      )}
    </div>
  );
}
