// A secretaria: preenche, assina com a chave privada da instituição e entrega o arquivo/link de ativação.
import * as C from "../comum.js";
import { EMISSORES } from "../emissores.js";
import { htmlCartao } from "../cartao.js";
import { qrSvg, criarQR } from "../lib/qrcode.js";

const ARMAZEM_EMISSOR = "carteirinha-digital/emissor";
const DEMO_ID = "iet-demo";
const BASE_V = new URL("../v/", location.href).href;
const BASE_APP = new URL("../", location.href).href;
const $ = (s) => document.querySelector(s);

const estado = { foto: null, fotoHash: "", emitida: null, logo: null };

function iniciar() {
  $("#nivel").innerHTML = C.NIVEIS.map((n) => `<option${n === "Graduação" ? " selected" : ""}>${n}</option>`).join("");
  const daqui = new Date();
  $("#validade").value = `${daqui.getFullYear()}-12`;
  carregarEmissor();
  for (const id of ["#nome", "#matricula", "#nascimento", "#curso", "#nivel", "#validade", "#inst-nome", "#inst-sigla", "#inst-id", "#inst-cor"]) {
    $(id).addEventListener("input", previa);
  }
  $("#foto").addEventListener("change", trocarFoto);
  $("#inst-logo").addEventListener("change", trocarLogo);
  $("#bt-tirar-logo").addEventListener("click", () => definirLogo(null));
  $("#form").addEventListener("submit", emitir);
  $("#bt-limpar").addEventListener("click", limpar);
  $("#bt-preencher-exemplo").addEventListener("click", preencherExemplo);
  if (new URLSearchParams(location.search).get("exemplo") === "1") preencherExemplo();
  $("#bt-chave-demo").addEventListener("click", usarChaveDemo);
  $("#bt-gerar-chaves").addEventListener("click", gerarChaves);
  $("#bt-copiar-publica").addEventListener("click", copiarPublica);
  $("#bt-salvar-emissor").addEventListener("click", salvarEmissor);
  $("#bt-esquecer-emissor").addEventListener("click", esquecerEmissor);
  $("#bt-baixar").addEventListener("click", baixarArquivo);
  $("#bt-copiar-link").addEventListener("click", copiarLink);
  $("#bt-baixar-qr").addEventListener("click", baixarQR);
  $("#cartao").addEventListener("click", () => $("#cartao").classList.toggle("virado"));
  previa();
}

// ------------------------------------------------------------------ emissor (instituição + chave)
function emissorDaTela() {
  return {
    id: $("#inst-id").value.trim(), nome: $("#inst-nome").value.trim(), sigla: $("#inst-sigla").value.trim(),
    cor: $("#inst-cor").value, logo: estado.logo, privada: $("#chave-privada").value.trim(),
  };
}

function preencherEmissor(e) {
  $("#inst-id").value = e.id || "";
  $("#inst-nome").value = e.nome || "";
  $("#inst-sigla").value = e.sigla || "";
  $("#inst-cor").value = C.corValida(e.cor) || "#0F766E";
  $("#chave-privada").value = e.privada || "";
  definirLogo(e.logo || null);
}

function definirLogo(dataUrl) {
  estado.logo = dataUrl;
  $("#logo-previa").hidden = !dataUrl;
  $("#bt-tirar-logo").hidden = !dataUrl;
  if (dataUrl) $("#logo-previa").src = dataUrl;
  else $("#inst-logo").value = "";
  previa();
}

async function trocarLogo(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;
  try {
    definirLogo(await reduzirImagem(arquivo, 128, 128, "image/png", 0.92, true));
  } catch (erro) {
    mostrarErro(`Não consegui usar o logotipo: ${erro.message}`);
  }
}

