import argparse
import os
import re
import shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(AQUI, "..", "assets", "latex"))

ROTULOS = {
    "01-sumario-executivo": ("Sumário executivo", "cap:sumario"),
    "02-objeto-e-metodo": ("Objeto, escopo e método", "cap:metodo"),
    "03-o-sistema": ("O sistema e os agentes de tratamento", "cap:sistema"),
    "04-inventario-de-dados": ("Inventário de dados pessoais", "cap:inventario"),
    "05-transparencia-e-bases": ("Transparência, consentimento e registro do aceite", "cap:transparencia"),
    "06-compartilhamento": ("Compartilhamento com terceiros e transferência internacional", "cap:compartilhamento"),
    "07-direitos-e-ciclo-de-vida": ("Direitos do titular, retenção e eliminação", "cap:direitos"),
    "08-dados-sensiveis-e-terceiros": ("Dados sensíveis, dados de terceiros e sigilo", "cap:terceiros"),
    "09-inteligencia-artificial": ("Inteligência artificial e decisões automatizadas", "cap:ia"),
    "10-seguranca": ("Medidas de segurança e resposta a incidentes", "cap:seguranca"),
    "11-canais-publicos": ("Lojas, declarações públicas e versão web", "cap:canais"),
    "12-registro-de-achados": ("Registro de achados", "cap:achados"),
    "13-quesitos": ("Quesitos à consultoria jurídica", "cap:quesitos"),
    "14-plano-de-adequacao": ("Correções realizadas e plano de adequação", "cap:plano"),
    "anexo-matriz": ("Matriz de conformidade", "anexo:matriz"),
    "anexo-administracao": ("Informações solicitadas à administração", "anexo:administracao"),
    "anexo-evidencias": ("Índice de evidências", "anexo:evidencias"),
    "anexo-glossario": ("Glossário", "anexo:glossario"),
    "anexo-normas": ("Referências normativas", "anexo:normas"),
    "01-visao-geral": ("Visão geral", "cap:visao"),
    "02-arquitetura": ("Arquitetura", "cap:arquitetura"),
    "03-regras-de-codificacao": ("Regras de codificação", "cap:regras"),
    "04-processo": ("Processo de desenvolvimento e entrega", "cap:processo"),
    "05-ia-no-desenvolvimento": ("Inteligência artificial no desenvolvimento", "cap:iadev"),
    "06-estrategia-de-testes": ("Estratégia de testes", "cap:estrategia"),
    "07-catalogo-de-testes": ("Catálogo de testes automatizados", "cap:catalogo"),
    "08-plano-e-resultados": ("Plano de testes e resultados", "cap:resultados"),
    "09-achados": ("Achados de qualidade e backlog", "cap:achadosqualidade"),
    "10-ux-e-design": ("Experiência de uso e sistema de design", "cap:ux"),
    "11-gendermag": ("Avaliação GenderMag", "cap:gendermag"),
    "12-persona-de-dominio": ("Avaliação com persona de domínio", "cap:persona"),
    "13-ia-no-produto": ("Inteligência artificial no produto", "cap:iaapp"),
    "14-como-fazer-um-bom-produto": ("Como fazer um bom produto", "cap:guia"),
    "anexo-testes": ("Catálogo dos testes automatizados", "anexo:testes"),
    "anexo-regras": ("Regras de lint e portões", "anexo:regras"),
    "anexo-scripts": ("Scripts de teste", "anexo:scripts"),
}


def copiar_se_falta(origem, destino):
    if os.path.exists(destino):
        return False
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    shutil.copy(origem, destino)
    return True


PROVISORIO = "Em elaboração."


def retirar_capitulos(destino, sem):
    caminho_main = os.path.join(destino, "main.tex")
    linhas = open(caminho_main, encoding="utf-8").read().split("\n")
    alvo = {"\\input{capitulos/" + n + "}" for n in sem}
    linhas = [l for l in linhas if l.strip() not in alvo]
    limpas = []
    for i, l in enumerate(linhas):
        if l.strip().startswith("\\part{"):
            seguinte = next((x.strip() for x in linhas[i + 1:] if x.strip()), "")
            if not seguinte.startswith("\\input{"):
                continue
        limpas.append(l)
    open(caminho_main, "w", encoding="utf-8").write("\n".join(limpas))
    for n in sem:
        cap = os.path.join(destino, "capitulos", n + ".tex")
        if not os.path.exists(cap):
            continue
        if open(cap, encoding="utf-8").read().strip().endswith(PROVISORIO):
            os.remove(cap)
        else:
            print(f"aviso: {cap} tem conteúdo e foi mantido; apague à mão se não servir")


