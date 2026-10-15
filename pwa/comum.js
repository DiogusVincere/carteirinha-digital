// Carteirinha Digital — o que as três páginas e os testes compartilham: codificação, hash, chaves,
// assinatura e leitura do código da carteirinha. Módulo ES puro: roda no navegador e no Node 20+.
//
// O código da carteirinha ("token") é  <corpo>.<assinatura>  em base64url:
//   corpo      = JSON do payload (campos curtos, ver CHAVES_PAYLOAD)
//   assinatura = ECDSA P-256 / SHA-256 sobre os bytes do corpo, feita com a chave privada da instituição
// Quem verifica só precisa da chave pública do emissor (emissores.js) — nada de servidor, nada de segredo
// no aparelho do estudante.
import { EMISSORES } from "./emissores.js";

export const VERSAO = "1.0.0";
export const FORMATO_ATIVACAO = "carteirinha-digital/1";
export const NIVEIS = ["Ensino fundamental", "Ensino médio", "Técnico", "Graduação", "Pós-graduação", "Curso livre"];
// Nome, sigla, cor e logotipo da instituição NÃO vão no token: vêm da entrada do emissor (emissores.js),
// que a verificação já precisa consultar. Isso tira uns 60 bytes do QR.
export const CHAVES_PAYLOAD = {
  v: "versão", k: "emissor", i: "matrícula", n: "nome", c: "curso", g: "nível", d: "nascimento",
  x: "validade", m: "emitida em", f: "código da foto",
};
export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro",
  "outubro", "novembro", "dezembro"];

const ALG = { name: "ECDSA", namedCurve: "P-256" };
const ASSINATURA = { name: "ECDSA", hash: "SHA-256" };
const te = new TextEncoder();
const td = new TextDecoder();

// ------------------------------------------------------------------ bytes e texto
export const utf8 = (texto) => te.encode(texto);
export const deUtf8 = (bytes) => td.decode(bytes);

export function b64u(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function deB64u(texto) {
  let s = String(texto).replace(/-/g, "+").replace(/_/g, "/");
  if (s.length % 4) s += "=".repeat(4 - (s.length % 4));
  const bin = atob(s);
  const saida = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) saida[i] = bin.charCodeAt(i);
  return saida;
}

export async function sha256Hex(bytes) {
  const h = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function bytesDaDataUrl(dataUrl) {
  const virgula = String(dataUrl).indexOf(",");
  if (!String(dataUrl).startsWith("data:") || virgula < 0) throw new Error("A foto não está em formato data URL");
  const meta = dataUrl.slice(0, virgula);
  const dados = dataUrl.slice(virgula + 1);
  if (/;base64$/i.test(meta)) {
    const bin = atob(dados);
    const saida = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) saida[i] = bin.charCodeAt(i);
    return saida;
  }
  return utf8(decodeURIComponent(dados));
}

/** Os 8 primeiros hexadecimais do SHA-256 da foto: vão no payload e impressos sob a foto. */
export async function hashFoto(dataUrl) {
  return (await sha256Hex(bytesDaDataUrl(dataUrl))).slice(0, 8).toUpperCase();
}

export const formatarCodigoFoto = (h) => (h ? `${h.slice(0, 4)}·${h.slice(4, 8)}` : "");

// ------------------------------------------------------------------ chaves
export async function gerarParDeChaves() {
  const par = await crypto.subtle.generateKey(ALG, true, ["sign", "verify"]);
  const privada = await crypto.subtle.exportKey("jwk", par.privateKey);
  const publica = await crypto.subtle.exportKey("jwk", par.publicKey);
  return {
    privada: { kty: privada.kty, crv: privada.crv, x: privada.x, y: privada.y, d: privada.d },
    publica: { kty: publica.kty, crv: publica.crv, x: publica.x, y: publica.y },
  };
}

export function chavePublicaDa(privadaJwk) {
  const { kty, crv, x, y } = privadaJwk;
  return { kty, crv, x, y };
}

export function importarPrivada(jwk) {
  if (!jwk || !jwk.d) throw new Error("A chave privada precisa ser um JWK com o campo d");
  const { kty, crv, x, y, d } = jwk;
  return crypto.subtle.importKey("jwk", { kty, crv, x, y, d, ext: true }, ALG, false, ["sign"]);
}

