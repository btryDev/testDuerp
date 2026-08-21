// Une catégorie du parc, et les appareils qu'elle contient.
//
// Le regroupement par catégorie existait déjà : ce qui manquait, c'est
// l'état. Une carte de cinq extincteurs dont un est en retard doit se voir
// avant d'être lue — d'où la jauge en tête, un segment par appareil,
// coloré par les jetons d'état du board. Elle ne mesure rien : elle compte.

import Link from "next/link";
import { LigneFiche, LignesFiche, TuileDate, TuileMuette } from "@/components/ui-kit";
import { PictoEquipement } from "@/components/equipements/PictoEquipement";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { LABEL_PERIODICITE } from "@/lib/calendrier/labels";
import { CHAMP_ETAT, PRIORITE_ETAT, type RegistreLigne } from "@/lib/calendrier/etats";
import type { ResumeEquipement } from "@/lib/equipements/etat-verifications";
import type {
  CategorieEquipement,
  Periodicite,
} from "@/lib/referentiels/types-communs";

export type AppareilListe = {
  id: string;
  libelle: string;
  localisation: string | null;
  resume: ResumeEquipement;
  href: string;
};

/** Ordre d'affichage des segments : le plus urgent en tête. */
const ORDRE: RegistreLigne[] = [
  "enRetard",
  "aPlanifier",
  "proche",
  "lointain",
  "faite",
];

function Jauge({ etats }: { etats: RegistreLigne[] }) {
  const compte = new Map<RegistreLigne, number>();
  for (const e of etats) compte.set(e, (compte.get(e) ?? 0) + 1);
  const segments = ORDRE.filter((e) => compte.has(e));
  if (segments.length === 0) return null;

  return (
    <span
      aria-hidden
      className="flex h-2 w-[180px] flex-none gap-[3px]"
    >
      {segments.map((e) => (
        <span
          key={e}
          className="h-full rounded-full"
          style={{ flex: compte.get(e), background: CHAMP_ETAT[e] }}
        />
      ))}
    </span>
  );
}

/**
 * Le voile d'une ligne : le retard et l'imminence se voient sur la ligne
 * entière, le reste reste au calme. `aPlanifier` n'en porte pas — une
 * occurrence sans date convenue n'est pas une urgence, c'est un rendez-vous
 * à prendre.
 */
function voileDe(etat: RegistreLigne): "retard" | "proche" | "aucun" {
  if (etat === "enRetard") return "retard";
  if (etat === "proche") return "proche";
  return "aucun";
}

export function CarteCategorie({
  categorie,
  appareils,
  periodicites,
}: {
  categorie: CategorieEquipement;
  appareils: AppareilListe[];
  /** Les rythmes réellement portés par les lignes de suivi générées. */
  periodicites: Periodicite[];
}) {
  // Une installation électrique porte à elle seule quatre rythmes : les
  // énumérer transformait le sur-titre en liste de courses. Au-delà de
  // deux, on annonce le nombre — le détail est sur la fiche.
  const rythmes = [
    ...new Set(periodicites.map((p) => LABEL_PERIODICITE[p])),
  ];
  const rythme =
    rythmes.length === 0
      ? null
      : rythmes.length <= 2
        ? `vérification ${rythmes.join(" et ")}`
        : `${rythmes.length} rythmes de vérification`;

  return (
    <section className="carte-board overflow-hidden">
      <div className="flex items-center gap-4 px-7 pt-6 sm:px-8">
        <span className="grid size-11 flex-none place-items-center rounded-[15px] bg-[color:var(--board-slate-pale)]">
          <PictoEquipement categorie={categorie} taille={30} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="board-titre m-0 text-[22px]">
            {LABEL_CATEGORIE_EQUIPEMENT[categorie]}
          </h2>
          <p className="board-eyebrow m-0 mt-1 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
            {appareils.length} équipement{appareils.length > 1 ? "s" : ""}
            {rythme ? ` · ${rythme}` : null}
          </p>
        </div>
        <Jauge etats={appareils.map((a) => a.resume.etat)} />
      </div>

      <div className="mt-4">
        <LignesFiche>
          {appareils.map((a) => (
            <LigneFiche
              key={a.id}
              voile={voileDe(a.resume.etat)}
              tuile={
                a.resume.date ? (
                  <TuileDate date={a.resume.date} etat={a.resume.etat} />
                ) : (
                  <TuileMuette>à dater</TuileMuette>
                )
              }
              titre={a.libelle}
              detail={
                <>
                  {a.localisation ?? "Localisation non précisée"}
                  <span className="mx-1.5 text-[color:var(--board-slate)]">
                    ·
                  </span>
                  {a.resume.phrase}
                </>
              }
              droite={
                <Link
                  href={a.href}
                  className={cn(
                    buttonVariants({
                      variant: "boardClair",
                      size: "boardSm",
                      className:
                        a.resume.etat === "enRetard" ||
                        a.resume.etat === "proche"
                          ? "bg-white"
                          : "",
                    }),
                  )}
                >
                  Voir la fiche
                </Link>
              }
            />
          ))}
        </LignesFiche>
      </div>
    </section>
  );
}

/** Rangs d'urgence, pour trier les cartes : la catégorie la plus en peine
 *  se lit en premier. Exporté pour que la page trie sans redéfinir l'échelle. */
export function urgenceCategorie(appareils: AppareilListe[]): number {
  return appareils.reduce((max, a) => {
    const e = a.resume.etat;
    const rang = e === "aPlanifier" ? 1.5 : PRIORITE_ETAT[e];
    return Math.max(max, rang);
  }, 0);
}
