import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

/**
 * Sert une photo d'intervention. La clé demandée doit appartenir à une
 * intervention dont l'établissement est accessible au user — sinon 403.
 *
 * Le scoping est fait via une requête Prisma qui vérifie la relation
 * complète : Intervention → Etablissement → Entreprise → userId.
 */
export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const cle = searchParams.get("cle");
  if (!cle) return new NextResponse("missing key", { status: 400 });

  const intervention = await prisma.intervention.findFirst({
    where: {
      photos: { has: cle },
      etablissement: { entreprise: { userId: user.id } },
    },
    select: { id: true },
  });
  if (!intervention) return new NextResponse("forbidden", { status: 403 });

  try {
    const buf = await getStorage().get(cle);
    // Déduction MIME depuis l'extension (simpliste mais suffisant ici)
    const ext = cle.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "pdf"
            ? "application/pdf"
            : "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
