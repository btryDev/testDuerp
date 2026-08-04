import { prisma } from "@/lib/prisma";

/**
 * Boucle ticket ↔ DUERP : quand un ticket lié à un risque est clôturé
 * avec l'option « réévaluer », le risque passe à `cotationSaisie = false`.
 * On liste ici ces risques à recoter pour les remonter dans le dashboard
 * et dans le wizard DUERP.
 *
 * Cadre métier : art. R4121-2 CT (mise à jour DUERP à chaque changement
 * important affectant l'évaluation). Un ticket résolu sur un équipement
 * = changement important de fait.
 */

export async function listerRisquesAReevaluer(etablissementId: string) {
  // Risques à cotationSaisie=false qui ont au moins un ticket clôturé
  // avec réévaluation demandée. On récupère aussi le ticket le plus récent
  // pour contextualiser l'alerte.
  const risques = await prisma.risque.findMany({
    where: {
      cotationSaisie: false,
      unite: { duerp: { etablissementId } },
    },
    include: {
      unite: {
        select: {
          id: true,
          nom: true,
          duerpId: true,
        },
      },
    },
  });

  // Pour chaque risque, récupérer les infos du dernier ticket clôturé lié.
  const ticketsParRisque = new Map<
    string,
    { titre: string; dateCloture: Date | null; numero: number }
  >();
  if (risques.length > 0) {
    const tickets = await prisma.intervention.findMany({
      where: {
        etablissementId,
        risqueId: { in: risques.map((r) => r.id) },
        statut: "fait",
      },
      orderBy: { dateCloture: "desc" },
      select: {
        risqueId: true,
        titre: true,
        dateCloture: true,
        numero: true,
      },
    });
    for (const t of tickets) {
      if (!t.risqueId) continue;
      if (!ticketsParRisque.has(t.risqueId)) {
        ticketsParRisque.set(t.risqueId, {
          titre: t.titre,
          dateCloture: t.dateCloture,
          numero: t.numero,
        });
      }
    }
  }

  // On ne garde que les risques effectivement issus d'une boucle ticket
  // (autrement, ce sont juste des risques jamais cotés — autre sujet).
  return risques
    .filter((r) => ticketsParRisque.has(r.id))
    .map((r) => ({
      id: r.id,
      libelle: r.libelle,
      uniteNom: r.unite.nom,
      uniteId: r.unite.id,
      duerpId: r.unite.duerpId,
      dernierTicket: ticketsParRisque.get(r.id)!,
    }));
}

export async function countRisquesAReevaluer(
  etablissementId: string,
): Promise<number> {
  const liste = await listerRisquesAReevaluer(etablissementId);
  return liste.length;
}
