// Service worker da Carteirinha Digital: deixa o app inteiro disponível sem internet.
// Suba VERSAO a cada publicação: o cache antigo é apagado na ativação.
const VERSAO = "1.0.0";
const CACHE = `carteirinha-digital-${VERSAO}`;
const ARQUIVOS = [
  "./", "./index.html", "./app.css", "./app.js", "./comum.js", "./cartao.js", "./emissores.js", "./lib/qrcode.js",
  "./manifest.webmanifest", "./icons/favicon.svg", "./icons/icone-192.png", "./icons/icone-512.png", "./icons/maskable-512.png",
  "./emitir/", "./emitir/index.html", "./emitir/emitir.js", "./v/", "./v/index.html", "./v/verificar.js",
  "./exemplos/ana.json", "./exemplos/carlos.json", "./exemplos/bruna.json", "./chaves/demo-emissor.privada.json",
  "./revogadas.json",
];
// o que deve vir sempre fresco quando há internet (cai no cache sem ela)
const PRIMEIRO_REDE = ["revogadas.json", "emissores.js"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (PRIMEIRO_REDE.some((nome) => url.pathname.endsWith(nome))) {
    evento.respondWith(primeiroRede(request));
    return;
  }
  if (request.mode === "navigate") {
    evento.respondWith(navegacao(request));
    return;
  }
  evento.respondWith(cacheDepoisRede(request));
});

async function primeiroRede(request) {
  const cache = await caches.open(CACHE);
  try {
    const resposta = await fetch(request);
    if (resposta.ok) cache.put(request, resposta.clone());
    return resposta;
  } catch {
    const guardada = await cache.match(request, { ignoreSearch: true });
    return guardada || Response.error();
  }
}

async function navegacao(request) {
  const cache = await caches.open(CACHE);
  const guardada = await cache.match(request, { ignoreSearch: true });
  if (guardada) {
    atualizarEmSegundoPlano(cache, request);
    return guardada;
  }
  try {
    const resposta = await fetch(request);
    if (resposta.ok) cache.put(request, resposta.clone());
    return resposta;
  } catch {
    return (await cache.match("./index.html")) || Response.error();
  }
}

async function cacheDepoisRede(request) {
  const cache = await caches.open(CACHE);
  const guardada = await cache.match(request, { ignoreSearch: true });
  if (guardada) {
    atualizarEmSegundoPlano(cache, request);
    return guardada;
  }
  const resposta = await fetch(request);
  if (resposta.ok) cache.put(request, resposta.clone());
  return resposta;
}

function atualizarEmSegundoPlano(cache, request) {
  fetch(request).then((resposta) => { if (resposta.ok) cache.put(request, resposta); }).catch(() => {});
}
