// O app do estudante: ativa, guarda no aparelho, mostra o cartão e o QR, funciona offline.
import * as C from "./comum.js";
import { htmlCartao, etiquetaSituacao } from "./cartao.js";
import { qrSvg } from "./lib/qrcode.js";

const ARMAZEM = "carteirinha-digital/carteirinha";
const BASE_V = new URL("v/", location.href).href;
const $ = (seletor, raiz = document) => raiz.querySelector(seletor);

const estado = { carteirinha: null, verificacao: null, fotoConfere: true, promptInstalar: null };

// ------------------------------------------------------------------ arranque
async function iniciar() {
  $("#versao").textContent = C.VERSAO;
  registrarServiceWorker();
  ligarEventos();
  atualizarOffline();
  const ativacaoNoLink = lerHashDeAtivacao();
  carregar();
  if (ativacaoNoLink) {
    await ativar(ativacaoNoLink, "pelo link");
  }
  await renderizar();
  if (new URLSearchParams(location.search).get("qr") === "1" && estado.carteirinha) abrirQR();
}

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.register("sw.js").catch((erro) => console.warn("service worker não registrou:", erro));
}

function lerHashDeAtivacao() {
  if (!location.hash.startsWith("#ativar=")) return null;
  const texto = location.hash;
  history.replaceState(null, "", location.pathname + location.search);
  try {
    return C.lerAtivacao(texto);
  } catch (erro) {
    avisar(`Link de ativação inválido: ${erro.message}`, "erro");
    return null;
  }
}

function ligarEventos() {
  window.addEventListener("online", atualizarOffline);
  window.addEventListener("offline", atualizarOffline);
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    estado.promptInstalar = e;
    for (const id of ["#bt-instalar", "#caixa-instalar-inicio"]) $(id).hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    estado.promptInstalar = null;
    for (const id of ["#bt-instalar", "#caixa-instalar-inicio"]) $(id).hidden = true;
    toast("Instalado. Abra pelo ícone na tela inicial.");
  });
  for (const id of ["#bt-instalar", "#bt-instalar-inicio"]) $(id).addEventListener("click", instalar);

  $("#bt-ativar").addEventListener("click", abrirAtivacao);
  $("#bt-exemplo").addEventListener("click", () => usarExemplo("ana"));
  $("#bt-exemplo-2").addEventListener("click", () => { $("#dlg-ativar").close(); usarExemplo("ana"); });
  $("#bt-confirmar-ativacao").addEventListener("click", confirmarAtivacao);
  for (const aba of document.querySelectorAll("#dlg-ativar [role=tab]")) {
    aba.addEventListener("click", () => {
      for (const outra of document.querySelectorAll("#dlg-ativar [role=tab]")) outra.setAttribute("aria-selected", String(outra === aba));
      for (const painel of document.querySelectorAll("#dlg-ativar [data-painel]")) painel.hidden = painel.dataset.painel !== aba.dataset.aba;
    });
  }
  $("#cartao").addEventListener("click", virar);
  $("#cartao").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); virar(); } });
  $("#bt-virar").addEventListener("click", virar);
  $("#bt-qr").addEventListener("click", abrirQR);
  $("#bt-fechar-qr").addEventListener("click", () => $("#dlg-qr").close());
  $("#bt-copiar-link").addEventListener("click", copiarLink);
  $("#bt-remover").addEventListener("click", remover);
}

function atualizarOffline() {
  $("#faixa-offline").hidden = navigator.onLine;
}

// ------------------------------------------------------------------ guardar e carregar
function carregar() {
  try {
    const bruto = localStorage.getItem(ARMAZEM);
    estado.carteirinha = bruto ? JSON.parse(bruto) : null;
  } catch {
    estado.carteirinha = null;
  }
}

function guardar() {
  if (estado.carteirinha) localStorage.setItem(ARMAZEM, JSON.stringify(estado.carteirinha));
  else localStorage.removeItem(ARMAZEM);
}

// ------------------------------------------------------------------ ativação
function abrirAtivacao() {
  $("#erro-ativacao").hidden = true;
  $("#txt-ativacao").value = "";
  $("#arq-ativacao").value = "";
  $("#dlg-ativar").showModal();
}

async function confirmarAtivacao() {
  const erro = $("#erro-ativacao");
  erro.hidden = true;
  try {
    let texto = $("#txt-ativacao").value.trim();
    const arquivo = $("#arq-ativacao").files[0];
    if (!texto && arquivo) texto = await arquivo.text();
    if (!texto) throw new Error("Cole o link/código ou escolha o arquivo.");
    const ativacao = C.lerAtivacao(texto);
    const ok = await ativar(ativacao, "agora");
    if (ok) $("#dlg-ativar").close();
  } catch (e) {
    erro.textContent = e.message;
    erro.hidden = false;
  }
}

async function usarExemplo(nome) {
  try {
    const resposta = await fetch(`exemplos/${nome}.json`, { cache: "no-cache" });
    if (!resposta.ok) throw new Error(`não achei o exemplo (${resposta.status})`);
    const ativacao = C.lerAtivacao(await resposta.text());
    await ativar(ativacao, "exemplo");
  } catch (e) {
    avisar(`Não consegui carregar o exemplo: ${e.message}`, "erro");
  }
}

