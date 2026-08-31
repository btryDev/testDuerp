// Illustration SVG du hero — empile 3 documents de conformité
//
// ⚠ AUCUNE VALEUR CHIFFRÉE ICI, ET C'EST UNE RÈGLE, PAS UN OUBLI.
// Cette illustration a porté « v3 · 04/26 » sur le tampon et « 22 juin » sur
// le post-it. Décoratives dans l'intention, elles se lisaient comme des
// données : sur un dossier créé depuis dix minutes, l'en-tête du guide
// affichait une version validée et une échéance datée que le dossier n'avait
// pas — et la section suivante promet « calculé depuis votre dossier ».
//
// `aria-hidden` protège les lecteurs d'écran, pas les yeux. Un dirigeant ne
// distingue pas un chiffre dessiné d'un chiffre calculé, et c'est la famille de
// défaut que ce dépôt refuse le plus fermement — la même que l'extrait
// réglementaire fabriqué retiré la semaine dernière.
//
// La règle : soit une valeur se calcule depuis le dossier, soit elle
// n'apparaît pas. Les libellés génériques restent — « VALIDÉ », « ÉCHÉANCE »
// nomment une nature de document, ils n'affirment rien sur celui du lecteur.
// Les traits qui remplacent la date jouent le rôle graphique qu'elle tenait.
// (Plan d'actions derrière, Registre au milieu, DUERP devant) sur un
// fond radial vert pâle avec grille fine. Badge Code du travail,
// post-it échéance, trombone. Décorative — aria-hidden.
//
// Basée sur la description du HANDOFF-guide.md §1. Le SVG est dessiné
// à la main plutôt qu'importé pour rester léger et aligné sur les
// tokens CSS (palette papier éditoriale).

