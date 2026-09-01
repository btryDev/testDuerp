import { CORPUS } from "../src/lib/referentiels/corpus";
import { obligationsConformite } from "../src/lib/referentiels/conformite";
const cites = new Set(obligationsConformite.flatMap(o=>o.referencesLegales.map(r=>r.article).filter((a): a is string => Boolean(a))));
for (const c of CORPUS) {
  const n = c.articles.filter(a=>!cites.has(a.ref)).length;
  if (n) console.log(`${c.id}: ${n}/${c.articles.length} jamais cités  (luLe ${[...new Set(c.articles.map(a=>a.luLe))].join(",")})`);
}
