import argparse
import re


def main():
    p = argparse.ArgumentParser(description="Lista Overfull hbox de um log do pdfLaTeX com o capítulo de origem.")
    p.add_argument("log", help="main.log")
    p.add_argument("--minimo", type=float, default=10.0, help="ignora excessos menores que isso, em pt")
    a = p.parse_args()

    log = open(a.log, encoding="latin-1").read()
    aberturas = [(m.start(), m.group(1)) for m in re.finditer(r"\((\./[^\s)]+\.tex)", log)]
    padrao = r"Overfull \\hbox \(([0-9.]+)pt too wide\) (?:in paragraph|in alignment|detected) at lines (\d+)--(\d+)"
    total = 0
    for m in re.finditer(padrao, log):
        excesso = float(m.group(1))
        if excesso < a.minimo:
            continue
        total += 1
        anteriores = [x for x in aberturas if x[0] < m.start()]
        arquivo = anteriores[-1][1] if anteriores else "?"
        trecho = log[m.end():m.end() + 160].replace("\n", " ")
        print(f"{excesso:6.1f}pt {arquivo}:{m.group(2)}-{m.group(3)} | {trecho[:110]}")
    print(f"{total} caixa(s) acima de {a.minimo}pt")


if __name__ == "__main__":
    main()
