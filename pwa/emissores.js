// Emissores em que a verificação confia: identificador -> nome, sigla, cor e CHAVE PÚBLICA (JWK EC P-256).
// Gerado por ferramentas/preparar-demo.mjs. Uma instituição real acrescenta a sua entrada aqui (só a pública).
// Campos: nome, sigla, cor (hex), logo (data URL de imagem pequena, opcional) e chave (JWK público).
export const EMISSORES = {
  "iet-demo": {
    "nome": "Instituto Exemplo de Tecnologia",
    "sigla": "IET",
    "cor": "#0F766E",
    "logo": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMwRjc2NkUiLz48cGF0aCBkPSJNMTQgNDRWMjBoNnYyNHpNMjYgMjBoMTZ2NUgzMnY0aDl2NWgtOXY1aDEwdjVIMjZ6TTQ0IDIwaDhsLTQgMTB6IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0NiIgcj0iNSIgZmlsbD0iI0I4RTk1MiIvPjwvc3ZnPg==",
    "chave": {
      "kty": "EC",
      "crv": "P-256",
      "x": "VcJQ3LbG2-d5yAdTVHDTkaflFGDjEElNl4eBE5XUqDE",
      "y": "7D8rhcY-I87919HqAR2kLunDWfMr9rx4wc0gbNUGrHU"
    }
  }
};
