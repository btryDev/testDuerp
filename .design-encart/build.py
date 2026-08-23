# Les deux planches à widget. (Main.dc.html est la planche C remise en
# l'état ; elle n'est pas régénérée ici.)
#
# LE WIDGET est la carte « Votre semaine » du hero de la page publique
# (HeroBrief.tsx), reprise telle quelle : titre + mois en mono, la semaine
# en sept cases, un point de couleur sous les jours qui portent quelque
# chose, puis l'échéance nommée sous un filet. Rien n'est inventé — les
# jours, les couleurs et « Jeu. 12 · Vérification électrique annuelle »
# viennent du composant.
#
# C'est un calendrier, et il nomme le travail à faire : « prochaine
# échéance » ne disait ni quand ni quoi.
#
# POSITION : la carte est posée SUR la photo, alignée sur son bord droit,
# et ne déborde que vers la gauche, de 28 px. Rien ne dépasse à droite.
# Le flashcode reste en bas à droite.
import pathlib

FONTS = pathlib.Path('fonts.css').read_text()
QR = pathlib.Path('qr.svg').read_text().replace(
    '<svg ', '<svg style="display:block;width:100%;height:100%" ', 1)

TITRE = "'Instrument Sans', system-ui, sans-serif"
TEXTE = "'IBM Plex Sans', system-ui, sans-serif"
MONO  = "'JetBrains Mono', ui-monospace, monospace"

# La semaine du hero, à l'identique.
JOURS = [('L', '9', 'retard', False), ('M', '10', None, False), ('M', '11', None, True),
         ('J', '12', 'proche', False), ('V', '13', 'fait', False), ('S', '14', None, False),
         ('D', '15', None, False)]
CHAMP = {'retard': '#ff9d9e', 'proche': '#fff3ba', 'fait': '#bdfdb5'}

def case(lettre, chiffre, marque, aujourdhui):
    fond, encre = ('#0a0a0a', '#ffffff') if aujourdhui else ('#edf2f5', '#304148')
    point = CHAMP.get(marque, 'transparent')
    return (f'<div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">'
            f'<span style="font-family: {MONO}; font-size: 12px; font-weight: 500; color: #5c7182; line-height: 1;">{lettre}</span>'
            f'<span style="width: 100%; height: 18px; display: flex; align-items: center; justify-content: center; '
            f'border-radius: 6px; background: {fond}; color: {encre}; font-family: {TITRE}; font-size: 12px; '
            f'font-weight: 600; line-height: 1;">{chiffre}</span>'
            f'<span style="width: 5px; height: 5px; border-radius: 50%; background: {point};"></span></div>')

WIDGET = (
    '<div style="background: #ffffff; border-radius: 18px; padding: 10px 10px 9px; '
    'box-shadow: 0 0 0 1px rgba(13,18,36,0.05), 0 14px 28px -16px rgba(13,18,36,0.45);">'
    '<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding-bottom: 8px;">'
    f'<span style="font-family: {TITRE}; font-size: 12px; font-weight: 600; letter-spacing: -0.02em; color: #0a0a0a; line-height: 1;">Votre semaine</span>'
    f'<span style="font-family: {MONO}; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #5c7182; line-height: 1;">Août</span>'
    '</div>'
    '<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px;">'
    + ''.join(case(*j) for j in JOURS) +
    '</div>'
    '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(10,10,10,0.08); '
    'display: flex; align-items: flex-start; gap: 6px;">'
    '<span style="width: 6px; height: 6px; border-radius: 50%; background: #fff3ba; flex: none; margin-top: 4px;"></span>'
    f'<span style="font-size: 12px; line-height: 1.3; color: #4d5d6b;">'
    '<span style="font-weight: 600; color: #0a0a0a;">Jeu. 12</span> · Vérification électrique annuelle</span>'
    '</div></div>')

def planche(noir):
    fond   = '#0a0a0a' if noir else '#f6f9fb'
    encre  = '#ffffff' if noir else '#0a0a0a'
    second = 'rgba(255,255,255,0.82)' if noir else '#4d5d6b'
    filet  = 'rgba(255,255,255,0.18)' if noir else '#dbe6ee'
    bleu   = '#b2daf2' if noir else '#062e6e'   # sur fond noir, le ciel EST le degré vif
    cerne  = '' if noir else 'box-shadow: inset 0 0 0 1px #dbe6ee; '
    return f"""<div style="width: 340px; height: 227px; box-sizing: border-box; position: relative; overflow: hidden; background: {fond}; {cerne}font-family: {TEXTE}; color: {encre};">

  <img src="photo-terrain.jpg" style="position: absolute; right: 0; top: 0; width: 165px; height: 227px; object-fit: cover; object-position: 42% 62%; transform: scaleX(-1); display: block;">

  <div style="position: absolute; left: 15px; top: 14px; width: 150px;">
    <span style="display: flex; align-items: baseline; gap: 3px; font-family: {TITRE}; font-size: 14px; font-weight: 600; letter-spacing: -0.03em; line-height: 1; color: {encre};">Rojer<span style="width: 5px; height: 5px; border-radius: 50%; background: {bleu}; display: inline-block;"></span></span>
    <div style="height: 1px; background: {filet}; margin: 9px 0;"></div>
    <div style="font-family: {TITRE}; font-size: 15px; font-weight: 600; letter-spacing: -0.032em; line-height: 1.13; color: {encre};">Concentrez-vous sur<br>votre activité.</div>
    <div style="margin-top: 9px; font-size: 12px; line-height: 1.35; color: {second};"><span style="color: {bleu};">Rojer</span> coordonne la prévention des risques de votre structure.</div>
  </div>

  <div style="position: absolute; left: 15px; bottom: 13px; font-family: {TEXTE}; font-size: 12px; line-height: 1; color: {bleu};">rojer.fr</div>

  <div style="position: absolute; right: 8px; top: 12px; width: 150px;">{WIDGET}</div>

  <div style="position: absolute; right: 9px; bottom: 9px; width: 50px; height: 50px; padding: 3px; box-sizing: border-box; background: #ffffff; border-radius: 4px;">{QR}</div>

</div>"""

def page(corps, fond, lien, survol):
    return (f'<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8">\n'
            f'  <script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n  <style>\n{FONTS}\n'
            f'    body {{ margin: 0; background: {fond}; }}\n'
            f'    a {{ color: {lien}; text-decoration: none; }}\n'
            f'    a:hover {{ color: {survol}; }}\n  </style>\n</helmet>\n{corps}\n</x-dc>\n</body>\n</html>\n')

for nom, noir in [('OptionD.dc.html', True), ('OptionDbis.dc.html', False)]:
    pathlib.Path(nom).write_text(page(planche(noir), '#0a0a0a' if noir else '#f6f9fb',
                                      '#b2daf2' if noir else '#062e6e',
                                      '#ffffff' if noir else '#0a0a0a'))
    print(nom, pathlib.Path(nom).stat().st_size // 1024, 'Kio')
