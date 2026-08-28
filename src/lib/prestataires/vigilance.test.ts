import { describe, expect, it } from "vitest";
import type { Prestataire } from "@prisma/client";
import {
  MOIS_RENOUVELLEMENT_URSSAF,
  computeVigilance,
  messageExpiration,
} from "./vigilance";

/**
 * Les dates de validité arrivent d'un `<input type="date">` : elles sont
 * stockées à **minuit UTC** (cf. ADR-011). Tous les cas ci-dessous les
 * construisent ainsi — `new Date("2026-08-10")` — et figent l'horloge à une
 * heure ouvrée de Paris.
 *
 * C'est ce que l'ancienne version de ces tests ne faisait pas : elle
 * construisait chaque date par `Date.now() + n × 86 400 000`, si bien que la
 * date portait la même heure que l'horloge et que la soustraction tombait
 * toujours sur un compte de jours entier. Le décalage d'un jour sur toute
 * l'échelle (« Expirée il y a 1 j » le jour même de la validité) était donc
 * structurellement invisible.
 */

/** 10 août 2026, 9 h à Paris (07:00 UTC — l'écart d'été qui faisait basculer
 *  l'ancien calcul du bon côté du zéro). */
const NOW = new Date("2026-08-10T07:00:00Z");
/** Le même jour civil, mais tard le soir (23:30 à Paris = 21:30 UTC). */
const NOW_SOIR = new Date("2026-08-10T21:30:00Z");

/** Date civile telle que Prisma la rend : minuit UTC. */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

function prestataireFake(p: Partial<Prestataire>): Prestataire {
  return {
    id: "p1",
    etablissementId: "e1",
    raisonSociale: "Test",
    siret: null,
    estOrganismeAgree: false,
    domaines: [],
    contactNom: "Nom",
    contactEmail: "test@ex.fr",
    contactTelephone: null,
    attestationUrssafCle: null,
    attestationUrssafNom: null,
    attestationUrssafValableJusquA: null,
    assuranceRcProCle: null,
    assuranceRcProNom: null,
    assuranceRcProValableJusquA: null,
    kbisCle: null,
    kbisNom: null,
    kbisDateEmission: null,
    notesInternes: null,
    createdAt: jour("2026-08-01"),
    // Fiche à jour par défaut : le contrôle de fraîcheur semestriel ne
    // s'applique pas, chaque cas de base ne teste que la date de validité.
    updatedAt: NOW,
    ...p,
  };
}

