import argparse
import os
import shutil
import subprocess
import sys


def carregar_fitz(extra):
    for caminho in extra:
        if caminho and os.path.isdir(caminho):
            sys.path.insert(0, caminho)
    try:
        import pymupdf
        return pymupdf
    except ImportError:
        pass
    try:
        import fitz
        return fitz
    except ImportError:
        return None


def main():
    p = argparse.ArgumentParser(description="Renderiza páginas de um PDF em PNG para conferência visual.")
    p.add_argument("pdf")
    p.add_argument("saida", help="pasta onde gravar p001.png, p002.png, ...")
    p.add_argument("--dpi", type=int, default=80)
    p.add_argument("--paginas", help="intervalo 1-based, ex.: 1-12")
    p.add_argument("--pylib", help="pasta com PyMuPDF instalado via pip --target, se não estiver no Python padrão")
    a = p.parse_args()

    os.makedirs(a.saida, exist_ok=True)
    inicio, fim = (None, None)
    if a.paginas:
        x, y = a.paginas.split("-")
        inicio, fim = int(x), int(y)

    fitz = carregar_fitz([a.pylib, os.environ.get("RELATORIO_PYLIB")])
    if fitz:
        doc = fitz.open(a.pdf)
        total = len(doc)
        paginas = range((inicio or 1) - 1, min(fim or total, total))
        for i in paginas:
            doc[i].get_pixmap(dpi=a.dpi).save(os.path.join(a.saida, f"p{i + 1:03d}.png"))
        print(total, "paginas;", len(paginas), "renderizadas em", a.saida)
        return

    pdftoppm = shutil.which("pdftoppm")
    if pdftoppm:
        cmd = [pdftoppm, "-png", "-r", str(a.dpi)]
        if inicio:
            cmd += ["-f", str(inicio), "-l", str(fim)]
        cmd += [a.pdf, os.path.join(a.saida, "p")]
        subprocess.run(cmd, check=True)
        print("renderizado com pdftoppm em", a.saida, "(nomes p-NN.png)")
        return

    sys.exit("Sem renderizador: rode 'pip install pymupdf' (ou 'pip install --target <pasta> pymupdf' e passe --pylib <pasta>), ou instale o poppler (pdftoppm).")


if __name__ == "__main__":
    main()
