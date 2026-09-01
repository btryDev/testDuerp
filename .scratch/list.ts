import { obligationsConformite } from "@/lib/referentiels/conformite/index";
import { estPorteeParSalarie } from "@/lib/referentiels/conformite/types";
const s = obligationsConformite.filter(estPorteeParSalarie);
console.log("total obligations:", obligationsConformite.length);
console.log("titres salarie:", s.length);
for (const o of s) console.log(` - ${o.id} | ${o.periodicite} | ${o.referencesLegales.map(r=>r.article??r.reference).join(", ")} | ${o.libelle}`);