describe("computeVigilance — échelle de validité", () => {
  it("marque comme manquante une attestation non renseignée", () => {
    const v = computeVigilance(prestataireFake({}), NOW);
    expect(v.urssaf).toBe("manquante");
    expect(v.rcPro).toBe("manquante");
    expect(v.kbis).toBe("absent");
    expect(v.urssafOpposableJusquA).toBeNull();
    expect(v.alertesOuvertes).toBe(2);
  });

  it("compte en jours civils, pas en tranches de 24 h", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-09-15"),
        assuranceRcProValableJusquA: jour("2027-02-06"),
        kbisCle: "kbis/key",
      }),
      NOW,
    );
    expect(v.urssafExpireDans).toBe(36);
    expect(v.rcProExpireDans).toBe(180);
    expect(v.urssaf).toBe("a_jour");
    expect(v.rcPro).toBe("a_jour");
    expect(v.kbis).toBe("present");
    expect(v.alertesOuvertes).toBe(0);
  });

  it("laisse toute sa journée à une attestation valable « jusqu'au » aujourd'hui", () => {
    // Le cœur du défaut corrigé : la date est stockée à 00:00 UTC, soit
    // 02:00 à Paris. À 9 h, l'écart valait −7 h et l'arrondi vers le bas
    // annonçait « Expirée il y a 1 j » sur une pièce encore valable.
    const p = prestataireFake({
      attestationUrssafValableJusquA: jour("2026-08-10"),
    });
    for (const horloge of [NOW, NOW_SOIR]) {
      const v = computeVigilance(p, horloge);
      expect(v.urssaf).toBe("expire_bientot");
      expect(v.urssafExpireDans).toBe(0);
      expect(messageExpiration(v.urssafExpireDans)).toBe("Expire aujourd'hui");
    }
  });

  it("bascule en expirée au minuit suivant, pas avant", () => {
    const veille = computeVigilance(
      prestataireFake({ attestationUrssafValableJusquA: jour("2026-08-09") }),
      NOW,
    );
    expect(veille.urssaf).toBe("expiree");
    expect(veille.urssafExpireDans).toBe(-1);
    expect(messageExpiration(veille.urssafExpireDans)).toBe(
      "Expirée il y a 1 j",
    );
  });

  it("annonce « expire demain » la veille du dernier jour", () => {
    const v = computeVigilance(
      prestataireFake({ attestationUrssafValableJusquA: jour("2026-08-11") }),
      NOW,
    );
    expect(v.urssafExpireDans).toBe(1);
    expect(messageExpiration(v.urssafExpireDans)).toBe("Expire demain");
  });

  it("alerte à trente jours pile, pas à trente et un", () => {
    const dans30 = computeVigilance(
      prestataireFake({ attestationUrssafValableJusquA: jour("2026-09-09") }),
      NOW,
    );
    const dans31 = computeVigilance(
      prestataireFake({ attestationUrssafValableJusquA: jour("2026-09-10") }),
      NOW,
    );
    expect(dans30.urssaf).toBe("expire_bientot");
    expect(dans31.urssaf).toBe("a_jour");
  });

  it("compte une alerte par pièce à durée de validité qui n'est pas à jour", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-08-01"), // expirée
        assuranceRcProValableJusquA: jour("2026-08-20"), // expire bientôt
      }),
      NOW,
    );
    expect(v.alertesOuvertes).toBe(2);
  });
});

describe("computeVigilance — rythme semestriel (art. D. 8222-5 1°)", () => {
  it("plafonne une validité lointaine à six mois après le dernier dépôt", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2030-12-31"),
        updatedAt: NOW,
      }),
      NOW,
    );
    expect(v.urssafPlafonneeParLeSemestre).toBe(true);
    // Six mois après le 10 août : le 10 février suivant, à la même heure
    // civile de Paris (09:00) — donc 08:00 UTC, l'heure d'hiver étant
    // revenue entre-temps. C'est l'arithmétique calendaire qui décide, pas
    // un multiple de 86 400 000.
    expect(v.urssafOpposableJusquA?.toISOString()).toBe(
      "2027-02-10T08:00:00.000Z",
    );
    expect(v.urssaf).toBe("a_jour");
    expect(v.urssafExpireDans).toBe(184);
  });

  it("ne laisse plus une saisie lointaine rester verte indéfiniment", () => {
    // Fiche non touchée depuis huit mois : l'attestation en dossier a
    // nécessairement plus de six mois, quelle que soit la date saisie.
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2030-12-31"),
        updatedAt: new Date("2025-12-10T07:00:00Z"),
      }),
      NOW,
    );
    expect(v.urssaf).toBe("expiree");
    expect(v.urssafPlafonneeParLeSemestre).toBe(true);
    // L'URSSAF plafonnée et la RC Pro non renseignée : deux alertes.
    expect(v.alertesOuvertes).toBe(2);
  });

  it("prévient dans le mois qui précède la limite semestrielle", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2030-12-31"),
        // Limite au 25 août : dans quinze jours.
        updatedAt: new Date("2026-02-25T07:00:00Z"),
      }),
      NOW,
    );
    expect(v.urssaf).toBe("expire_bientot");
    expect(v.urssafExpireDans).toBe(15);
  });

  it("laisse la date saisie décider quand elle tombe avant la limite", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-10-01"),
        updatedAt: NOW,
      }),
      NOW,
    );
    expect(v.urssafPlafonneeParLeSemestre).toBe(false);
    expect(v.urssafOpposableJusquA).toEqual(jour("2026-10-01"));
    expect(v.urssafExpireDans).toBe(52);
  });

  it("n'applique le plafond qu'à l'URSSAF — la RC Pro n'a pas de périodicité légale", () => {
    const v = computeVigilance(
      prestataireFake({
        assuranceRcProValableJusquA: jour("2027-06-30"),
        updatedAt: new Date("2024-01-01T07:00:00Z"),
      }),
      NOW,
    );
    expect(v.rcPro).toBe("a_jour");
  });

  it("garde six mois pour périodicité — la constante est celle du texte", () => {
    expect(MOIS_RENOUVELLEMENT_URSSAF).toBe(6);
  });
});

