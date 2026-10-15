// Testes da lógica compartilhada (comum.js) e dos exemplos publicados. Rodam com `node --test tests/`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as C from "../comum.js";
import { EMISSORES } from "../emissores.js";
import { criarQR, qrSvg } from "../lib/qrcode.js";
import { htmlCartao, etiquetaSituacao } from "../cartao.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAR = await C.gerarParDeChaves();
const EMISSORES_TESTE = { "teste": { nome: "Faculdade de Teste", sigla: "FT", cor: "#0F766E", chave: PAR.publica } };
const DADOS = {
  nome: "  maria   da Silva ", matricula: "2026000001", instituicao: "Faculdade de Teste", sigla: "ft",
  curso: "Engenharia de Software", nivel: "Graduação", nascimento: "2005-01-31", validade: "2027-06", emitida: "2026-10-14",
  fotoHash: "0a1b2c3d", cor: "#0f766e",
};

test("base64url e utf-8 vão e voltam, inclusive com acento", () => {
  for (const texto of ["", "a", "ab", "abc", "Serviços tomados — março", "{\"v\":1}"]) {
    assert.equal(C.deUtf8(C.deB64u(C.b64u(C.utf8(texto)))), texto);
  }
  assert.doesNotMatch(C.b64u(new Uint8Array([251, 255, 254, 63])), /[+/=]/);
});

