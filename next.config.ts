import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Les rapports de vérification peuvent atteindre 20 Mo (cf.
      // `src/lib/rapports/validator.ts`) ; on monte la limite à 25 Mo
      // pour garder une marge sur les métadonnées du FormData. Au-delà,
      // passer à un upload S3 pré-signé.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
