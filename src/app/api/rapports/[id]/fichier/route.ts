import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

/**
 * Route de téléchargement d'un rapport de vérification.
 *
 * GET `/api/rapports/[id]/fichier`
 *   → renvoie le fichier binaire avec le Content-Type enregistré à l'upload
 *     et un Content-Disposition inline (affichage si navigateur le permet,
 *     téléchargement sinon).
 *
 * **Scoping (ADR-005).** Le rapport n'est servi que si son établissement
 * appartient au user connecté : la relation complète
 * `RapportVerification → Etablissement → Entreprise → userId` est vérifiée
 * dans le `findFirst` ci-dessous. Avant ce garde, un simple
 * identifiant suffisait à télécharger le rapport de vérification de
 * n'importe quel client : un rapport porte la raison sociale, l'adresse et
 * les écarts constatés chez un tiers.
 *
 * On répond 403 (et non 404) pour un rapport existant hors périmètre comme
 * pour un rapport inexistant : la réponse ne doit pas permettre de
 * distinguer les deux cas, sans quoi elle devient un oracle d'existence.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;

  const rapport = await prisma.rapportVerification.findFirst({
    where: {
      id,
      etablissement: { entreprise: { userId: user.id } },
    },
    select: {
      fichierCle: true,
      fichierMime: true,
      fichierNomOriginal: true,
    },
  });
  if (!rapport) {
    return new NextResponse("Rapport introuvable ou hors périmètre", {
      status: 403,
    });
  }

  const storage = getStorage();
  let data: Buffer;
  try {
    data = await storage.get(rapport.fichierCle);
  } catch {
    return new NextResponse("Fichier absent du stockage", { status: 410 });
  }

  // Encodage RFC 5987 du filename pour gérer les accents et caractères spéciaux.
  const filenameAscii = rapport.fichierNomOriginal
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "_");
  const filenameUtf8 = encodeURIComponent(rapport.fichierNomOriginal);

  const blob = new Blob([new Uint8Array(data)], { type: rapport.fichierMime });
  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": rapport.fichierMime,
      "Content-Length": String(data.byteLength),
      "Content-Disposition": `inline; filename="${filenameAscii}"; filename*=UTF-8''${filenameUtf8}`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
