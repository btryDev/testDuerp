import { renderToBuffer } from "@react-pdf/renderer";
import { requireEtablissement } from "@/lib/auth/scope";
import { construirePlanActionsData } from "@/lib/pdf/builders";
import { PlanActionsDocument } from "@/lib/pdf/PlanActionsDocument";
import { slugifyFilename } from "@/lib/pdf/styles";

/**
 * Plan d'actions de conformité en PDF.
 *
 * `requireEtablissement` borne la route au périmètre du user connecté (cf.
 * `controle-zip/route.ts`) : l'en-tête du document porte la raison sociale,
 * l'adresse et le nom d'établissement d'un tiers si on ne le vérifie pas.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await requireEtablissement(id);

  const data = await construirePlanActionsData(id);
  if (!data) return new Response("Établissement introuvable", { status: 404 });

  const buffer = await renderToBuffer(PlanActionsDocument({ data }));
  const filename = `Plan_actions_${slugifyFilename(data.etablissement)}.pdf`;

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
