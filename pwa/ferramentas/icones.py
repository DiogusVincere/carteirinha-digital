"""Gera os ícones da PWA (PNG) e o favicon (SVG): um cartão com foto e linhas, sobre o verde do tema.

    python ferramentas/icones.py
"""
import os
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(os.path.abspath(__file__)).parent.parent
ICONES = RAIZ / "icons"
VERDE, VERDE_ESCURO, LIMA, BRANCO = "#0F766E", "#0B5A54", "#B8E952", "#FFFFFF"


def desenhar(tamanho: int, margem_rel: float, fundo_arredondado: bool) -> Image.Image:
    im = Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if fundo_arredondado:
        d.rounded_rectangle((0, 0, tamanho - 1, tamanho - 1), radius=int(tamanho * 0.22), fill=VERDE)
    else:
        d.rectangle((0, 0, tamanho, tamanho), fill=VERDE)
    m = tamanho * margem_rel
    # o cartão
    x0, y0, x1, y1 = m, tamanho * 0.5 - (tamanho - 2 * m) * 0.63 / 2, tamanho - m, tamanho * 0.5 + (tamanho - 2 * m) * 0.63 / 2
    d.rounded_rectangle((x0, y0, x1, y1), radius=int(tamanho * 0.06), fill=BRANCO)
    largura, altura = x1 - x0, y1 - y0
    # faixa da instituição
    d.rounded_rectangle((x0, y0, x1, y0 + altura * 0.22), radius=int(tamanho * 0.06), fill=VERDE_ESCURO)
    d.rectangle((x0, y0 + altura * 0.12, x1, y0 + altura * 0.22), fill=VERDE_ESCURO)
    # foto
    fx0, fy0 = x0 + largura * 0.07, y0 + altura * 0.32
    fx1, fy1 = fx0 + largura * 0.24, fy0 + altura * 0.52
    d.rounded_rectangle((fx0, fy0, fx1, fy1), radius=int(tamanho * 0.02), fill="#CFE3DD")
    cx, cy = (fx0 + fx1) / 2, fy0 + (fy1 - fy0) * 0.38
    r = (fx1 - fx0) * 0.2
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=VERDE)
    d.chord((fx0 + (fx1 - fx0) * 0.12, fy0 + (fy1 - fy0) * 0.55, fx1 - (fx1 - fx0) * 0.12, fy1 + (fy1 - fy0) * 0.3), 180, 360, fill=VERDE)
    # linhas de texto
    lx = fx1 + largura * 0.07
    for i, (comp, cor) in enumerate([(0.55, "#1F2E2B"), (0.42, "#6B7D78"), (0.34, "#6B7D78")]):
        ly = y0 + altura * (0.36 + i * 0.14)
        d.rounded_rectangle((lx, ly, lx + largura * comp, ly + altura * 0.07), radius=int(tamanho * 0.012), fill=cor)
    # selo lima
    sr = tamanho * 0.045
    sx, sy = x1 - largura * 0.1, y1 - altura * 0.17
    d.ellipse((sx - sr, sy - sr, sx + sr, sy + sr), fill=LIMA)
    return im


def main() -> None:
    ICONES.mkdir(exist_ok=True)
    desenhar(512, 0.12, True).save(ICONES / "icone-512.png", optimize=True)
    desenhar(512, 0.12, True).resize((192, 192), Image.LANCZOS).save(ICONES / "icone-192.png", optimize=True)
    desenhar(512, 0.2, False).save(ICONES / "maskable-512.png", optimize=True)
    favicon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="14" fill="#0F766E"/>'
        '<rect x="10" y="20" width="44" height="28" rx="5" fill="#fff"/>'
        '<rect x="10" y="20" width="44" height="8" rx="4" fill="#0B5A54"/><rect x="10" y="24" width="44" height="4" fill="#0B5A54"/>'
        '<rect x="14" y="31" width="10" height="13" rx="2" fill="#CFE3DD"/>'
        '<rect x="28" y="32" width="20" height="3" rx="1.5" fill="#1F2E2B"/><rect x="28" y="38" width="14" height="3" rx="1.5" fill="#6B7D78"/>'
        '<circle cx="48" cy="44" r="3" fill="#B8E952"/></svg>'
    )
    (ICONES / "favicon.svg").write_text(favicon, encoding="utf-8")
    print("ícones gravados em", ICONES)


if __name__ == "__main__":
    main()