export function IllustrationDocuments() {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-[440/420] w-full max-w-[440px]"
    >
      <svg
        viewBox="0 0 440 420"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="g-hero-bg" cx="65%" cy="30%" r="80%">
            <stop offset="0%" stopColor="var(--board-green)" />
            <stop offset="60%" stopColor="var(--board-green)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--board-canvas)" stopOpacity="0" />
          </radialGradient>
          <pattern id="g-hero-grid" width="44" height="42" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 42" fill="none" stroke="var(--board-slate-line)" strokeWidth="0.5" opacity="0.6" />
          </pattern>
          <filter id="g-hero-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--board-ink)" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Fond */}
        <rect width="440" height="420" fill="url(#g-hero-bg)" />
        <rect width="440" height="420" fill="url(#g-hero-grid)" />

        {/* ═══ Document 1 — Plan d'actions (arrière, rot +8°) ═══ */}
        <g transform="rotate(8 120 260) translate(50 120)" filter="url(#g-hero-shadow)">
          <rect width="220" height="260" rx="6" fill="var(--board-card)" stroke="var(--board-slate)" strokeWidth="0.8" />
          {/* Barre latérale */}
          <rect x="0" y="0" width="6" height="260" fill="var(--board-signal-ink)" />
          {/* Kicker mono */}
          <rect x="22" y="22" width="98" height="5" rx="2" fill="var(--board-slate-mid)" opacity="0.4" />
          {/* Titre */}
          <rect x="22" y="42" width="150" height="9" rx="3" fill="var(--board-ink)" opacity="0.85" />
          <rect x="22" y="58" width="120" height="9" rx="3" fill="var(--board-ink)" opacity="0.85" />
          {/* 3 puces */}
          {[0, 1, 2].map((i) => {
            const colors = ["var(--board-signal-ink)", "var(--board-blue-ink)", "var(--board-green-ink)"];
            const y = 95 + i * 42;
            return (
              <g key={i}>
                <circle cx="30" cy={y} r="4.5" fill={colors[i]} />
                <rect x="44" y={y - 3} width="150" height="6" rx="2.5" fill="var(--board-ink)" opacity="0.5" />
                <rect x="44" y={y + 8} width="120" height="4" rx="2" fill="var(--board-slate-mid)" opacity="0.4" />
              </g>
            );
          })}
          {/* Footer */}
          <rect x="22" y="230" width="60" height="5" rx="2" fill="var(--board-slate-mid)" opacity="0.3" />
        </g>

        {/* ═══ Document 2 — Registre (milieu, rot -4°) ═══ */}
        <g transform="rotate(-4 240 215) translate(150 85)" filter="url(#g-hero-shadow)">
          <rect width="240" height="280" rx="6" fill="var(--board-card)" stroke="var(--board-slate)" strokeWidth="0.8" />
          <rect x="0" y="0" width="6" height="280" fill="var(--board-ink)" />
          <rect x="22" y="22" width="110" height="5" rx="2" fill="var(--board-slate-mid)" opacity="0.4" />
          <rect x="22" y="42" width="160" height="9" rx="3" fill="var(--board-ink)" opacity="0.85" />
          {/* Tableau 5 lignes */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 80 + i * 32;
            return (
              <g key={i}>
                <line x1="22" y1={y} x2="218" y2={y} stroke="var(--board-slate-line)" strokeWidth="0.5" strokeDasharray="2 3" />
                <rect x="22" y={y + 8} width="60" height="4" rx="2" fill="var(--board-slate-mid)" opacity="0.5" />
                <rect x="92" y={y + 8} width="80" height="4" rx="2" fill="var(--board-ink)" opacity="0.55" />
                {/* Colonne statut : vert pâle pour lignes paires */}
                {i % 2 === 0 ? (
                  <>
                    <rect x="186" y={y + 4} width="28" height="12" rx="6" fill="var(--board-green)" />
                    <path
                      d={`M ${192} ${y + 10} L ${197} ${y + 14} L ${208} ${y + 6}`}
                      fill="none"
                      stroke="var(--board-green-ink)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <rect x="186" y={y + 4} width="28" height="12" rx="6" fill="var(--board-slate-pale)" />
                )}
              </g>
            );
          })}
          <rect x="22" y="250" width="80" height="5" rx="2" fill="var(--board-slate-mid)" opacity="0.3" />
        </g>

        {/* ═══ Document 3 — DUERP (avant, sans rot) ═══ */}
        <g transform="translate(110 60)" filter="url(#g-hero-shadow)">
          {/* Corps avec coin replié en haut à droite */}
          <path
            d="M 0 0 L 200 0 L 230 22 L 230 300 L 0 300 Z"
            fill="var(--board-card)"
            stroke="var(--board-slate)"
            strokeWidth="0.8"
          />
          {/* Pli de coin */}
          <path
            d="M 200 0 L 230 22 L 200 22 Z"
            fill="var(--board-slate-pale)"
            stroke="var(--board-slate)"
            strokeWidth="0.5"
          />

          {/* Kicker */}
          <rect x="22" y="26" width="90" height="5" rx="2" fill="var(--board-green-ink)" opacity="0.7" />
          {/* Titre */}
          <rect x="22" y="46" width="160" height="11" rx="3" fill="var(--board-ink)" />
          <rect x="22" y="64" width="110" height="8" rx="3" fill="var(--board-ink)" opacity="0.55" />

          {/* Matrice de risques 4×4 */}
          <g transform="translate(22 98)">
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => {
                const criticity = row + col;
                let fill = "var(--board-slate-pale)";
                if (criticity >= 5) fill = "color-mix(in oklch, var(--board-signal-ink) 25%, transparent)";
                else if (criticity >= 3) fill = "color-mix(in oklch, var(--board-blue-ink) 20%, transparent)";
                else if (criticity >= 2) fill = "var(--board-green)";
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={col * 34}
                    y={row * 34}
                    width="30"
                    height="30"
                    rx="2"
                    fill={fill}
                    stroke="var(--board-slate-line)"
                    strokeWidth="0.5"
                  />
                );
              }),
            )}
          </g>

          {/* Ligne de signature manuscrite */}
          <path
            d="M 22 256 q 8 -10 18 -4 t 14 2 q 8 -8 14 0 t 12 -2 q 4 -6 10 0"
            fill="none"
            stroke="var(--board-ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line x1="22" y1="272" x2="110" y2="272" stroke="var(--board-slate)" strokeWidth="0.5" strokeDasharray="2 3" />
          <rect x="22" y="278" width="40" height="4" rx="2" fill="var(--board-slate-mid)" opacity="0.4" />

          {/* Tampon circulaire */}
          <g transform="translate(180 210)">
            <circle
              cx="0"
              cy="0"
              r="28"
              fill="none"
              stroke="var(--board-green-ink)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.7"
            />
            <circle cx="0" cy="0" r="22" fill="var(--board-green)" />
            <text
              x="0"
              y="-2"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="6"
              fill="var(--board-green-ink)"
              letterSpacing="1.5"
              fontWeight="600"
            >
              VALIDÉ
            </text>
            {/* Ici vivait « v3 · 04/26 » — une version et une date que le
                dossier du lecteur n'a pas. Un trait tient la place. */}
            <line
              x1="-9"
              y1="7"
              x2="9"
              y2="7"
              stroke="var(--board-green-ink)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
        </g>

        {/* ═══ Trombone sur le DUERP ═══ */}
        <g
          transform="rotate(-20 130 70) translate(118 50)"
          opacity="0.85"
          fill="none"
          stroke="var(--board-blue-ink)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M 0 0 L 0 30 Q 0 38 8 38 Q 16 38 16 30 L 16 6 Q 16 0 10 0 Q 4 0 4 6 L 4 26" />
        </g>

        {/* ═══ Post-it échéance ═══ */}
        <g transform="rotate(6 340 95) translate(300 50)" filter="url(#g-hero-shadow)">
          <rect
            width="92"
            height="72"
            rx="2"
            fill="color-mix(in oklch, var(--board-blue-ink) 35%, var(--board-card))"
          />
          <text
            x="12"
            y="22"
            fontFamily="var(--font-mono)"
            fontSize="6.5"
            fill="var(--board-ink)"
            letterSpacing="1.8"
            fontWeight="600"
            opacity="0.7"
          >
            ÉCHÉANCE
          </text>
          {/* Ici vivait « 22 juin » — une échéance datée que le dossier du
              lecteur n'a pas. Deux traits manuscrits tiennent la place. */}
          <line
            x1="12"
            y1="42"
            x2="62"
            y2="42"
            stroke="var(--board-ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <line
            x1="12"
            y1="50"
            x2="44"
            y2="50"
            stroke="var(--board-ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.32"
          />
          <text
            x="12"
            y="62"
            fontFamily="var(--font-mono)"
            fontSize="6"
            fill="var(--board-slate-mid)"
            letterSpacing="1"
          >
            vérif. annuelle
          </text>
        </g>

        {/* ═══ Badge Code du travail ═══ */}
        <g transform="translate(255 365)">
          <rect width="170" height="36" rx="18" fill="var(--board-ink)" />
          <text
            x="22"
            y="15"
            fontFamily="var(--font-mono)"
            fontSize="6.5"
            fill="var(--board-green-ink)"
            letterSpacing="1.8"
            fontWeight="600"
          >
            § CODE DU TRAVAIL
          </text>
          <text
            x="22"
            y="28"
            fontFamily="var(--font-mono)"
            fontSize="8"
            fill="var(--board-card)"
            letterSpacing="0.6"
            fontWeight="500"
          >
            Art. L. 4121-1
          </text>
        </g>
      </svg>
    </div>
  );
}