def copiar_telas(destino, telas):
    pasta = os.path.join(destino, "figuras", "telas")
    n = 0
    for f in os.listdir(telas):
        if f.lower().endswith((".png", ".jpg", ".jpeg")):
            shutil.copy(os.path.join(telas, f), os.path.join(pasta, f))
            n += 1
    print(f"{pasta}: {n} captura(s) copiadas")


def preparar_volume(modelo, destino, sty, sem, telas):
    os.makedirs(os.path.join(destino, "capitulos"), exist_ok=True)
    for sub in ("figuras/diagramas", "figuras/telas"):
        os.makedirs(os.path.join(destino, sub), exist_ok=True)
    copiar_se_falta(os.path.join(ASSETS, modelo, "main.tex"), os.path.join(destino, "main.tex"))
    shutil.copy(sty, os.path.join(destino, "relatorio.sty"))
    abertura = os.path.join(ASSETS, modelo, "capitulos", "00-abertura.tex")
    if os.path.exists(abertura):
        copiar_se_falta(abertura, os.path.join(destino, "capitulos", "00-abertura.tex"))
    if sem:
        retirar_capitulos(destino, sem)
    main = open(os.path.join(destino, "main.tex"), encoding="utf-8").read()
    criados = []
    for nome in re.findall(r"\\input\{capitulos/([^}]+)\}", main):
        caminho = os.path.join(destino, "capitulos", nome + ".tex")
        if os.path.exists(caminho):
            continue
        titulo, rotulo = ROTULOS.get(nome, (nome, "cap:" + nome))
        with open(caminho, "w", encoding="utf-8") as f:
            f.write("\\chapter{" + titulo + "}\\label{" + rotulo + "}\n\n" + PROVISORIO + "\n")
        criados.append(nome)
    if telas:
        copiar_telas(destino, telas)
    print(f"{destino}: {len(criados)} capítulo(s) provisório(s) criados")


def main():
    p = argparse.ArgumentParser(description="Cria as pastas dos volumes a partir dos modelos da skill. Pode rodar de novo: não sobrescreve capítulos.")
    p.add_argument("destino", help="pasta onde ficarão lgpd/, engenharia/ e diagramas/")
    p.add_argument("--so", choices=["lgpd", "engenharia"], help="prepara só um volume")
    p.add_argument("--sem", default="", help="capítulos a retirar, separados por vírgula, ex.: 09-inteligencia-artificial,13-ia-no-produto")
    p.add_argument("--telas", help="pasta com as capturas do catálogo, copiadas para figuras/telas de cada volume")
    a = p.parse_args()

    sem = [s.strip().removesuffix(".tex") for s in a.sem.split(",") if s.strip()]
    sty = os.path.join(ASSETS, "relatorio.sty")
    if a.so in (None, "lgpd"):
        preparar_volume("volume-I", os.path.join(a.destino, "lgpd"), sty, sem, a.telas)
    if a.so in (None, "engenharia"):
        preparar_volume("volume-II", os.path.join(a.destino, "engenharia"), sty, sem, a.telas)
    diag = os.path.join(a.destino, "diagramas")
    os.makedirs(diag, exist_ok=True)
    for f in os.listdir(os.path.join(ASSETS, "diagramas")):
        copiar_se_falta(os.path.join(ASSETS, "diagramas", f), os.path.join(diag, f))
    copiar_se_falta(os.path.join(ASSETS, "exemplo-componentes.tex"), os.path.join(a.destino, "estilo", "exemplo-componentes.tex"))
    shutil.copy(sty, os.path.join(a.destino, "estilo", "relatorio.sty"))
    print("diagramas e estilo prontos em", a.destino)


if __name__ == "__main__":
    main()
