import argparse
import glob
import os
import re
import shutil
import zipfile

LEIA_ME = r"""Como usar no Overleaf
=====================

1. No Overleaf: New Project > Upload Project > escolha este .zip.
2. Menu > Settings: Compiler = pdfLaTeX; TeX Live version = a mais recente; Main document = main.tex.
3. Clique em Recompile.

Tempo de compilacao
-------------------
O plano gratuito do Overleaf limita cada compilacao a cerca de 10 segundos. TEMPO
Se estourar:
- Use o PDF pronto que acompanha este pacote para imprimir.
- Para editar no plano gratuito, compile um capitulo por vez: em main.tex, troque os
  \input{capitulos/...} por \include{capitulos/...} e, logo depois do \usepackage do estilo,
  acrescente \includeonly{capitulos/01-...} (o capitulo que estiver editando).
  Retire o \includeonly no final para gerar o documento inteiro.
- Ou use um plano pago, ou compile localmente com TeX Live: pdflatex main.tex (duas vezes,
  para sumario e referencias).

Onde mexer
----------
- Autor, cargo, destinatario e data: no topo de main.tex.
- Texto: um arquivo por capitulo em capitulos/.
- Visual (cores, capa, caixas, fichas): o arquivo .sty.
- Figuras: figuras/diagramas (PDF vetorial) e figuras/telas (capturas com dados ficticios).
"""


def empacotar(raiz, nome, destino, segundos):
    texto = open(os.path.join(raiz, "main.tex"), encoding="utf-8").read()
    caps = [n + ".tex" for n in re.findall(r"\\(?:input|include)\{capitulos/([^}]+?)(?:\.tex)?\}", texto)]
    soltos = sorted(set(f for f in os.listdir(os.path.join(raiz, "capitulos")) if f.endswith(".tex")) - set(caps))
    if soltos:
        print(f"aviso: {nome}: fora do main.tex e fora do pacote: {soltos}")
    provisorios = []
    for f in caps:
        conteudo = open(os.path.join(raiz, "capitulos", f), encoding="utf-8").read()
        if conteudo.strip().endswith("Em elaboração."):
            provisorios.append(f)
        texto += conteudo
    if provisorios:
        raise SystemExit(f"{nome}: capítulos ainda provisórios: {provisorios}. Escreva-os ou retire-os com preparar_volumes.py --sem")
    usadas = sorted(set(re.findall(r"figuras/[\w\-/.]+\.(?:png|pdf|jpg|jpeg)", texto)))
    faltando = [u for u in usadas if not os.path.exists(os.path.join(raiz, u))]
    estilos = glob.glob(os.path.join(raiz, "*.sty"))
    destino_zip = os.path.join(destino, nome + "-overleaf.zip")
    if segundos:
        aviso = f"Este documento leva cerca de {segundos} s por passada numa maquina comum."
    else:
        aviso = "Documentos longos com figuras costumam passar desse limite."
    with zipfile.ZipFile(destino_zip, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(raiz, "main.tex"), "main.tex")
        for s in estilos:
            z.write(s, os.path.basename(s))
        for f in caps:
            z.write(os.path.join(raiz, "capitulos", f), "capitulos/" + f)
        for u in usadas:
            caminho = os.path.join(raiz, u)
            if os.path.exists(caminho):
                z.write(caminho, u)
        z.writestr("LEIA-ME.txt", LEIA_ME.replace("TEMPO", aviso))
    pdf = os.path.join(raiz, "main.pdf")
    if os.path.exists(pdf):
        shutil.copy(pdf, os.path.join(destino, nome + ".pdf"))
    else:
        print(f"aviso: {pdf} nao existe; compile antes de empacotar")
    tamanho = os.path.getsize(destino_zip) // 1024
    print(f"{nome}: {len(caps)} capitulos, {len(estilos)} .sty, {len(usadas)} figuras, faltando {faltando}, zip {tamanho} KB")
    return not faltando


def main():
    p = argparse.ArgumentParser(description="Gera o PDF final e o .zip para Overleaf de cada volume.")
    p.add_argument("--volume", action="append", nargs="+", required=True,
                   help="PASTA NOME [SEGUNDOS], ex.: --volume relatorios/lgpd Volume-I-Protecao-de-Dados 21")
    p.add_argument("--destino", required=True, help="pasta de entrega")
    a = p.parse_args()

    os.makedirs(a.destino, exist_ok=True)
    ok = True
    for partes in a.volume:
        if len(partes) not in (2, 3):
            p.error("--volume espera PASTA NOME [SEGUNDOS]")
        pasta, nome = partes[0], partes[1]
        segundos = partes[2] if len(partes) == 3 else None
        ok = empacotar(pasta, nome, a.destino, segundos) and ok
    if not ok:
        raise SystemExit("ha figuras referenciadas que nao existem")


if __name__ == "__main__":
    main()
