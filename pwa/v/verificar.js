// A página de verificação: lê o token do #hash (ou da câmera/colado), confere a assinatura com a chave
// pública do emissor e, se houver internet, consulta a lista de carteirinhas canceladas.
import * as C from "../comum.js";
import { EMISSORES } from "../emissores.js";

const ARMAZEM_EXTRAS = "carteirinha-digital/emissores-extras";
const $ = (s) => document.querySelector(s);
let fluxo = null;
let laco = null;

function iniciar() {
  $("#bt-verificar").addEventListener("click", () => verificarTexto($("#txt-token").value));
  $("#bt-outra").addEventListener("click", voltar);
  $("#bt-camera").addEventListener("click", abrirCamera);
  $("#bt-parar").addEventListener("click", fecharCamera);
  $("#form-emissor").addEventListener("submit", adicionarEmissor);
  if (!("BarcodeDetector" in window)) {
    $("#bt-camera").hidden = true;
    $("#sem-token p.lead").textContent += " Este navegador não lê QR pela página; use o app de câmera do celular.";
  }
  renderizarEmissores();
  window.addEventListener("hashchange", lerHash);
  lerHash();
}

function extras() {
  try {
    return JSON.parse(localStorage.getItem(ARMAZEM_EXTRAS) || "{}");
  } catch {
    return {};
  }
}

function lerHash() {
  const token = location.hash.length > 1 ? C.tokenDoLink(location.href) : "";
  if (token) verificarTexto(token, true);
}

async function verificarTexto(texto, veioDoLink = false) {
  const token = C.tokenDoLink(texto);
  if (!token) return;
  fecharCamera();
  const resultado = await C.verificar(token, EMISSORES, extras());
  if (!veioDoLink) history.replaceState(null, "", `#${token}`);
  mostrar(resultado);
}

function voltar() {
  history.replaceState(null, "", location.pathname);
  $("#com-resultado").hidden = true;
  $("#sem-token").hidden = false;
  $("#txt-token").value = "";
}

async function mostrar(r) {
  $("#sem-token").hidden = true;
  $("#com-resultado").hidden = false;
  const resultado = $("#resultado");
  const detalhes = $("#detalhes");
  const revogacao = $("#painel-revogacao");
  const assinatura = $("#painel-assinatura");
  revogacao.hidden = true;
  if (!r.ok) {
    const titulo = { formato: "Código inválido", emissor: "Emissor desconhecido", assinatura: "Assinatura não confere" }[r.motivo] || "Não confere";
    const explicacao = {
      formato: "O que foi lido não é o código de uma carteirinha, ou está incompleto.",
      emissor: `${r.detalhe}. Se for a sua instituição, adicione a chave pública dela em “Emissores confiáveis”.`,
      assinatura: "Os dados foram alterados depois da emissão ou foram assinados com outra chave. Não aceite esta carteirinha.",
    }[r.motivo] || r.detalhe;
    resultado.innerHTML = `<div class="resultado erro"><div class="icone">✕</div><div><h2>${C.escapar(titulo)}</h2><p>${C.escapar(explicacao)}</p></div></div>`;
    detalhes.innerHTML = r.payload ? linhasDoPayload(r.payload, r.emissor) : `<div class="largo"><dd>Nada para mostrar.</dd></div>`;
    assinatura.innerHTML = r.payload ? `Emissor informado no código: <code>${C.escapar(r.payload.k)}</code>.` : "";
    return;
  }
  const { payload, emissor, situacao } = r;
  const vencida = situacao.estado === "vencida";
  resultado.innerHTML = vencida
    ? `<div class="resultado atencao"><div class="icone">!</div><div><h2>Autêntica, mas vencida</h2><p>Assinada por ${C.escapar(emissor.nome)}. ${C.escapar(situacao.texto)}.</p></div></div>`
    : `<div class="resultado ok"><div class="icone">✓</div><div><h2>Carteirinha autêntica</h2><p>Assinada por ${C.escapar(emissor.nome)}. ${C.escapar(situacao.texto)}.</p></div></div>`;
  detalhes.innerHTML = linhasDoPayload(payload, emissor);
  assinatura.innerHTML = `Assinatura <b>ECDSA P-256 / SHA-256</b> conferida neste aparelho com a chave pública do emissor <code>${C.escapar(payload.k)}</code> (impressão ${await C.impressaoDaChave(emissor.chave)}). ${payload.f ? `Compare o código <b>FOTO ${C.escapar(C.formatarCodigoFoto(payload.f))}</b> com o impresso sob a foto na tela do estudante: ele prende a foto à assinatura.` : "Esta carteirinha foi emitida sem foto vinculada."}`;
  consultarRevogacao(payload);
}

function linhasDoPayload(p, emissor) {
  return [
    ["Nome", p.n], ["Matrícula", p.i, "mono"],
    emissor ? ["Instituição", `${emissor.nome}${emissor.sigla ? ` (${emissor.sigla})` : ""}`, "largo"] : ["Emissor (desconhecido)", p.k, "largo"],
    ["Curso", p.c], ["Nível", p.g], p.d ? ["Nascimento", C.formatarData(p.d)] : null,
    ["Validade", C.formatarValidade(p.x)], ["Emitida em", C.formatarData(p.m)],
    p.f ? ["Código da foto", C.formatarCodigoFoto(p.f), "mono"] : null,
  ].filter(Boolean).map(([t, v, classe]) => `<div class="${classe === "largo" ? "largo" : ""}"><dt>${C.escapar(t)}</dt><dd class="${classe === "mono" ? "mono" : ""}">${C.escapar(v)}</dd></div>`).join("");
}