async function carregarEmissor() {
  try {
    const guardado = JSON.parse(localStorage.getItem(ARMAZEM_EMISSOR) || "null");
    if (guardado) {
      preencherEmissor(guardado);
      mostrarAvisoChave(`Usando o emissor salvo neste navegador: <b>${C.escapar(guardado.nome)}</b> (${C.escapar(guardado.id)}).`, "neutra");
      return;
    }
  } catch { /* segue para a demonstração */ }
  await usarChaveDemo();
}

async function usarChaveDemo() {
  try {
    const resposta = await fetch("../chaves/demo-emissor.privada.json", { cache: "no-cache" });
    if (!resposta.ok) throw new Error(`arquivo da chave de demonstração não encontrado (${resposta.status})`);
    const demo = await resposta.json();
    const info = EMISSORES[DEMO_ID] || {};
    preencherEmissor({ id: DEMO_ID, nome: info.nome || "Instituto Exemplo de Tecnologia", sigla: info.sigla || "IET", cor: info.cor || "#0F766E", logo: info.logo || null, privada: JSON.stringify(demo.privada) });
    mostrarAvisoChave("<b>Chave de demonstração.</b> Ela é pública de propósito: cartões assinados com ela valem só como demonstração. Para uma instituição de verdade, gere um par novo e publique só a chave pública.", "atencao");
    previa();
  } catch (erro) {
    mostrarAvisoChave(`Não consegui carregar a chave de demonstração: ${C.escapar(erro.message)}`, "erro");
  }
}

async function gerarChaves() {
  const par = await C.gerarParDeChaves();
  $("#chave-privada").value = JSON.stringify(par.privada);
  const id = $("#inst-id").value.trim() || "minha-instituicao";
  if (!$("#inst-id").value.trim()) $("#inst-id").value = id;
  mostrarPublica(id, par.publica);
  mostrarAvisoChave("Par novo gerado. Guarde a chave privada em lugar seguro (clique em “Salvar neste navegador” se for usar daqui) e publique a pública no <code>emissores.js</code>.", "ok");
  $("#det-chave").open = true;
}

async function mostrarPublica(id, publica) {
  const e = emissorDaTela();
  const entrada = { [id]: { nome: e.nome || "Nome da instituição", sigla: e.sigla || "", cor: e.cor, ...(e.logo ? { logo: e.logo } : {}), chave: publica } };
  $("#publica-texto").textContent = JSON.stringify(entrada, null, 2) + `\n// impressão da chave: ${await C.impressaoDaChave(publica)}`;
  $("#publica-nova").hidden = false;
}

async function copiarPublica() {
  try {
    const privada = JSON.parse($("#chave-privada").value);
    const publica = C.chavePublicaDa(privada);
    await mostrarPublica($("#inst-id").value.trim() || "minha-instituicao", publica);
    await navigator.clipboard.writeText($("#publica-texto").textContent);
    toast("Chave pública copiada.");
  } catch (erro) {
    mostrarErro(`Não consegui ler a chave privada: ${erro.message}`);
  }
}

function salvarEmissor() {
  const e = emissorDaTela();
  if (!e.id || !e.privada) return mostrarErro("Preencha o identificador e a chave privada antes de salvar.");
  localStorage.setItem(ARMAZEM_EMISSOR, JSON.stringify(e));
  toast("Emissor salvo neste navegador.");
}

function esquecerEmissor() {
  localStorage.removeItem(ARMAZEM_EMISSOR);
  toast("Esquecido. Voltando à demonstração.");
  usarChaveDemo();
}

function mostrarAvisoChave(html, tipo) {
  $("#aviso-chave").innerHTML = `<div class="aviso-box ${tipo}">${html}</div>`;
}

// ------------------------------------------------------------------ foto
async function trocarFoto(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;
  try {
    estado.foto = await reduzirFoto(arquivo);
    estado.fotoHash = await C.hashFoto(estado.foto);
    $("#foto-previa").src = estado.foto;
    $("#foto-previa").hidden = false;
    previa();
  } catch (erro) {
    mostrarErro(`Não consegui usar a foto: ${erro.message}`);
  }
}

