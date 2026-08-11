// Page d'aperçu temporaire — à supprimer.
import { TableauDeBord } from "@/components/landing/TableauDeBord";

export default function Apercu() {
  return (
    <main className="bg-[color:var(--board-card)]">
      {/* Force les blocs révélés au défilement à être visibles : en
          navigateur headless, l'IntersectionObserver ne se déclenche pas
          de façon fiable et la capture ressort vide. */}
      <style>{`.lp-reveal{opacity:1 !important;transform:none !important;}`}</style>
      <TableauDeBord />
    </main>
  );
}
