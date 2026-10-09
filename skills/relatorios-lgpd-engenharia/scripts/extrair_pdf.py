import argparse
import os
import sys


def carregar(pylib):
    for caminho in (pylib, os.environ.get("RELATORIO_PYLIB")):
        if caminho and os.path.isdir(caminho):
            sys.path.insert(0, caminho)
    try:
        import pymupdf
        return pymupdf
    except ImportError:
        try:
            import fitz
            return fitz
        except ImportError:
            sys.exit("Instale o PyMuPDF: pip install pymupdf (ou --target <pasta> e passe --pylib <pasta>).")


def main():
    p = argparse.ArgumentParser(description="Extrai o texto de uma norma em PDF para citar por arquivo:linha.")
    p.add_argument("pdf")
    p.add_argument("saida", help="arquivo .txt em UTF-8")
    p.add_argument("--pylib")
    a = p.parse_args()

    mod = carregar(a.pylib)
    doc = mod.open(a.pdf)
    linhas = []
    for i, pagina in enumerate(doc, start=1):
        linhas.append(f"=== página {i} ===")
        for linha in pagina.get_text("text").splitlines():
            linha = " ".join(linha.split())
            if linha:
                linhas.append(linha)
    texto = "\n".join(linhas) + "\n"
    open(a.saida, "w", encoding="utf-8", newline="\n").write(texto)
    vazias = sum(1 for pagina in doc if not pagina.get_text("text").strip())
    print(f"{a.pdf}: {len(doc)} páginas, {len(linhas)} linhas, {vazias} página(s) sem texto")
    if vazias:
        print("aviso: página sem texto costuma ser imagem escaneada; o texto dela não pode ser citado entre aspas sem OCR conferido")


if __name__ == "__main__":
    main()