async function consultarRevogacao(payload) {
  const painel = $("#painel-revogacao");
  painel.hidden = false;
  painel.innerHTML = `<span class="etiqueta neutra">Consultando a lista de canceladas…</span>`;
  try {
    const resposta = await fetch(new URL("../revogadas.json", location.href), { cache: "no-store" });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const lista = await resposta.json();
    const chave = `${payload.k}:${payload.i}`;
    if ((lista.ids || []).includes(chave)) {
      $("#resultado").innerHTML = `<div class="resultado erro"><div class="icone">✕</div><div><h2>Cancelada pela instituição</h2><p>A assinatura é válida, mas a matrícula ${C.escapar(payload.i)} consta na lista de carteirinhas canceladas (${C.escapar(lista.atualizado || "")}).</p></div></div>`;
      painel.innerHTML = `<span class="etiqueta erro">Cancelada</span> <span style="font-size:13px;color:var(--tinta2)">lista atualizada em ${C.escapar(lista.atualizado || "—")}</span>`;
    } else {
      painel.innerHTML = `<span class="etiqueta ok">Não consta como cancelada</span> <span style="font-size:13px;color:var(--tinta2)">lista atualizada em ${C.escapar(lista.atualizado || "—")}</span>`;
    }
  } catch {
    painel.innerHTML = `<span class="etiqueta neutra">Sem internet: não deu para consultar a lista de canceladas</span>`;
  }
}

// ------------------------------------------------------------------ câmera (BarcodeDetector, onde existe)
async function abrirCamera() {
  const caixa = $("#caixa-camera");
  const video = $("#video");
  try {
    fluxo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  } catch (erro) {
    $("#estado-camera").textContent = `Sem acesso à câmera (${erro.name}). Use o app de câmera do celular ou cole o código.`;
    caixa.hidden = false;
    return;
  }
  video.srcObject = fluxo;
  await video.play();
  caixa.hidden = false;
  $("#estado-camera").textContent = "Aponte para o QR…";
  const detector = new BarcodeDetector({ formats: ["qr_code"] });
  laco = setInterval(async () => {
    if (video.readyState < 2) return;
    try {
      const codigos = await detector.detect(video);
      const achado = codigos.find((c) => c.rawValue && c.rawValue.includes("."));
      if (achado) verificarTexto(achado.rawValue);
    } catch (erro) {
      $("#estado-camera").textContent = `O leitor falhou: ${erro.message}`;
    }
  }, 400);
}

function fecharCamera() {
  if (laco) clearInterval(laco);
  laco = null;
  if (fluxo) for (const t of fluxo.getTracks()) t.stop();
  fluxo = null;
  $("#caixa-camera").hidden = true;
}

// ------------------------------------------------------------------ emissores confiáveis
async function renderizarEmissores() {
  const lista = $("#lista-emissores");
  const itens = [];
  for (const [id, e] of Object.entries(EMISSORES)) {
    itens.push(`<div class="item"><span><b>${C.escapar(e.nome)}</b> <code>${C.escapar(id)}</code></span><span class="etiqueta neutra">publicado · ${await C.impressaoDaChave(e.chave)}</span></div>`);
  }
  for (const [id, e] of Object.entries(extras())) {
    itens.push(`<div class="item"><span><b>${C.escapar(e.nome)}</b> <code>${C.escapar(id)}</code></span><span><span class="etiqueta neutra">neste aparelho · ${await C.impressaoDaChave(e.chave)}</span> <button class="link" data-remover="${C.escapar(id)}">remover</button></span></div>`);
  }
  lista.innerHTML = itens.join("") || "<p>Nenhum.</p>";
  for (const bt of lista.querySelectorAll("[data-remover]")) {
    bt.addEventListener("click", () => {
      const atuais = extras();
      delete atuais[bt.dataset.remover];
      localStorage.setItem(ARMAZEM_EXTRAS, JSON.stringify(atuais));
      renderizarEmissores();
    });
  }
}

async function adicionarEmissor(evento) {
  evento.preventDefault();
  const erro = $("#erro-emissor");
  erro.hidden = true;
  try {
    const id = $("#em-id").value.trim();
    const nome = $("#em-nome").value.trim();
    let bruto = JSON.parse($("#em-chave").value.replace(/\/\/.*$/gm, "").trim());
    // aceita a entrada inteira copiada da secretaria ({ "id": { nome, chave } }), a entrada interna ou o JWK puro
    if (bruto[id] && bruto[id].chave) bruto = bruto[id].chave;
    else if (bruto.chave) bruto = bruto.chave;
    else if (!bruto.x && Object.keys(bruto).length === 1) bruto = Object.values(bruto)[0].chave;
    if (!bruto || !bruto.x || !bruto.y) throw new Error("não achei a chave pública (campos x e y)");
    await C.importarPublica(bruto);
    if (EMISSORES[id]) throw new Error("esse identificador já é de um emissor publicado");
    const atuais = extras();
    const entradaInteira = JSON.parse($("#em-chave").value.replace(/\/\/.*$/gm, "").trim());
    const extraInfo = (entradaInteira[id] && entradaInteira[id].chave) ? entradaInteira[id] : (entradaInteira.chave ? entradaInteira : {});
    atuais[id] = { nome, sigla: extraInfo.sigla || "", cor: extraInfo.cor || "", ...(extraInfo.logo ? { logo: extraInfo.logo } : {}),
      chave: { kty: bruto.kty, crv: bruto.crv, x: bruto.x, y: bruto.y } };
    localStorage.setItem(ARMAZEM_EXTRAS, JSON.stringify(atuais));
    $("#form-emissor").reset();
    renderizarEmissores();
  } catch (e) {
    erro.textContent = `Não deu para adicionar: ${e.message}`;
    erro.hidden = false;
  }
}

iniciar();