async function ativar({ token, foto }, origem) {
  const resultado = await C.verificar(token);
  if (!resultado.ok) {
    const motivo = { formato: "o código está incompleto ou foi alterado", emissor: resultado.detalhe,
      assinatura: "a assinatura não confere com a chave da instituição" }[resultado.motivo] || resultado.detalhe;
    avisar(`A carteirinha não pôde ser ativada: ${motivo}.`, "erro");
    return false;
  }
  let fotoConfere = true;
  if (foto && resultado.payload.f) fotoConfere = (await C.hashFoto(foto)) === resultado.payload.f;
  estado.carteirinha = { token, foto: foto || null, ativadaEm: new Date().toISOString(), origem };
  guardar();
  await renderizar();
  toast(fotoConfere ? "Carteirinha ativada." : "Ativada, mas a foto não é a emitida pela instituição.");
  return true;
}

function remover() {
  if (!confirm("Remover a carteirinha deste aparelho? Para voltar, será preciso ativar de novo.")) return;
  estado.carteirinha = null;
  guardar();
  renderizar();
}

// ------------------------------------------------------------------ tela
async function renderizar() {
  const tem = Boolean(estado.carteirinha);
  $("#tela-inicio").hidden = tem;
  $("#tela-carteirinha").hidden = !tem;
  if (!tem) return;

  const { token, foto } = estado.carteirinha;
  const resultado = await C.verificar(token);
  estado.verificacao = resultado;
  const avisoEl = $("#aviso-carteirinha");
  if (!resultado.ok) {
    avisoEl.innerHTML = `<div class="aviso-box erro">Esta carteirinha não passa mais na verificação (${C.escapar(resultado.detalhe)}). Peça uma nova à secretaria.</div>`;
    $("#situacao").innerHTML = `<span class="etiqueta erro">Inválida</span>`;
    $("#cartao").innerHTML = "";
    $("#detalhes").innerHTML = "";
    return;
  }
  const { payload, emissor, situacao } = resultado;
  estado.fotoConfere = !(foto && payload.f) || (await C.hashFoto(foto)) === payload.f;
  avisoEl.innerHTML = estado.fotoConfere ? "" : `<div class="aviso-box atencao">A foto guardada neste aparelho não é a que a instituição emitiu, por isso o cartão mostra só as iniciais.</div>`;
  if (situacao.estado === "vencida") {
    avisoEl.innerHTML += `<div class="aviso-box atencao">Carteirinha vencida em ${C.escapar(C.mesExtenso(payload.x))}. A verificação continua mostrando os dados, mas marca como vencida.</div>`;
  }
  $("#situacao").innerHTML = etiquetaSituacao(situacao);
  const link = C.linkVerificacao(token, BASE_V);
  $("#cartao").innerHTML = htmlCartao(payload, { emissor, foto, fotoConfere: estado.fotoConfere, qr: qrSvg(link, { nivel: "L", margem: 1, rotulo: "QR Code de verificação" }) });
  $("#cartao").classList.remove("virado");
  $("#detalhes").innerHTML = [
    ["Nome", payload.n], ["Matrícula", payload.i, "mono"], ["Instituição", `${emissor.nome}${emissor.sigla ? ` (${emissor.sigla})` : ""}`, "largo"],
    ["Curso", payload.c], ["Nível", payload.g],
    payload.d ? ["Nascimento", C.formatarData(payload.d)] : null,
    ["Validade", C.formatarValidade(payload.x)], ["Emitida em", C.formatarData(payload.m)],
    ["Emissor", `${emissor.nome} · ${payload.k}`, "largo"],
    payload.f ? ["Código da foto", C.formatarCodigoFoto(payload.f), "mono"] : null,
  ].filter(Boolean).map(([t, v, classe]) => `<div class="${classe === "largo" ? "largo" : ""}"><dt>${C.escapar(t)}</dt><dd class="${classe === "mono" ? "mono" : ""}">${C.escapar(v)}</dd></div>`).join("");
  $("#texto-autenticidade").textContent = `Assinatura ECDSA P-256 conferida neste aparelho com a chave pública de ${emissor.nome} (${payload.k}). O QR leva à mesma verificação, que funciona sem internet.`;
  $("#lk-verificar").href = link;
}

function virar() {
  $("#cartao").classList.toggle("virado");
}

function abrirQR() {
  if (!estado.verificacao?.ok) return;
  const { payload, emissor } = estado.verificacao;
  const link = C.linkVerificacao(estado.carteirinha.token, BASE_V);
  $("#qr-grande").innerHTML = qrSvg(link, { nivel: "L", margem: 2, rotulo: "QR Code de verificação" });
  $("#qr-nome").textContent = payload.n;
  $("#qr-sub").textContent = `${emissor.sigla || emissor.nome} · matrícula ${payload.i}`;
  $("#dlg-qr").showModal();
}

async function copiarLink() {
  const link = C.linkVerificacao(estado.carteirinha.token, BASE_V);
  try {
    await navigator.clipboard.writeText(link);
    toast("Link copiado.");
  } catch {
    prompt("Copie o link:", link);
  }
}

async function instalar() {
  if (!estado.promptInstalar) return;
  estado.promptInstalar.prompt();
  await estado.promptInstalar.userChoice.catch(() => {});
  estado.promptInstalar = null;
  for (const id of ["#bt-instalar", "#caixa-instalar-inicio"]) $(id).hidden = true;
}

// ------------------------------------------------------------------ avisos
function avisar(texto, tipo = "neutra") {
  const alvo = estado.carteirinha ? $("#aviso-carteirinha") : $("#tela-inicio");
  const caixa = document.createElement("div");
  caixa.className = `aviso-box ${tipo}`;
  caixa.textContent = texto;
  alvo.prepend(caixa);
  setTimeout(() => caixa.remove(), 8000);
}

function toast(texto) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = texto;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

iniciar();
