"""외치는 말풍선 사원증 아이콘(라떼, 주아) → icon.svg / logo.svg. 글자는 패스로 변환."""
import sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

font_path, out_dir = sys.argv[1], pathlib.Path(sys.argv[2])
font = TTFont(font_path)
gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm

def text_path(txt, size, cx, cy):
    s = size / upm
    # bbox를 먼저 구해 글자 묶음의 중심을 (cx, cy)에 맞춘다
    bp = BoundsPen(gs)
    x = 0
    for ch in txt:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(bp, (s, 0, 0, -s, x * s, 0)))
        x += gs[g].width
    x0, y0, x1, y1 = bp.bounds
    dx, dy = cx - (x0 + x1) / 2, cy - (y0 + y1) / 2
    sp = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip('0').rstrip('.'))
    x = 0
    for ch in txt:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(sp, (s, 0, 0, -s, dx + x * s, dy)))
        x += gs[g].width
    return sp.getCommands()

BG, INK, CR, AC, POP, TONGUE = '#F3E6D6', '#3A2A21', '#FFF8EE', '#C0794A', '#F5C9AE', '#FF7A7A'
O = lambda w=3.6: f'stroke="{INK}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'
ZOOM = 'translate(50 51) scale(1.22) translate(-50 -50)'
word = text_path('한마디', 15.5, 50, 86)

def badge(with_bg):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>한마디</title>
<defs><clipPath id="photo"><rect x="24" y="28" width="52" height="46" rx="7"/></clipPath></defs>
{f'<rect width="100" height="100" fill="{BG}"/>' if with_bg else ''}
<path d="M28 0l14 18M72 0L58 18" stroke="{AC}" stroke-width="7" stroke-linecap="round"/>
<rect x="41" y="14" width="18" height="10" rx="3" fill="{CR}" {O(3)}/>
<rect x="17" y="21" width="66" height="76" rx="10" fill="{CR}" {O()}/>
<rect x="24" y="28" width="52" height="46" rx="7" fill="{POP}"/>
<g clip-path="url(#photo)"><g transform="{ZOOM}">
<path d="M50 35.5c9.5 0 15.5 5.8 15.5 12.8S59.5 61 50 61c-1.8 0-3.5-.2-4.8-.6L37 63.5l2.4-5.8c-2.4-2.4-4.9-5.8-4.9-9.4 0-7 6-12.8 15.5-12.8z" fill="{CR}" {O(2.4)}/>
<path d="M42.5 44.5l3.6 2.2-3.6 2.2M57.5 44.5l-3.6 2.2 3.6 2.2" fill="none" {O(1.9)}/>
<ellipse cx="50" cy="54" rx="4.2" ry="4.6" fill="{INK}"/><ellipse cx="50" cy="56.6" rx="2.6" ry="1.6" fill="{TONGUE}"/>
</g></g>
<rect x="24" y="28" width="52" height="46" rx="7" fill="none" {O(3)}/>
<g transform="{ZOOM}"><path d="M68 40l4-3M69 46h5M68 52l4 3" fill="none" {O(2.2)}/></g>
<path d="{word}" fill="{INK}"/>
</svg>
'''

(out_dir / 'icon.svg').write_text(badge(True), encoding='utf-8')
(out_dir / 'logo.svg').write_text(badge(False), encoding='utf-8')
print('ok', len(word))
