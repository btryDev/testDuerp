import { type NextRequest, NextResponse } from "next/server";
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
 * NB : pas d'auth en V2 MVP (auth reportée post-validation). Quand elle
 * sera remise en place, ajouter ici une vérification que l'utilisateur a
 * bien accès à `rapport.etablissementId`.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const rapport = await prisma.rapportVerification.findUnique({
    where: { id },
    select: {
      fichierCle: true,
      fichierMime: true,
      fichierNomOriginal: true,
    },
  });
  if (!rapport) {
    return new NextResponse("Rapport introuvable", { status: 404 });
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