describe("computeVigilance — extrait Kbis", () => {
  it("expose l'âge de l'extrait sans en tirer de statut", () => {
    const v = computeVigilance(
      prestataireFake({
        kbisCle: "kbis/key",
        kbisDateEmission: jour("2026-05-12"),
      }),
      NOW,
    );
    expect(v.kbis).toBe("present");
    expect(v.kbisEmisLe).toEqual(jour("2026-05-12"));
    expect(v.kbisAgeJours).toBe(90);
    // Aucune périodicité citable pour le Kbis : il ne pèse pas sur les
    // alertes, même vieux de plusieurs années.
    expect(v.alertesOuvertes).toBe(2);
  });

  it("ne rend aucun âge quand la date d'émission n'est pas renseignée", () => {
    const v = computeVigilance(
      prestataireFake({ kbisCle: "kbis/key" }),
      NOW,
    );
    expect(v.kbisEmisLe).toBeNull();
    expect(v.kbisAgeJours).toBeNull();
  });
});

describe("messageExpiration", () => {
  it("produit un message humain pour chaque plage", () => {
    expect(messageExpiration(null)).toBe("Non renseignée");
    expect(messageExpiration(-3)).toBe("Expirée il y a 3 j");
    expect(messageExpiration(0)).toBe("Expire aujourd'hui");
    expect(messageExpiration(1)).toBe("Expire demain");
    expect(messageExpiration(15)).toBe("Expire dans 15 j");
    expect(messageExpiration(120)).toBe("Valide 120 j de plus");
  });
});

describe("etatLePlusGrave — la couleur ne se déduit pas du compte", () => {
  /**
   * `alertesOuvertes` fond trois états dans un chiffre : pièce expirée, pièce
   * qui expire bientôt, pièce jamais fournie. Les écrans qui s'en servaient
   * pour CHOISIR UNE COULEUR peignaient donc en rose un prestataire créé le
   * matin même, dont aucune pièce n'a d'échéance — au-dessus de ses propres
   * pastilles « Non fournie » en ardoise, sur la même page.
   *
   * Corrigé trois fois : la carte, le compteur d'en-tête, puis la fiche. Les
   * deux premières fois sans test, d'où la troisième. `alertesOuvertes` était
   * assuré cinq fois dans ce fichier, `etatLePlusGrave` jamais.
   */
  it("une pièce jamais fournie n'est pas un retard", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: null,
        assuranceRcProValableJusquA: null,
      }),
      NOW,
    );
    expect(v.alertesOuvertes).toBe(2);
    expect(v.piecesManquantes).toBe(2);
    expect(v.piecesExpirees).toBe(0);
    // Le point du test : deux alertes, et pourtant PAS de rose.
    expect(v.etatLePlusGrave).toBe("aPlanifier");
  });

  it("une pièce expirée l'emporte sur tout le reste", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-07-01"),
        assuranceRcProValableJusquA: null,
      }),
      NOW,
    );
    expect(v.piecesExpirees).toBe(1);
    expect(v.etatLePlusGrave).toBe("enRetard");
  });

  it("une échéance proche l'emporte sur une absence, pas sur une expiration", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-08-20"),
        assuranceRcProValableJusquA: null,
      }),
      NOW,
    );
    expect(v.piecesProches).toBe(1);
    expect(v.piecesManquantes).toBe(1);
    expect(v.etatLePlusGrave).toBe("proche");
  });

  it("rien à signaler quand les deux pièces sont à jour", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: jour("2026-09-20"),
        assuranceRcProValableJusquA: jour("2027-06-01"),
      }),
      NOW,
    );
    expect(v.alertesOuvertes).toBe(0);
    expect(v.etatLePlusGrave).toBeNull();
  });
});
