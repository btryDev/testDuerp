import { describe, expect, it } from "vitest";
import { classerDate, classerVerification } from "./etats";

// L'horloge est injectée partout (ADR-011) : midi à Paris, un jour sans
// piège de fuseau — les cas de bascule de minuit vivent dans
// `lib/dates/retard.test.ts`, pas ici.
const NOW = new Date("2026-08-19T10:00:00.000Z");

const jours = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

describe("classerDate", () => {
  it("hier est en retard, aujourd'hui non", () => {
    expect(classerDate(jours(-1), NOW)).toBe("enRetard");
    expect(classerDate(NOW, NOW)).toBe("proche");
  });

  /**
   * La frontière proche/lointain est LA raison d'être de ce module : la
   * lib possède un `estVerificationAVenir` qui désigne l'intérieur de la
   * fenêtre de 30 jours, et le calendrier a failli nommer `aVenir` son
   * extérieur. Le trentième jour appartient au proche, bornes incluses —
   * même convention que la pilule « sous 30 jours » de l'en-tête.
   */
  it("le trentième jour est proche, le trente-et-unième est lointain", () => {
    expect(classerDate(jours(30), NOW)).toBe("proche");
    expect(classerDate(jours(31), NOW)).toBe("lointain");
  });
});

describe("classerVerification", () => {
  const planifiee = (datePrevue: Date) => ({
    statut: "planifiee",
    datePrevue,
    dateRealisee: null,
  });

  it("suit la fenêtre pour une occurrence planifiée", () => {
    expect(classerVerification(planifiee(jours(-3)), NOW)).toBe("enRetard");
    expect(classerVerification(planifiee(jours(10)), NOW)).toBe("proche");
    expect(classerVerification(planifiee(jours(200)), NOW)).toBe("lointain");
  });

  it("« à planifier » n'est jamais classé par sa date", () => {
    // Sa date est une date de génération, pas un rendez-vous : passée ou
    // future, elle ne doit produire ni retard ni proche.
    expect(
      classerVerification(
        { statut: "a_planifier", datePrevue: jours(-40), dateRealisee: null },
        NOW,
      ),
    ).toBe("aPlanifier");
  });

  it("une vérification réalisée n'est jamais en retard", () => {
    expect(
      classerVerification(
        {
          statut: "realisee_conforme",
          datePrevue: jours(-40),
          dateRealisee: jours(-2),
        },
        NOW,
      ),
    ).toBe("faite");
    // Statut réalisé sans dateRealisee renseignée : le statut suffit.
    expect(
      classerVerification(
        {
          statut: "realisee_ecart_majeur",
          datePrevue: jours(-40),
          dateRealisee: null,
        },
        NOW,
      ),
    ).toBe("faite");
  });

  it("le statut « depassee » l'emporte même sur une date future", () => {
    // Une occurrence marquée dépassée en base reste un retard, quelle que
    // soit la date affichée — même règle que `estVerificationEnRetard`.
    expect(
      classerVerification(
        { statut: "depassee", datePrevue: jours(5), dateRealisee: null },
        NOW,
      ),
    ).toBe("enRetard");
  });
});
