import re
import sys
from html.parser import HTMLParser

BLOCK = {
    'p', 'div', 'br', 'tr', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'ul', 'ol', 'blockquote', 'center', 'hr', 'td', 'th', 'pre', 'dd', 'dt',
}
SKIP = {'script', 'style', 'head', 'title'}
STRIKE = {'strike', 's', 'del'}
VOID = {'br', 'hr', 'img', 'meta', 'link', 'input', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'}
AUTOCLOSE = {'p': {'p'}, 'li': {'li'}, 'tr': {'tr', 'td', 'th'}, 'td': {'td', 'th'}, 'th': {'td', 'th'}}

ABRE = '⟦TACHADO: '
FECHA = '⟧'


class Limpa(HTMLParser):
    def __init__(self, manter_tachados: bool):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.stack = []
        self.strike = 0
        self.manter = manter_tachados
        self.n_tachados = 0

    def _pop_ate(self, alvo: set[str]) -> None:
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] in alvo:
                for _, st in self.stack[i:]:
                    if st:
                        self.strike -= 1
                del self.stack[i:]
                return

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.skip += 1
            return
        if tag in AUTOCLOSE:
            limite = None
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] in ('table', 'td', 'th') and tag == 'p':
                    limite = i
                    break
                if self.stack[i][0] == 'table' and tag in ('tr', 'td', 'th', 'li'):
                    limite = i
                    break
            alvo = AUTOCLOSE[tag]
            for i in range(len(self.stack) - 1, -1, -1):
                if limite is not None and i <= limite:
                    break
                if self.stack[i][0] in alvo:
                    for _, st in self.stack[i:]:
                        if st:
                            self.strike -= 1
                    del self.stack[i:]
                    break
        if tag in BLOCK:
            self.out.append('\n')
        if tag in VOID:
            return
        style = (dict(attrs).get('style') or '').replace(' ', '').lower()
        st = tag in STRIKE or 'line-through' in style
        if st:
            self.strike += 1
        self.stack.append((tag, st))

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if tag in VOID:
            return
        self._pop_ate({tag})
        if tag in BLOCK:
            self.out.append('\n')

    def handle_startendtag(self, tag, attrs):
        if tag in BLOCK:
            self.out.append('\n')

    def handle_data(self, data):
        if self.skip:
            return
        if self.strike > 0:
            if data.strip():
                self.n_tachados += 1
            if self.manter:
                self.out.append(ABRE + data + FECHA)
            else:
                self.out.append(' ')
            return
        self.out.append(data)


def decodifica(raw: bytes, forcar: str | None = None) -> tuple[str, str]:
    if forcar:
        return raw.decode(forcar, errors='replace'), forcar
    try:
        return raw.decode('utf-8'), 'utf-8'
    except UnicodeDecodeError:
        return raw.decode('cp1252', errors='replace'), 'cp1252'


def limpa(texto_html: str, manter_tachados: bool) -> tuple[str, int]:
    p = Limpa(manter_tachados)
    p.feed(texto_html)
    p.close()
    t = ''.join(p.out)
    t = t.replace('\xa0', ' ').replace('\r', '')
    t = re.sub(re.escape(FECHA) + r'(\s*)' + re.escape(ABRE), r'\1', t)
    linhas = []
    for bloco in t.split('\n'):
        bloco = re.sub(r'[ \t\f\v]+', ' ', bloco).strip()
        linhas.append(bloco)
    t = '\n'.join(linhas)
    t = re.sub(r'\n{2,}', '\n', t)
    return t.strip() + '\n', p.n_tachados


def main():
    origem, destino = sys.argv[1], sys.argv[2]
    manter = '--com-tachados' in sys.argv[3:]
    raw = open(origem, 'rb').read()
    s, enc = decodifica(raw)
    s = re.sub(r'(?is)<!--.*?-->', ' ', s)
    s = re.sub(r'(?s)\s*\n\s*', ' ', s)
    t, n = limpa(s, manter)
    open(destino, 'w', encoding='utf-8', newline='\n').write(t)
    print(f'origem={origem} enc={enc} bytes={len(raw)} linhas={t.count(chr(10))} chars={len(t)} trechos_tachados={n} manter={manter} repl={t.count(chr(0xfffd))}')


if __name__ == '__main__':
    main()
