/** @type {import('next').NextConfig} */
const nextConfig = {
  // Garantiza que los documentos de contexto (.md) viajen con el bundle
  // serverless de las rutas que los leen en runtime (Vercel / next start).
  outputFileTracingIncludes: {
    "/api/generate": ["./content/**/*", "./logo/**/*"],
    "/api/refine": ["./content/**/*"],
  },
};

export default nextConfig;
