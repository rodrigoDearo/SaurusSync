// ---------------------- FUNÇÃO PARA CRIAR E ZIPAR DADOS  ---------------------- //
/**
 * Função para criar um arquivo XML e retorná-lo compactado
 * @returns {xmlString} - Arquivo XML compactado em GZIP
 */
function criarEziparArquivoXml(){
    let xmlIntegracao = builder.create('xmlIntegracao') // CRIAR XML INTEGRAÇÃO
    .ele('Dominio', Dominio) 
    .ele('TpArquivo', TpArquivo)
    .ele('ChaveCaixa', ChaveCaixa)
    .ele('TpSync', TpSync)
    .ele('DhReferencia', DhReferencia)
    .end({ pretty: true });
  
    let xmlString = xmlIntegracao.toString(); // TRANSFORMA XML EM STRING
    //let compressedXml = zlib.gzipSync(xmlString);  COMPACTA XML
    return xmlString;
  }
  
  
  
  // ---------------------- FUNÇÃO PARA CODIFICAR EM BASE 64 ---------------------- //
  /**
   * Função para codificar valor para base64
   * @param {valueString} - Valor a ser codificada
   * @returns {bytesXmlGzip} - String codificada em base64
   */
  function codificarInBase64(valueString){
    let bytesXmlGzip = Buffer.from(valueString).toString('base64');
    return bytesXmlGzip;
  }
  
  
  // ---------------------- FUNÇÃO PARA DEOCDIGICAR BASE 64 E EXTRAIR ZIP ---------------------- //
  
  /**
   * 
   * @param {data} - String codifica em base64 
   * @returns {text} - Retorna string decodifica em ascii
   */
  function decodificarBase64(data){
    let text = new Buffer.from(data, 'base64').toString('ascii');
    return text;
  }

  
  module.exports = {
    decodificarBase64,
    codificarInBase64,
    criarEziparArquivoXml
  };
  
  
  