import { renderToBuffer } from "@react-pdf/renderer";
import { construirePlanActionsData } from "@/lib/pdf/builders";
import { PlanActionsDocument } from "@/lib/pdf/PlanActionsDocument";
import { slugifyFilename } from "@/lib/pdf/styles";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
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
