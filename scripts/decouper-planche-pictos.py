#!/usr/bin/env python3
"""Découpe la planche de pictos équipements en un PNG par picto.

Usage :
    python3 scripts/decouper-planche-pictos.py [chemin/planche.png]

La planche est un PNG à fond transparent. Les icônes sont détectées par
projection du canal alpha (bandes horizontales = rangées, puis bandes
verticales dans chaque rangée = icônes), ce qui tolère un placement
irrégulier. Chaque icône est rognée à son contenu, centrée dans un canevas
carré avec une marge, puis écrite dans public/pictos/equipements/<slug>.png.

L'ordre des slugs ci-dessous doit suivre l'ordre de lecture de la planche
(gauche → droite, haut → bas). INSTALLATION_ELECTRIQUE et AUTRE n'ont pas
encore de picto sur la planche.
"""

import sys
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
PLANCHE_DEFAUT = REPO / "planche picto.png"
SORTIE = REPO / "public" / "pictos" / "equipements"

# Ordre de lecture de la planche → slug de fichier (aligné sur
# CategorieEquipement, en kebab-case).
SLUGS = [
    # Rangée 1
    "extincteur",
    "baes",
    "alarme-incendie",
    "desenfumage",
    "vmc",
    # Rangée 2
    "cta",
    "hotte-pro",
    "appareil-cuisson-erp",
    "ascenseur",
    "porte-auto",
    # Rangée 3
    "portail-auto",
    "equipement-sous-pression",
    "stockage-matiere-dangereuse",
    "equipement-levage",
]

# Une ligne/colonne est « vide » si son alpha max est sous ce seuil.
SEUIL_ALPHA = 8
# Un bloc de moins de N px est du bruit, pas une icône.
TAILLE_MIN = 40
# Marge autour de l'icône dans le canevas final (fraction du côté).
MARGE = 0.06


def bandes(profil: list[bool], taille_min: int) -> list[tuple[int, int]]:
    """Intervalles [debut, fin) des plages consécutives à True."""
    res, debut = [], None
    for i, plein in enumerate([*profil, False]):
        if plein and debut is None:
            debut = i
        elif not plein and debut is not None:
            if i - debut >= taille_min:
                res.append((debut, i))
            debut = None
    return res


def main() -> None:
    chemin = Path(sys.argv[1]) if len(sys.argv) > 1 else PLANCHE_DEFAUT
    img = Image.open(chemin).convert("RGBA")
    alpha = img.getchannel("A")
    px = alpha.load()
    l, h = img.size

    lignes_pleines = [
        any(px[x, y] > SEUIL_ALPHA for x in range(l)) for y in range(h)
    ]
    rangées = bandes(lignes_pleines, TAILLE_MIN)

    crops: list[Image.Image] = []
    for y0, y1 in rangées:
        cols_pleines = [
            any(px[x, y] > SEUIL_ALPHA for y in range(y0, y1)) for x in range(l)
        ]
        for x0, x1 in bandes(cols_pleines, TAILLE_MIN):
            crop = img.crop((x0, y0, x1, y1))
            crop = crop.crop(crop.getbbox())
            crops.append(crop)

    if len(crops) != len(SLUGS):
        raise SystemExit(
            f"{len(crops)} icônes détectées, {len(SLUGS)} attendues — "
            "ajuster SEUIL_ALPHA/TAILLE_MIN ou la liste SLUGS."
        )

    SORTIE.mkdir(parents=True, exist_ok=True)
    for slug, crop in zip(SLUGS, crops):
        cote = round(max(crop.size) * (1 + 2 * MARGE))
        canevas = Image.new("RGBA", (cote, cote), (0, 0, 0, 0))
        canevas.paste(
            crop,
            ((cote - crop.width) // 2, (cote - crop.height) // 2),
        )
        dest = SORTIE / f"{slug}.png"
        canevas.save(dest)
        print(f"{dest.relative_to(REPO)}  ({cote}×{cote})")


if __name__ == "__main__":
    main()
