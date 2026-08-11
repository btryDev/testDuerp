import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { sha256Hex } from "./hash";
import type { ObjetSignable } from "@prisma/client";

/**
 * Calcul de l'empreinte d'un objet signable (ADR-006 / ADR-008).
 *
 * **Ce module n'est volontairement pas `"use server"`.** Toute fonction
 * exportée d'un module `"use server"` devient un point d'entrée appelable
 * depuis le navigateur : `calculerHashObjet` y était exposée telle quelle,
 * si bien qu'un identifiant suffisait à obtenir l'empreinte et le nom du
 * fichier d'un document appartenant à un tiers. Ici, la fonction n'est
 * atteignable que depuis du code serveur, qui a déjà établi le périmètre.
 *
 * **Le périmètre est un paramètre obligatoire.** `etablissementId` n'est
 * jamais lu depuis l'entrée utilisateur : il vient soit du token d'accès
 * (qui porte lui-même son établissement), soit d'un établissement dont
 * l'appartenance au user vient d'être vérifiée, soit de la signature déjà
 * enregistrée. Un objet situé hors de cet établissement est traité comme
 * inexistant.
 *
 * Le hash doit rester stable et reproductible à la demande : c'est lui qui
 * permet, des années plus tard, de démontrer que le document n'a pas
 * changé depuis la signature.
 *
 * Retourne un Result discriminé plutôt que de throw : les deux cas
 * « pas trouvé » (objet DB absent / fichier binaire absent) sont
 * remontés proprement jusqu'à l'UI.
 */
export type HashResult =
  | { ok: true; hash: string; nomDocument: string | null }
  | {
      ok: false;
      raison: "objet_introuvable" | "fichier_introuvable" | "non_implemente";
    };

export async function calculerHashObjet(
  objetType: ObjetSignable,
  objetId: string,
  etablissementId: string,
): Promise<HashResult> {
  if (objetType === "rapport_verification") {
    // Pour un rapport de vérification, l'objet signé est le fichier déposé
    // par l'organisme : on hashe le binaire lui-même.
    const rapport = await prisma.rapportVerification.findFirst({
      where: { id: objetId, etablissementId },
      select: { fichierCle: true, fichierNomOriginal: true },
    });
    if (!rapport) return { ok: false, raison: "objet_introuvable" };
    try {
      const buf = await getStorage().get(rapport.fichierCle);
      return {
        ok: true,
        hash: sha256Hex(buf),
        nomDocument: rapport.fichierNomOriginal,
      };
    } catch {
      return { ok: false, raison: "fichier_introuvable" };
    }
  }

  if (objetType === "plan_prevention") {
    const plan = await prisma.planPrevention.findFirst({
      where: { id: objetId, etablissementId },
      include: { lignes: { orderBy: { ordre: "asc" } } },
    });
    if (!plan) return { ok: false, raison: "objet_introuvable" };
    const canonique = JSON.stringify({
      numero: plan.numero,
      entrepriseExterieureRaison: plan.entrepriseExterieureRaison,
      entrepriseExterieureSiret: plan.entrepriseExterieureSiret,
      efChefNom: plan.efChefNom,
      efChefEmail: plan.efChefEmail,
      efEffectifIntervenant: plan.efEffectifIntervenant,
      euChefNom: plan.euChefNom,
      euChefFonction: plan.euChefFonction,
      dateDebut: plan.dateDebut,
      dateFin: plan.dateFin,
      lieux: plan.lieux,
      naturesTravaux: plan.naturesTravaux,
      travauxDangereux: plan.travauxDangereux,
      inspectionDate: plan.inspectionDate,
      inspectionParticipants: plan.inspectionParticipants,
      lignes: plan.lignes.map((l) => ({
        ordre: l.ordre,
        risque: l.risque,
        mesureEntrepriseUtilisatrice: l.mesureEntrepriseUtilisatrice,
        mesureEntrepriseExterieure: l.mesureEntrepriseExterieure,
      })),
    });
    return {
      ok: true,
      hash: sha256Hex(canonique),
      nomDocument: `Plan de prévention PP-${String(plan.numero).padStart(3, "0")}`,
    };
  }

  if (objetType === "permis_feu") {
    // Représentation canonique d'un permis de feu : on sérialise les champs
    // immuables juridiquement. Les champs de cycle de vie (statut, signatures
    // elles-mêmes) sont exclus — ils évoluent après signature sans invalider
    // l'accord initial.
    const permis = await prisma.permisFeu.findFirst({
      where: { id: objetId, etablissementId },
      select: {
        numero: true,
        prestataireRaison: true,
        prestataireContact: true,
        prestataireEmail: true,
        donneurOrdreNom: true,
        donneurOrdreFonction: true,
        dateDebut: true,
        dateFin: true,
        lieu: true,
        naturesTravaux: true,
        descriptionTravaux: true,
        mesuresValidees: true,
        mesuresNotes: true,
        dureeSurveillanceMinutes: true,
      },
    });
    if (!permis) return { ok: false, raison: "objet_introuvable" };
    // Clés triées pour stabilité du hash
    const canonique = JSON.stringify(permis, Object.keys(permis).sort());
    return {
      ok: true,
      hash: sha256Hex(canonique),
      nomDocument: `Permis de feu PF-${String(permis.numero).padStart(3, "0")}`,
    };
  }

  // Pour les autres objets (registre accessibilité, DUERP…), chaque module
  // livrera sa représentation canonique au fur et à mesure.
  return { ok: false, raison: "non_implemente" };
}
