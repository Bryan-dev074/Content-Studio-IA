import { cn } from "@/lib/utils";

/**
 * Logo del proyecto: el gatito (GIF animado en loop) servido desde /public.
 * Para reemplazarlo, sustituye `public/cat-logo.gif`.
 */
export function CatLogo({
  className,
}: {
  className?: string;
  /** Conservado por compatibilidad; el GIF siempre está en loop. */
  animated?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/cat-logo.gif"
      alt="Logo gato"
      draggable={false}
      className={cn("h-10 w-10 select-none object-contain", className)}
    />
  );
}
