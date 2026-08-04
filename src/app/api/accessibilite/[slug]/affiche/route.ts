import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererQrCodeDataUrl } from "@/lib/accessibilite/qrcode";
import { publicAppUrl } from "@/lib/email";

/**
 * Route publique qui renvoie une affiche HTML prête à imprimer (A4) avec
 * le QR code et l'URL du registre. Le navigateur gère l'impression via
 * window.print(). Permet au dirigeant de coller le QR code à l'accueil
 * sans avoir à manipuler un générateur externe.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const registre = await prisma.registreAccessibilite.findUnique({
    where: { slugPublic: slug },
    include: {
      etablissement: {
        select: {
          raisonDisplay: true,
          adresse: true,
          entreprise: { select: { raisonSociale: true } },
        },
      },
    },
  });

  if (!registre || !registre.publie) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  const url = `${publicAppUrl()}/accessibilite/${registre.slugPublic}`;
  const qrDataUrl = await genererQrCodeDataUrl(url);
  const etab = registre.etablissement;
  const entreprise = etab.entreprise;

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Affiche — ${escapeHtml(entreprise.raisonSociale)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
    color: #18181f;
    background: #fff;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .wrap { display: flex; flex-direction: column; align-items: center; padding: 0 10mm; }
  .kicker {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 8mm;
  }
  h1 {
    font-size: 30pt;
    letter-spacing: -0.025em;
    font-weight: 600;
    text-align: center;
    margin: 0 0 4mm;
    line-height: 1.05;
  }
  .subtitle {
    font-size: 14pt;
    color: #333;
    text-align: center;
    margin-bottom: 12mm;
  }
  .qr-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10mm;
    background: #fff;
    box-shadow: 0 1px 0 #eee;
  }
  .qr-box img {
    display: block;
    width: 90mm;
    height: 90mm;
    image-rendering: pixelated;
  }
  .instructions {
    font-size: 16pt;
    margin-top: 10mm;
    text-align: center;
    max-width: 140mm;
    line-height: 1.35;
  }
  .url {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 10pt;
    color: #6b7280;
    margin-top: 6mm;
    text-align: center;
    word-break: break-all;
  }
  .footer {
    border-top: 1px dashed #ccc;
    padding: 6mm 0 0;
    text-align: center;
    font-family: "SF Mono", Menlo, monospace;
    font-size: 9pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6b7280;
  }
  .adresse { font-size: 10pt; color: #555; margin-top: 2mm; letter-spacing: normal; text-transform: none; }
  @media print {
    body { background: #fff; }
    .no-print { display: none; }
  }
  .btn {
    display: inline-block;
    margin: 8mm auto 0;
    padding: 10px 18px;
    background: #18181f;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="kicker">Accessibilité · Arrêté du 19 avril 2017</div>
    <h1>${escapeHtml(entreprise.raisonSociale)}</h1>
    <div class="subtitle">${escapeHtml(etab.raisonDisplay)}</div>

    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR code — registre d'accessibilité" />
    </div>

    <div class="instructions">
      <strong>Scannez ce code</strong> pour consulter notre registre d'accessibilité.
    </div>
    <div class="url">${escapeHtml(url)}</div>

    <div class="no-print">
      <button type="button" class="btn" onclick="window.print()">
        Imprimer cette affiche
      </button>
    </div>
  </div>

  <div class="footer">
    ${escapeHtml(entreprise.raisonSociale)} —
    <span class="adresse">${escapeHtml(etab.adresse)}</span>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
