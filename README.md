# cie_digital

Dois pedaços neste repositório:

- **`pwa/` — Carteirinha Digital**, a versão web instalável (PWA): identificação estudantil **institucional**, assinada
  digitalmente pela instituição, com app do estudante que funciona sem internet e página de verificação por QR code.
  É o que está pronto para rodar e apresentar. Documentação em [`pwa/README.md`](pwa/README.md).
- **raiz — protótipo Flutter** (`lib/main.dart`), as telas iniciais feitas antes, mantidas como estavam.

## Rodar a PWA

```
cd pwa
python -m http.server 8766 --bind 127.0.0.1
# abra http://127.0.0.1:8766/   (Service Worker e Web Crypto exigem localhost ou HTTPS)
```

- `/` app do estudante · `/emitir/` secretaria · `/v/` verificação.
- "Ver um exemplo" ativa uma carteirinha fictícia; `pwa/exemplos/` tem também uma vencida e uma cancelada.
- Testes: `cd pwa && node --test tests/` (Node 20+, sem dependências).

## Publicar no Cloudflare (HTTPS, funciona no Android e no iPhone)

O app precisa de HTTPS fora do `localhost` (Service Worker e Web Crypto só rodam em contexto seguro), então um
`http://192.168…` na rede local **não** serve para os celulares. O jeito pronto é o Cloudflare Workers com arquivos
estáticos, o mesmo esquema de outros sites seus:

1. No painel do Cloudflare: **Workers & Pages → Create → Import a repository** → escolha `cie_digital` (repositório
   privado funciona; autorize o acesso do Cloudflare ao GitHub se ele pedir).
2. Deixe o comando de build em branco e o deploy em `npx wrangler deploy`. O `wrangler.jsonc` da raiz já aponta para
   a pasta `pwa/`; o nome do Worker é `carteirinha-digital` (mude lá se quiser outro subdomínio).
3. Salve. A cada push na `main` ele publica de novo. A URL fica `https://carteirinha-digital.<sua-conta>.workers.dev`.
   Os QR codes e links de ativação usam o endereço em que a página está aberta, então nada precisa ser configurado.

Pela linha de comando (depois de `npx wrangler login`, feito por você): `npx wrangler deploy`.
Alternativa: o workflow `Pages` (manual) publica no GitHub Pages, mas isso exige repositório público.

> A Carteirinha Digital é um documento **da própria instituição de ensino** para uso interno. Não é a Carteira de
> Identificação Estudantil (CIE) da Lei 12.933/2013, não traz marcas de entidades estudantis e não dá direito à
> meia-entrada.

Licença MIT ([LICENSE](LICENSE)).
