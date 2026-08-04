import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Renvoie un fichier Excel vierge pré-rempli avec les colonnes attendues
 * + 2 lignes d'exemple commentées. L'utilisateur remplit le fichier puis
 * le re-téléverse via la page d'import.
 */
export async function GET() {
  const headers = [
    "Unité de travail",
    "Risque",
    "Description",
    "Gravité (1-4)",
    "Probabilité (1-4)",
    "Maîtrise (1-4)",
    "Mesures existantes (séparées par |)",
  ];

  const exemples = [
    [
      "Cuisine",
      "Coupure avec couteaux",
      "Manipulation régulière de couteaux de préparation",
      3,
      3,
      2,
      "Gants anti-coupure | Formation à l'affûtage",
    ],
    [
      "Cuisine",
      "Brûlure liée aux surfaces chaudes",
      "Fours, plaques, friteuses",
      3,
      2,
      3,
      "Manchettes de protection | Pincettes longues",
    ],
    [
      "Salle de restaurant",
      "Chute de plain-pied (sol glissant)",
      "Liquide renversé en service",
      2,
      3,
      2,
      "Chaussures antidérapantes | Procédure de nettoyage immédiat",
    ],
  ];

  const aoa = [headers, ...exemples];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Largeur de colonnes pour lisibilité.
  ws["!cols"] = [
    { wch: 22 },
    { wch: 32 },
    { wch: 40 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 42 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DUERP");

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition":
        'attachment; filename="modele-duerp.xlsx"',
    },
  });
}
