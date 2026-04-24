import QRCode from "qrcode";

/**
 * Génère un QR code en SVG inline pour l'URL publique d'un registre
 * d'accessibilité. Utilisé sur la page admin pour l'affichage + téléchargement.
 */
export async function genererQrCodeSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 240,
    color: {
      dark: "#111",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

export async function genererQrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 480,
    errorCorrectionLevel: "M",
  });
}
