import { prisma } from "@/lib/prisma";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

export type FiltresRegistre = {
  domaine?: DomaineObligation;
  recherche?: string; // sur libelleObligation + organismeVerif + equipement.libelle
};

export async function listerRapportsDeLEtablissement(
  etablissementId: string,
  filtres: FiltresRegistre = {},
) {
  const rapports = await prisma.rapportVerification.findMany({
    where: {
      etablissementId,
    },
    include: {
      verification: {
        include: { equipement: true },
      },
    },
    orderBy: { dateRapport: "desc" },
  });

  let out = rapports;

  if (filtres.domaine) {
    out = out.filter(
      (r) =>
        obligationParId(r.verification.obligationId)?.domaine ===
        filtres.domaine,
    );
  }

  if (filtres.recherche) {
    const q = filtres.recherche.toLowerCase().trim();
    if (q.length > 0) {
      out = out.filter((r) => {
        const hay = [
          r.verification.libelleObligation,
          r.organismeVerif ?? "",
          r.verification.equipement.libelle,
          r.commentaires ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
  }

  return out;
}

export type RapportListe = Awaited<
  ReturnType<typeof listerRapportsDeLEtablissement>
>[number];

export async function getRapport(id: string) {
  return prisma.rapportVerification.findUnique({
    where: { id },
    include: {
      verification: {
        include: {
          equipement: true,
          etablissement: {
            select: { id: true, raisonDisplay: true },
          },
        },
      },
    },
  });
}

export async function listerRapportsDUneVerification(verificationId: string) {
  return prisma.rapportVerification.findMany({
    where: { verificationId },
    orderBy: { dateRapport: "desc" },
  });
}
