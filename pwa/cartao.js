// O cartão (frente e verso) como HTML: o mesmo desenho no app do estudante e na prévia do emissor.
import { escapar, formatarCodigoFoto, formatarData, formatarValidade, iniciais, corValida } from "./comum.js";

export const COR_PADRAO = "#0F766E";

/**
 * payload: o conteúdo da carteirinha (ver comum.js). emissor: { nome, sigla, cor, logo } da instituição (vem de
 * emissores.js, não do token). opcoes: { foto (data URL), qr (SVG do verso), fotoConfere (false mostra o aviso) }.
 */
export function htmlCartao(payload, { emissor = {}, foto = null, qr = "", fotoConfere = true } = {}) {
  const corInst = corValida(emissor.cor) || COR_PADRAO;
  const instituicao = emissor.nome || "Instituição de ensino";
  const sigla = emissor.sigla || "";
  const logo = emissor.logo && /^data:image\//.test(emissor.logo) ? `<img class="logo-inst" src="${escapar(emissor.logo)}" alt="">` : "";
  const codigoFoto = payload.f ? formatarCodigoFoto(payload.f) : "";
  const fotoHtml = foto && fotoConfere
    ? `<img src="${escapar(foto)}" alt="Foto de ${escapar(payload.n)}">`
    : `<div class="iniciais" aria-label="Sem foto">${escapar(iniciais(payload.n))}</div>`;
  const avisoFoto = foto && !fotoConfere ? `<span class="foto-aviso" title="A foto deste aparelho não é a emitida pela instituição">foto não confere</span>` : "";
  return `
  <div class="cartao-interno">
    <div class="cartao-face frente" style="--cor-inst:${corInst}">
      <div class="faixa-inst">
        ${logo}${sigla ? `<span class="sigla">${escapar(sigla)}</span>` : ""}
        <span class="inst">${escapar(instituicao)}</span>
      </div>
      <div class="miolo">
        <div class="foto">${fotoHtml}${codigoFoto ? `<span class="cod-foto">FOTO ${codigoFoto}</span>` : ""}${avisoFoto}</div>
        <div class="dados">
          <div class="rotulo">Estudante</div>
          <div class="nome">${escapar(payload.n)}</div>
          <div class="curso">${escapar(payload.c)}</div>
          <div class="nivel">${escapar(payload.g)}</div>
          <dl>
            <div><dt>Matrícula</dt><dd>${escapar(payload.i)}</dd></div>
            <div><dt>Validade</dt><dd>${escapar(formatarValidade(payload.x))}</dd></div>
          </dl>
        </div>
      </div>
      <div class="rodape-cartao">
        <span>Carteirinha institucional</span>
        <span class="selo-digital">assinada digitalmente</span>
      </div>
    </div>
    <div class="cartao-face verso" style="--cor-inst:${corInst}">
      <div class="qr-verso">${qr || '<div class="qr-vazio">QR</div>'}</div>
      <div class="verso-texto">
        <b>Verificação</b>
        <p>Aponte a câmera para o QR: abre a página de verificação, que confere a assinatura da instituição mesmo sem internet.</p>
        <dl>
          ${payload.d ? `<div><dt>Nascimento</dt><dd>${escapar(formatarData(payload.d))}</dd></div>` : ""}
          <div><dt>Emitida em</dt><dd>${escapar(formatarData(payload.m))}</dd></div>
          <div><dt>Emissor</dt><dd>${escapar(payload.k)}</dd></div>
        </dl>
        <small>Documento institucional de ${escapar(instituicao)} · não é a CIE da Lei 12.933/2013 · sem direito à meia-entrada</small>
      </div>
    </div>
  </div>`;
}

/** Classe e texto da etiqueta de situação. */
export function etiquetaSituacao(sit) {
  const classe = sit.estado === "valida" ? "ok" : sit.estado === "vence" ? "atencao" : "erro";
  return `<span class="etiqueta ${classe}">${escapar(sit.texto)}</span>`;
}
