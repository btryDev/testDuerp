import { renderToBuffer } from "@react-pdf/renderer";
import { requireEtablissement } from "@/lib/auth/scope";
import { construireRegistreData } from "@/lib/pdf/builders";
import { RegistreDocument } from "@/lib/pdf/RegistreDocument";
import { slugifyFilename } from "@/lib/pdf/styles";

/**
 * Registre de sécurité en PDF (art. L. 4711-5 CT).
 *
 * `requireEtablissement` borne la route au périmètre du user connecté (cf.
 * `controle-zip/route.ts`) : l'en-tête du registre identifie l'entreprise et
 * l'établissement, qui n'ont rien à faire dans les mains d'un tiers.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await requireEtablissement(id);

  const data = await construireRegistreData(id);
  if (!data) return new Response("Établissement introuvable", { status: 404 });

  const buffer = await renderToBuffer(RegistreDocument({ data }));
  const filename = `Registre_securite_${slugifyFilename(data.etablissement)}.pdf`;

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
