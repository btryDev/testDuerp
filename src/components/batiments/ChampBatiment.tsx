import { Label } from "@/components/ui/label";

/**
 * Le champ « Bâtiment » des formulaires à rattachement optionnel — permis
 * de feu, plan de prévention, point de relevé (ADR-019).
 *
 * Rien n'est rendu en mono-bâtiment : le formulaire ne change pas tant que
 * la question n'a pas de sens. À partir de deux, un select avec « Tout
 * l'établissement » en première option, qui vaut « non précisé ».
 */
export function ChampBatiment({
  batiments,
  defaultValue,
  erreur,
  aide,
}: {
  batiments: { id: string; nom: string }[];
  defaultValue?: string | null;
  erreur?: string;
  aide?: string;
}) {
  if (batiments.length < 2) return null;
  return (
    <div className="space-y-1.5">
      <Label htmlFor="batimentId">Bâtiment</Label>
      <select
        id="batimentId"
        name="batimentId"
        defaultValue={defaultValue ?? ""}
        className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
        aria-invalid={Boolean(erreur)}
      >
        <option value="">Non précisé</option>
        {batiments.map((b) => (
          <option key={b.id} value={b.id}>
            {b.nom}
          </option>
        ))}
      </select>
      {aide ? (
        <p className="text-[0.82rem] text-muted-foreground">{aide}</p>
      ) : null}
      {erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}
    </div>
  );
}
