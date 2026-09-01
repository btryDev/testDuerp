// Les documents obligatoires — y compris ceux que Rojer ne produit pas.
//
// L'écran que demande l'ADR-025 § 8, côté « documentation ». Il vivait comme
// une section du guide, faute d'endroit où le ranger ; l'axe Documentation lui
// en donne un (ADR-030).
//
// La page n'ajoute rien au contenu : elle monte le même composant, qui projette
// `referentiels/documents-obligatoires.ts`. Recopier la liste ici en ferait une
// seconde source de vérité, et c'est exactement ce que le référentiel existe
// pour empêcher — un document dont le fondement diverge d'un écran à l'autre
// est pire qu'un document absent.
//
// Le guide n'en garde donc pas de copie : il y renvoie.

import { DocumentsObligatoires } from "@/components/guide/DocumentsObligatoires";
import { requireEtablissement } from "@/lib/auth/scope";

export const metadata = {
  title: "Documents obligatoires — Rojer",
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireEtablissement(id);

  return (
    <main className="min-h-screen bg-[color:var(--board-canvas)] px-[var(--board-gutter)] py-10">
      <div className="mx-auto max-w-[var(--board-max)]">
        <DocumentsObligatoires />
      </div>
    </main>
  );
}
