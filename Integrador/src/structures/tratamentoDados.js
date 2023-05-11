const zlib = require('zlib');
const fs = require('fs');
const stream = require('stream');
const moment = require('moment');

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
  
  
  function decodificarEsalvar(data) {
    let gzipData = Buffer.from(data, 'base64'); // Converte de base64 para Buffer
    console.log(gzipData)
    zlib.gunzip(gzipData, (err, result) => { // Descompacta os dados
      if (err) {
        console.error(err);
        return;
      }

      let now = moment().utc().format('YYYY-MM-DD');
      let fileName = `cadastros-${now}.xml`;
  
      const readStream = stream.Readable.from(result); // Cria um stream de leitura a partir dos dados descompactados
  
      readStream.pipe(fs.createWriteStream(`../GravacaoXML/${fileName}`)) // Grava os dados em um arquivo
        .on('error', function(err) {
          console.error(err);
        })
        .on('finish', function() {
          console.log('Arquivo descompactado e gravado com sucesso!');
        });
    });
  }


  module.exports = {
    decodificarEsalvar,
    codificarInBase64,
    criarEziparArquivoXml
  };
  
  
  