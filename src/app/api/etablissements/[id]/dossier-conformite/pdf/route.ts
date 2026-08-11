import { renderToBuffer } from "@react-pdf/renderer";
import { requireEtablissement } from "@/lib/auth/scope";
import { construireDossierConformiteData } from "@/lib/pdf/builders";
import { DossierConformiteDocument } from "@/lib/pdf/DossierConformiteDocument";
import { slugifyFilename } from "@/lib/pdf/styles";

/**
 * Dossier de conformité en PDF.
 *
 * `requireEtablissement` borne la route au périmètre du user connecté —
 * même garde que `controle-zip/route.ts`. Le document imprime l'identité de
 * l'entreprise (raison sociale, SIRET, adresse, effectif) : sans ce garde,
 * un identifiant d'établissement suffisait à obtenir la carte d'identité
 * d'un tiers, dans un document par ailleurs incohérent puisque les listes,
 * elles, étaient déjà scopées et revenaient vides.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await requireEtablissement(id);

  const data = await construireDossierConformiteData(id);
  if (!data) return new Response("Établissement introuvable", { status: 404 });

  const buffer = await renderToBuffer(DossierConformiteDocument({ data }));
  const filename = `Dossier_conformite_${slugifyFilename(data.etablissement)}.pdf`;

  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/pdf",
  });
  return new Response(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