export function importarPublica(jwk) {
  if (!jwk || !jwk.x || !jwk.y) throw new Error("A chave pública precisa ser um JWK com x e y");
  const { kty, crv, x, y } = jwk;
  return crypto.subtle.importKey("jwk", { kty, crv, x, y, ext: true }, ALG, false, ["verify"]);
}

/** Identificação curta de uma chave pública (8 hex do SHA-256 de x+y), para mostrar na tela. */
export async function impressaoDaChave(jwk) {
  return (await sha256Hex(utf8(`${jwk.x}.${jwk.y}`))).slice(0, 8).toUpperCase();
}

// ------------------------------------------------------------------ payload e token
const limpar = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

export function hojeIso(hoje = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${hoje.getFullYear()}-${p(hoje.getMonth() + 1)}-${p(hoje.getDate())}`;
}

export function montarPayload(dados, emissorId) {
  const p = {
    v: 1, k: limpar(emissorId), i: limpar(dados.matricula), n: limpar(dados.nome).toUpperCase(),
    c: limpar(dados.curso), g: limpar(dados.nivel), x: limpar(dados.validade), m: dados.emitida || hojeIso(),
  };
  if (dados.nascimento) p.d = limpar(dados.nascimento);
  if (dados.fotoHash) p.f = limpar(dados.fotoHash).toUpperCase();
  validarPayload(p);
  return p;
}

export function validarPayload(p) {
  const faltam = ["k", "i", "n", "c", "g", "x"].filter((c) => !p[c]);
  if (faltam.length) throw new Error("Faltam: " + faltam.map((c) => CHAVES_PAYLOAD[c]).join(", "));
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p.x)) throw new Error("A validade deve ser mês e ano (AAAA-MM)");
  if (p.d && !/^\d{4}-\d{2}-\d{2}$/.test(p.d)) throw new Error("O nascimento deve ser uma data (AAAA-MM-DD)");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.m)) throw new Error("A data de emissão deve ser AAAA-MM-DD");
  if (p.f && !/^[0-9A-F]{8}$/.test(p.f)) throw new Error("O código da foto deve ter 8 caracteres hexadecimais");
  if (p.n.length > 80 || p.c.length > 80 || p.i.length > 30 || p.k.length > 40) throw new Error("Texto longo demais para caber no QR");
  return p;
}

export async function assinar(payload, privadaJwk) {
  validarPayload(payload);
  const corpo = b64u(utf8(JSON.stringify(payload)));
  const chave = await importarPrivada(privadaJwk);
  const assinatura = new Uint8Array(await crypto.subtle.sign(ASSINATURA, chave, utf8(corpo)));
  return `${corpo}.${b64u(assinatura)}`;
}

export function lerToken(token) {
  const t = String(token ?? "").trim();
  const m = /^([A-Za-z0-9_-]{20,})\.([A-Za-z0-9_-]{80,96})$/.exec(t);
  if (!m) throw new Error("O código não está no formato de uma carteirinha");
  let payload;
  try {
    payload = JSON.parse(deUtf8(deB64u(m[1])));
  } catch {
    throw new Error("O conteúdo do código está ilegível");
  }
  if (!payload || typeof payload !== "object" || payload.v !== 1) throw new Error("Versão do código não reconhecida");
  return { corpo: m[1], assinatura: deB64u(m[2]), payload };
}

/**
 * Confere um código. Devolve { ok, motivo, detalhe, payload, emissor, situacao }.
 * motivo: "" | "formato" | "emissor" | "assinatura". Vencida não é erro: está em situacao.
 */
export async function verificar(token, emissores = EMISSORES, extras = {}) {
  let lido;
  try {
    lido = lerToken(token);
  } catch (erro) {
    return { ok: false, motivo: "formato", detalhe: erro.message };
  }
  const { payload } = lido;
  const emissor = emissores[payload.k] || extras[payload.k];
  if (!emissor) {
    return { ok: false, motivo: "emissor", detalhe: `O emissor "${payload.k}" não está na lista de confiança deste aparelho`, payload };
  }
  let valida = false;
  try {
    valida = await crypto.subtle.verify(ASSINATURA, await importarPublica(emissor.chave), lido.assinatura, utf8(lido.corpo));
  } catch {
    valida = false;
  }
  if (!valida) return { ok: false, motivo: "assinatura", detalhe: "A assinatura não confere com a chave do emissor", payload, emissor };
  return { ok: true, motivo: "", detalhe: "", payload, emissor, situacao: situacao(payload) };
}

// ------------------------------------------------------------------ validade
export function fimDaValidade(validade) {
  const [ano, mes] = String(validade).split("-").map(Number);
  return new Date(ano, mes, 0, 23, 59, 59, 999); // último dia do mês
}

export function mesExtenso(validade) {
  const [ano, mes] = String(validade).split("-").map(Number);
  return `${MESES[mes - 1]} de ${ano}`;
}

export function situacao(payload, hoje = new Date()) {
  const fim = fimDaValidade(payload.x);
  const dias = Math.max(0, Math.ceil((fim - hoje) / 86400000));
  const estado = hoje > fim ? "vencida" : dias <= 30 ? "vence" : "valida";
  const texto = estado === "vencida" ? `Vencida desde ${mesExtenso(payload.x)}`
    : estado === "vence" ? `Vence em ${dias} dia${dias === 1 ? "" : "s"}`
      : `Válida até ${mesExtenso(payload.x)}`;
  return { estado, dias, fim, texto };
}

// ------------------------------------------------------------------ ativação e links
export function montarAtivacao({ token, foto }) {
  lerToken(token);
  return b64u(utf8(JSON.stringify(foto ? { t: token, p: foto } : { t: token })));
}

export function arquivoDeAtivacao({ token, foto }) {
  lerToken(token);
  return { formato: FORMATO_ATIVACAO, t: token, p: foto || null };
}

/** Aceita: link com #ativar=, o código de ativação, o conteúdo do arquivo .json ou o token puro. */
export function lerAtivacao(texto) {
  let s = String(texto ?? "").trim();
  if (!s) throw new Error("Nada para ativar");
  if (s.startsWith("{")) return normalizarAtivacao(JSON.parse(s));
  const marca = s.indexOf("#ativar=");
  if (marca >= 0) s = s.slice(marca + 8);
  s = s.replace(/^ativar=/, "").split(/[\s&]/)[0];
  if (/^[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{80,96}$/.test(s)) return normalizarAtivacao({ t: s });
  let objeto;
  try {
    objeto = JSON.parse(deUtf8(deB64u(s)));
  } catch {
    throw new Error("Não reconheci esse código de ativação");
  }
  return normalizarAtivacao(objeto);
}

function normalizarAtivacao(objeto) {
  const token = objeto && (objeto.t || objeto.token);
  const foto = (objeto && (objeto.p || objeto.foto)) || null;
  if (!token) throw new Error("O código não traz uma carteirinha");
  lerToken(token);
  if (foto && !/^data:image\/(jpeg|png|webp|svg\+xml);base64,/.test(foto)) throw new Error("A foto do código não é uma imagem");
  return { token, foto };
}

export const linkVerificacao = (token, base) => `${base}#${token}`;
export const linkAtivacao = (ativacao, base) => `${base}#ativar=${ativacao}`;

/** Tira o token de uma URL de verificação (ou devolve o próprio texto, se já for um token). */
export function tokenDoLink(texto) {
  const s = String(texto ?? "").trim();
  const i = s.indexOf("#");
  const bruto = i >= 0 ? s.slice(i + 1).replace(/^t=/, "") : s;
  return decodeURIComponent(bruto.split(/[\s&]/)[0]);
}

// ------------------------------------------------------------------ apresentação
export function formatarData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ""));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? "");
}

export function formatarValidade(validade) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(validade ?? ""));
  return m ? `${m[2]}/${m[1]}` : String(validade ?? "");
}

export function iniciais(nome) {
  const partes = String(nome ?? "").trim().split(/\s+/).filter((p) => p.length > 2 || /^[A-Z]$/.test(p));
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase() || "?";
}

export function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function corValida(cor) {
  return /^#?[0-9A-Fa-f]{6}$/.test(String(cor ?? "")) ? "#" + String(cor).replace("#", "").toUpperCase() : null;
}
