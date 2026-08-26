// Le contrat entre les fiches du registre et la page qui les monte.
//
// Ces composants ne connaissent ni Prisma ni les server actions : la page
// leur passe une action déjà liée à l'établissement et à la fiche (`.bind`).
// C'est ce qui permet de les écrire et de les relire sans base — et de
// changer l'implémentation serveur sans toucher à la présentation.

import type { EtatFiche } from "@/lib/registre/actions";
import type { LigneJournal } from "@/lib/registre/schema";

// L'état de formulaire et la ligne de journal sont définis côté lib, une
// seule fois : deux définitions se seraient contredites au premier champ
// ajouté. On les réexporte pour que l'appelant n'ait qu'un import.
export type { EtatFiche, LigneJournal };

export const ETAT_INITIAL: EtatFiche = { status: "idle" };

/** La signature attendue par `useActionState`, une fois les ids bindés. */
export type ActionFiche = (
  prev: EtatFiche,
  formData: FormData,
) => Promise<EtatFiche>;
