import { renderToBuffer } from "@react-pdf/renderer";
import { construireDossierConformiteData } from "@/lib/pdf/builders";
import { DossierConformiteDocument } from "@/lib/pdf/DossierConformiteDocument";
import { slugifyFilename } from "@/lib/pdf/styles";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
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