/** Recorta em 3×4 pelo centro e reduz para 300×400 JPEG: cabe num arquivo pequeno e ainda identifica a pessoa. */
function reduzirFoto(arquivo) {
  return reduzirImagem(arquivo, 300, 400, "image/jpeg", 0.82, false);
}

/** Reduz uma imagem para L×A. cobrir=true recorta pelo centro; false encaixa inteira (logotipos). */
function reduzirImagem(arquivo, L, A, tipo, qualidade, cobrir) {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = (cobrir ? Math.max : Math.min)(L / img.naturalWidth, A / img.naturalHeight);
      const lw = img.naturalWidth * escala, lh = img.naturalHeight * escala;
      const canvas = document.createElement("canvas");
      canvas.width = L;
      canvas.height = A;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, (L - lw) / 2, (A - lh) / 2, lw, lh);
      resolver(canvas.toDataURL(tipo, qualidade));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rejeitar(new Error("o arquivo não é uma imagem")); };
    img.src = url;
  });
}

// ------------------------------------------------------------------ prévia e emissão
function dadosDaTela() {
  const e = emissorDaTela();
  return {
    nome: $("#nome").value, matricula: $("#matricula").value, nascimento: $("#nascimento").value, curso: $("#curso").value,
    nivel: $("#nivel").value, validade: $("#validade").value, instituicao: e.nome, sigla: e.sigla, cor: e.cor,
    fotoHash: estado.fotoHash || "",
  };
}

function payloadDePrevia() {
  const d = dadosDaTela();
  const limpar = (s) => String(s ?? "").trim();
  const p = {
    v: 1, k: $("#inst-id").value.trim() || "emissor", i: limpar(d.matricula) || "—", n: (limpar(d.nome) || "NOME DO ESTUDANTE").toUpperCase(),
    c: limpar(d.curso) || "Curso", g: d.nivel, x: /^\d{4}-\d{2}$/.test(d.validade) ? d.validade : "9999-12", m: C.hojeIso(),
  };
  if (d.nascimento) p.d = d.nascimento;
  if (d.fotoHash) p.f = d.fotoHash;
  return p;
}

function emissorDaPrevia() {
  const e = emissorDaTela();
  return { nome: e.nome || "Instituição de ensino", sigla: e.sigla.toUpperCase(), cor: e.cor, logo: e.logo };
}

function previa() {
  if (!document.getElementById("cartao")) return;
  const p = payloadDePrevia();
  const qr = estado.emitida ? qrSvg(C.linkVerificacao(estado.emitida.token, BASE_V), { nivel: "L", margem: 1 }) : "";
  $("#cartao").innerHTML = htmlCartao(p, { emissor: emissorDaPrevia(), foto: estado.foto, qr });
  if (estado.emitida && JSON.stringify({ ...p, m: estado.emitida.payload.m }) !== JSON.stringify(estado.emitida.payload)) {
    // mexeu depois de assinar: a emissão anterior não vale mais para estes dados
    estado.emitida = null;
    $("#resultado").hidden = true;
  }
}

