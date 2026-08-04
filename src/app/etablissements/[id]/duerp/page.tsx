import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Relais depuis la sidebar : la nav ne connaît que l'etablissementId.
// On résout le DUERP rattaché (ou on le crée si absent) puis on saute
// directement à l'étape utile du wizard — sans passer par /duerp/[id]
// (qui redirige lui-même) pour éviter les chaînes de redirections.
export default async function EtablissementDuerpRelayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let duerp = await prisma.duerp.findFirst({
    where: { etablissementId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, referentielSecteurId: true },
  });
  if (!duerp) {
    duerp = await prisma.duerp.create({
      data: {
        etablissementId: id,
        unites: {
          create: {
            nom: "Risques transverses",
            description:
              "Risques transverses à l'entreprise (routier, RPS, TMS, écrans). Gérés via les questions détecteurs.",
            estTransverse: true,
          },
        },
      },
      select: { id: true, referentielSecteurId: true },
    });
  }
  redirect(
    `/duerp/${duerp.id}/${duerp.referentielSecteurId ? "unites" : "secteur"}`,
  );
}
