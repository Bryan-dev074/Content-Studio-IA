"use client";

/**
 * Fondo aurora: tres manchas de color difuminadas que flotan suavemente,
 * más una capa de grano sutil. Puramente decorativo.
 */
export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="aurora-blob animate-floatA"
        style={{
          top: "-10%",
          left: "-5%",
          width: "45vw",
          height: "45vw",
          background: "var(--aurora-1)",
        }}
      />
      <div
        className="aurora-blob animate-floatB"
        style={{
          top: "20%",
          right: "-10%",
          width: "40vw",
          height: "40vw",
          background: "var(--aurora-2)",
        }}
      />
      <div
        className="aurora-blob animate-floatC"
        style={{
          bottom: "-15%",
          left: "25%",
          width: "38vw",
          height: "38vw",
          background: "var(--aurora-3)",
        }}
      />
      {/* Viñeta para enfocar el centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 40%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