test("sha256 e hash da foto", async () => {
  assert.equal(await C.sha256Hex(C.utf8("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  const foto = "data:image/png;base64," + Buffer.from("imagem qualquer").toString("base64");
  const h = await C.hashFoto(foto);
  assert.match(h, /^[0-9A-F]{8}$/);
  assert.equal(h, (await C.sha256Hex(C.utf8("imagem qualquer"))).slice(0, 8).toUpperCase());
  assert.equal(C.formatarCodigoFoto(h), `${h.slice(0, 4)}·${h.slice(4)}`);
  assert.throws(() => C.bytesDaDataUrl("http://x"), /data URL/);
});

test("payload: limpeza, maiúsculas e validação", () => {
  const p = C.montarPayload(DADOS, "teste");
  assert.equal(p.n, "MARIA DA SILVA");
  assert.equal(p.f, "0A1B2C3D");
  assert.equal(p.m, "2026-10-14");
  assert.deepEqual(Object.keys(p), ["v", "k", "i", "n", "c", "g", "x", "m", "d", "f"], "instituição, sigla e cor não vão no token");
  assert.throws(() => C.montarPayload({ ...DADOS, validade: "junho" }, "teste"), /AAAA-MM/);
  assert.throws(() => C.montarPayload({ ...DADOS, nome: "" }, "teste"), /Faltam: nome/);
  assert.throws(() => C.montarPayload({ ...DADOS, fotoHash: "zz" }, "teste"), /foto/);
  assert.throws(() => C.montarPayload({ ...DADOS, nome: "x".repeat(81) }, "teste"), /longo/);
  assert.match(C.hojeIso(new Date(2026, 0, 5)), /^2026-01-05$/);
});

test("assina e verifica; qualquer mudança derruba a assinatura", async () => {
  const payload = C.montarPayload(DADOS, "teste");
  const token = await C.assinar(payload, PAR.privada);
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{86}$/);
  const ok = await C.verificar(token, EMISSORES_TESTE);
  assert.equal(ok.ok, true);
  assert.equal(ok.payload.n, "MARIA DA SILVA");
  assert.equal(ok.emissor.nome, "Faculdade de Teste");
  assert.equal(ok.situacao.estado, "valida");

  // nome trocado no corpo
  const { payload: lido } = C.lerToken(token);
  const adulterado = C.b64u(C.utf8(JSON.stringify({ ...lido, n: "OUTRA PESSOA" }))) + "." + token.split(".")[1];
  const ruim = await C.verificar(adulterado, EMISSORES_TESTE);
  assert.equal(ruim.ok, false);
  assert.equal(ruim.motivo, "assinatura");
  // assinatura de outra chave
  const outro = await C.gerarParDeChaves();
  const falso = await C.assinar(payload, outro.privada);
  assert.equal((await C.verificar(falso, EMISSORES_TESTE)).motivo, "assinatura");
  // emissor que ninguém conhece, e o mesmo emissor passado como extra
  assert.equal((await C.verificar(token, {})).motivo, "emissor");
  assert.equal((await C.verificar(token, {}, EMISSORES_TESTE)).ok, true);
  // lixo
  assert.equal((await C.verificar("abc")).motivo, "formato");
  assert.equal((await C.verificar("")).motivo, "formato");
  assert.throws(() => C.lerToken(C.b64u(C.utf8(JSON.stringify({ v: 2, k: "x", i: "1", n: "NOME COMPRIDO" }))) + "." + "a".repeat(86)), /Versão/);
});

test("situação pela validade", () => {
  const p = { x: "2026-10" };
  assert.equal(C.situacao(p, new Date(2026, 8, 1)).estado, "valida");
  assert.equal(C.situacao(p, new Date(2026, 9, 15)).estado, "vence");
  assert.equal(C.situacao(p, new Date(2026, 9, 31, 12)).estado, "vence");
  assert.equal(C.situacao(p, new Date(2026, 10, 1, 0, 0, 1)).estado, "vencida");
  assert.match(C.situacao(p, new Date(2026, 10, 1)).texto, /Vencida desde outubro de 2026/);
  assert.match(C.situacao(p, new Date(2026, 1, 1)).texto, /Válida até outubro de 2026/);
  assert.equal(C.fimDaValidade("2026-02").getDate(), 28);
  assert.equal(C.mesExtenso("2027-03"), "março de 2027");
});

test("ativação: arquivo, link, código e token puro", async () => {
  const payload = C.montarPayload(DADOS, "teste");
  const token = await C.assinar(payload, PAR.privada);
  const foto = "data:image/jpeg;base64," + Buffer.from("foto").toString("base64");
  const codigo = C.montarAtivacao({ token, foto });
  assert.deepEqual(C.lerAtivacao(codigo), { token, foto });
  assert.deepEqual(C.lerAtivacao(C.linkAtivacao(codigo, "https://x.example/app/")), { token, foto });
  assert.deepEqual(C.lerAtivacao("  #ativar=" + codigo + "\n"), { token, foto });
  assert.deepEqual(C.lerAtivacao(JSON.stringify(C.arquivoDeAtivacao({ token, foto }))), { token, foto });
  assert.deepEqual(C.lerAtivacao(token), { token, foto: null });
  assert.equal(C.arquivoDeAtivacao({ token }).formato, C.FORMATO_ATIVACAO);
  assert.throws(() => C.lerAtivacao("qualquer coisa"), /Não reconheci/);
  assert.throws(() => C.lerAtivacao(""), /Nada/);
  assert.throws(() => C.lerAtivacao(JSON.stringify({ t: token, p: "data:text/plain;base64,QUJD" })), /imagem/);
  assert.equal(C.tokenDoLink(`https://x.example/v/#${token}`), token);
  assert.equal(C.tokenDoLink(`https://x.example/v/#t=${token}`), token);
  assert.equal(C.tokenDoLink(token), token);
});

test("apresentação", () => {
  assert.equal(C.formatarData("2004-03-18"), "18/03/2004");
  assert.equal(C.formatarValidade("2026-12"), "12/2026");
  assert.equal(C.iniciais("Ana Beatriz Souza Lima"), "AL");
  assert.equal(C.iniciais("Bruna"), "B");
  assert.equal(C.escapar("<b>&\"'"), "&lt;b&gt;&amp;&quot;&#39;");
  assert.equal(C.corValida("0f766e"), "#0F766E");
  assert.equal(C.corValida("verde"), null);
});

test("QR: versão compatível com o tamanho do link e SVG bem formado", async () => {
  const payload = C.montarPayload(DADOS, "teste");
  const token = await C.assinar(payload, PAR.privada);
  const link = C.linkVerificacao(token, "https://diogusvincere.github.io/cie_digital/v/");
  const qr = criarQR(link, "L");
  assert.ok(qr.versao <= 14, `QR versão ${qr.versao} para ${link.length} caracteres`);
  assert.equal(qr.tamanho, 17 + 4 * qr.versao);
  const svg = qrSvg(link, { margem: 2 });
  assert.match(svg, /^<svg [^>]*viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /<path d="M/);
  // os três cantos têm o padrão de localização: módulo escuro no (0,0)
  assert.equal(qr.escuro(0, 0), true);
  assert.equal(qr.escuro(0, qr.tamanho - 1), true);
});

test("cartão em HTML escapa o que vem do payload", () => {
  const p = { ...C.montarPayload(DADOS, "teste"), n: "<IMG SRC=X>" };
  const html = htmlCartao(p, { emissor: { nome: "Faculdade <Teste>", sigla: "FT", cor: "#123456" }, foto: null, qr: "<svg></svg>" });
  assert.ok(html.includes("&lt;IMG SRC=X&gt;"));
  assert.ok(html.includes("Faculdade &lt;Teste&gt;"));
  assert.ok(html.includes("--cor-inst:#123456"));
  assert.ok(!html.includes("<IMG SRC=X>"));
  assert.ok(html.includes("FOTO 0A1B·2C3D"));
  assert.match(etiquetaSituacao({ estado: "vencida", texto: "x" }), /etiqueta erro/);
});

test("os exemplos publicados conferem com a chave do emissor de demonstração", async () => {
  const pasta = path.join(RAIZ, "exemplos");
  const arquivos = (await readdir(pasta)).filter((a) => a.endsWith(".json"));
  assert.ok(arquivos.length >= 3, "faltam exemplos");
  const revogadas = JSON.parse(await readFile(path.join(RAIZ, "revogadas.json"), "utf8"));
  for (const arquivo of arquivos) {
    const ativacao = C.lerAtivacao(await readFile(path.join(pasta, arquivo), "utf8"));
    const r = await C.verificar(ativacao.token, EMISSORES);
    assert.equal(r.ok, true, `${arquivo}: ${r.detalhe}`);
    assert.equal(r.payload.k, "iet-demo");
    assert.equal(await C.hashFoto(ativacao.foto), r.payload.f, `${arquivo}: foto não bate com o código`);
    assert.ok(ativacao.foto.startsWith("data:image/svg+xml;base64,"), "a foto do exemplo é ilustração");
  }
  const carlos = C.lerAtivacao(await readFile(path.join(pasta, "carlos.json"), "utf8"));
  assert.equal(C.situacao(C.lerToken(carlos.token).payload, new Date(2026, 9, 14)).estado, "vencida");
  const bruna = C.lerAtivacao(await readFile(path.join(pasta, "bruna.json"), "utf8"));
  assert.ok(revogadas.ids.includes(`iet-demo:${C.lerToken(bruna.token).payload.i}`));
});

test("a chave de demonstração do emissor casa com a pública publicada", async () => {
  const demo = JSON.parse(await readFile(path.join(RAIZ, "chaves", "demo-emissor.privada.json"), "utf8"));
  assert.deepEqual(C.chavePublicaDa(demo.privada), EMISSORES["iet-demo"].chave);
  const token = await C.assinar(C.montarPayload(DADOS, "iet-demo"), demo.privada);
  assert.equal((await C.verificar(token)).ok, true);
});