async function emitir(evento) {
  evento.preventDefault();
  $("#erro").hidden = true;
  try {
    const e = emissorDaTela();
    if (!e.privada) throw new Error("Falta a chave privada do emissor (abra “Chave privada do emissor”).");
    let privada;
    try { privada = JSON.parse(e.privada); } catch { throw new Error("A chave privada não é um JSON válido."); }
    if (!e.nome) throw new Error("Falta o nome da instituição.");
    const payload = C.montarPayload(dadosDaTela(), e.id);
    const token = await C.assinar(payload, privada);
    const confere = await C.verificar(token, EMISSORES, { [e.id]: { nome: e.nome, sigla: e.sigla, cor: e.cor, logo: e.logo, chave: C.chavePublicaDa(privada) } });
    if (!confere.ok) throw new Error(`A assinatura não conferiu: ${confere.detalhe}`);
    const naLista = Boolean(EMISSORES[e.id]);
    estado.emitida = { token, payload, foto: estado.foto, naLista };
    mostrarResultado();
    previa();
    $("#resultado").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

function mostrarResultado() {
  const { token, payload, foto, naLista } = estado.emitida;
  const link = C.linkVerificacao(token, BASE_V);
  const qr = criarQR(link, "L");
  $("#qr-resultado").innerHTML = qrSvg(link, { nivel: "L", margem: 2 });
  $("#qr-info").textContent = `QR versão ${qr.versao} (${qr.tamanho}×${qr.tamanho} módulos) · ${link.length} caracteres · token de ${token.length}`;
  $("#token-texto").textContent = token;
  const ativacao = C.montarAtivacao({ token, foto });
  $("#lk-abrir-app").href = C.linkAtivacao(ativacao, BASE_APP);
  $("#lk-verificar").href = link;
  $("#resultado").hidden = false;
  const aviso = naLista ? "" : `<div class="aviso-box atencao">O emissor <b>${C.escapar(payload.k)}</b> não está no <code>emissores.js</code> publicado: a verificação pública vai dizer “emissor desconhecido” até a chave pública entrar lá (ou ser adicionada no aparelho de quem verifica).</div>`;
  $("#resultado").querySelector("p").insertAdjacentHTML("afterend", aviso);
}

function baixarArquivo() {
  const { token, foto, payload } = estado.emitida;
  const conteudo = JSON.stringify(C.arquivoDeAtivacao({ token, foto }));
  const nome = `carteirinha-${payload.i}-${payload.n.split(" ")[0].toLowerCase()}.json`;
  baixar(new Blob([conteudo], { type: "application/json" }), nome);
}

async function copiarLink() {
  const { token, foto } = estado.emitida;
  const link = C.linkAtivacao(C.montarAtivacao({ token, foto }), BASE_APP);
  if (link.length > 60000) return mostrarErro("Com a foto, o link ficou grande demais para colar em qualquer lugar: use o arquivo.");
  try {
    await navigator.clipboard.writeText(link);
    toast(`Link de ativação copiado (${(link.length / 1024).toFixed(1)} KB).`);
  } catch {
    prompt("Copie o link:", link);
  }
}

function baixarQR() {
  const { token, payload } = estado.emitida;
  const svg = qrSvg(C.linkVerificacao(token, BASE_V), { nivel: "L", margem: 4 });
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.drawImage(img, 0, 0, 1024, 1024);
    canvas.toBlob((blob) => baixar(blob, `qr-${payload.i}.png`), "image/png");
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Dados fictícios da Ana (exemplos/ana.json), para mostrar a emissão sem digitar nada. */
async function preencherExemplo() {
  try {
    const resposta = await fetch("../exemplos/ana.json", { cache: "no-cache" });
    const ativacao = C.lerAtivacao(await resposta.text());
    const p = C.lerToken(ativacao.token).payload;
    $("#nome").value = "Ana Beatriz Souza Lima";
    $("#matricula").value = p.i;
    $("#nascimento").value = p.d || "";
    $("#curso").value = p.c;
    $("#nivel").value = p.g;
    $("#validade").value = p.x;
    estado.foto = ativacao.foto;
    estado.fotoHash = p.f || "";
    $("#foto-previa").src = ativacao.foto;
    $("#foto-previa").hidden = false;
    estado.emitida = null;
    $("#resultado").hidden = true;
    previa();
  } catch (erro) {
    mostrarErro(`Não consegui carregar o exemplo: ${erro.message}`);
  }
}

function limpar() {
  for (const id of ["#nome", "#matricula", "#nascimento", "#curso"]) $(id).value = "";
  $("#foto").value = "";
  $("#foto-previa").hidden = true;
  estado.foto = null;
  estado.fotoHash = "";
  estado.emitida = null;
  $("#resultado").hidden = true;
  previa();
}

function mostrarErro(texto) {
  $("#erro").textContent = texto;
  $("#erro").hidden = false;
}

function toast(texto) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = texto;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

iniciar();
