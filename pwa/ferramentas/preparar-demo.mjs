// Prepara a demonstração: o par de chaves do emissor fictício (se ainda não existir), o emissores.js com
// a chave pública e três carteirinhas de exemplo assinadas (válida, vencida e cancelada).
//
//   node ferramentas/preparar-demo.mjs
//
// Tudo aqui é inventado: instituição, estudantes e "fotos" (ilustrações SVG geradas no código).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHAVE_PRIVADA = path.join(RAIZ, "chaves", "demo-emissor.privada.json");
const EMISSORES_JS = path.join(RAIZ, "emissores.js");
const EXEMPLOS = path.join(RAIZ, "exemplos");

const EMISSOR = { id: "iet-demo", nome: "Instituto Exemplo de Tecnologia", sigla: "IET", cor: "#0F766E" };
// logotipo fictício da instituição: um monograma em SVG
const LOGO_IET = "data:image/svg+xml;base64," + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0F766E"/>' +
  '<path d="M14 44V20h6v24zM26 20h16v5H32v4h9v5h-9v5h10v5H26zM44 20h8l-4 10z" fill="#fff"/>' +
  '<circle cx="50" cy="46" r="5" fill="#B8E952"/></svg>', "utf8").toString("base64");

const ESTUDANTES = [
  { arquivo: "ana", nome: "Ana Beatriz Souza Lima", matricula: "2024010123", curso: "Análise e Desenvolvimento de Sistemas",
    nivel: "Graduação", nascimento: "2004-03-18", validade: "2026-12", emitida: "2026-02-03", tom: "#2F855A" },
  { arquivo: "carlos", nome: "Carlos Eduardo Pereira", matricula: "2022005877", curso: "Técnico em Eletrônica",
    nivel: "Técnico", nascimento: "2006-11-02", validade: "2025-12", emitida: "2025-02-10", tom: "#B7791F" },
  { arquivo: "bruna", nome: "Bruna Carvalho Nunes", matricula: "2023019999", curso: "Gestão de Recursos Humanos",
    nivel: "Graduação", nascimento: "2002-07-25", validade: "2026-12", emitida: "2026-02-03", tom: "#9F3B8F" },
];

async function carregarComum() {
  // o comum.js importa ./emissores.js; se ele ainda não existe, cria um vazio antes
  try { await readFile(EMISSORES_JS); } catch { await writeFile(EMISSORES_JS, "export const EMISSORES = {};\n"); }
  return import(path.join(RAIZ, "comum.js").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));
}

async function chaves(C) {
  try {
    const guardado = JSON.parse(await readFile(CHAVE_PRIVADA, "utf8"));
    return { privada: guardado.privada, publica: C.chavePublicaDa(guardado.privada), nova: false };
  } catch {
    const par = await C.gerarParDeChaves();
    await mkdir(path.dirname(CHAVE_PRIVADA), { recursive: true });
    await writeFile(CHAVE_PRIVADA, JSON.stringify({
      aviso: "Chave PRIVADA do emissor de demonstração. É pública de propósito: carteirinhas assinadas com ela valem só como exemplo.",
      emissor: EMISSOR.id, privada: par.privada,
    }, null, 2) + "\n");
    return { ...par, nova: true };
  }
}

/** "Foto" ilustrativa: um busto estilizado em SVG, com cor por estudante. Não é uma pessoa real. */
function avatarSvg(tom, iniciais) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tom}" stop-opacity=".25"/><stop offset="1" stop-color="${tom}" stop-opacity=".55"/></linearGradient></defs>` +
    `<rect width="300" height="400" fill="#E9F0ED"/><rect width="300" height="400" fill="url(#g)"/>` +
    `<circle cx="150" cy="150" r="62" fill="#F6D9C3"/><path d="M60 400c0-80 42-128 90-128s90 48 90 128z" fill="${tom}"/>` +
    `<path d="M88 150c0-48 28-82 62-82s62 34 62 82c0 6-4 10-10 10H98c-6 0-10-4-10-10z" fill="#3B2A22"/>` +
    `<text x="150" y="376" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle" opacity=".85">${iniciais}</text>` +
    `</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
}

async function main() {
  const C = await carregarComum();
  const { privada, publica, nova } = await chaves(C);
  const emissores = { [EMISSOR.id]: { nome: EMISSOR.nome, sigla: EMISSOR.sigla, cor: EMISSOR.cor, logo: LOGO_IET, chave: publica } };
  await writeFile(EMISSORES_JS,
    "// Emissores em que a verificação confia: identificador -> nome, sigla, cor e CHAVE PÚBLICA (JWK EC P-256).\n" +
    "// Gerado por ferramentas/preparar-demo.mjs. Uma instituição real acrescenta a sua entrada aqui (só a pública).\n" +
    "// Campos: nome, sigla, cor (hex), logo (data URL de imagem pequena, opcional) e chave (JWK público).\n" +
    `export const EMISSORES = ${JSON.stringify(emissores, null, 2)};\n`);
  // o comum.js já importado trouxe o emissores.js antigo; para assinar e conferir usa-se o objeto daqui
  await mkdir(EXEMPLOS, { recursive: true });
  const { criarQR } = await import(path.join(RAIZ, "lib", "qrcode.js").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));
  const base = "https://diogusvincere.github.io/cie_digital/pwa/v/";
  const resumo = [];
  for (const e of ESTUDANTES) {
    const foto = avatarSvg(e.tom, C.iniciais(e.nome));
    const payload = C.montarPayload({ ...e, fotoHash: await C.hashFoto(foto) }, EMISSOR.id);
    const token = await C.assinar(payload, privada);
    const confere = await C.verificar(token, emissores);
    if (!confere.ok) throw new Error(`a assinatura de ${e.nome} não conferiu: ${confere.detalhe}`);
    await writeFile(path.join(EXEMPLOS, `${e.arquivo}.json`), JSON.stringify(C.arquivoDeAtivacao({ token, foto })) + "\n");
    const link = C.linkVerificacao(token, base);
    const qr = criarQR(link, "L");
    resumo.push(`${e.arquivo.padEnd(7)} ${payload.n.padEnd(26)} validade ${payload.x}  token ${token.length} chars  link ${link.length}  QR v${qr.versao} (${qr.tamanho}x${qr.tamanho})`);
  }
  await writeFile(path.join(RAIZ, "revogadas.json"), JSON.stringify({
    aviso: "Carteirinhas canceladas pela instituição, por emissor:matrícula. A verificação consulta quando há internet.",
    atualizado: C.hojeIso(), ids: [`${EMISSOR.id}:2023019999`],
  }, null, 2) + "\n");
  console.log(nova ? "par de chaves NOVO gerado em chaves/demo-emissor.privada.json" : "par de chaves existente reaproveitado");
  console.log(`emissores.js gravado (impressão da chave pública: ${await C.impressaoDaChave(publica)})`);
  console.log(resumo.join("\n"));
  console.log("revogadas.json: bruna (2023019999) cancelada");
}

main().catch((erro) => { console.error(erro); process.exit(1); });
