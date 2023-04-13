/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64 } = require('./tratamentoDados');
const axios = require('axios');


/* ---------------------- DEFINIÇÃOD E VARIÁVEIS ---------------------- */
var TpArquivo = '50';
var ChaveCaixa = "0F38F081-6B77-4464-8C7E-FC686FB5B57B";
var TpSync = '1';
var DhReferencia = setDate(); // ESSA VARIAVEL DEVERA SER ALTERADA DEPENDENDO DO TIPO DE CARGA
var Dominio = "testesdrsistema";
var xmlReqCadastro = `<xmlIntegracao>
  <Dominio>${Dominio}</Dominio>
  <TpArquivo>${TpArquivo}</TpArquivo>
  <ChaveCaixa>${ChaveCaixa}</ChaveCaixa>
  <TpSync>${TpSync}</TpSync>
  <DhReferencia>2021-04-13T12:50:07-03:0</DhReferencia>
</xmlIntegracao>`;
var xBytesParametros = codificarInBase64(xmlReqCadastro);



// ---------------------- FUNÇÃO PARA DEFINIR SENHA ---------------------- //
/**
 * Função para gerar a Senha da requisição com base no padrão
 * @returns {senha} - String da senha a ser utilizada na requisição POST reqCadastros()
 */
function setSenha(){
  let dataAtual = new Date();
  
  let dia = dataAtual.getDate();
  let mes = dataAtual.getMonth();
  let ano = dataAtual.getFullYear() + 1;

  let senha = `ophd02ophd02|@${dia + mes + ano - 2000}|${Dominio}|1`;
  senha = senha.toString();
  return senha;
}

// ---------------------- FUNÇÃO PARA PUXAR HORÁRIO ---------------------- //

/**
* Função para gerar e retornar data no padrão  ISO 8601
* @returns {data} - String referenciando a data no formato  ISO 8601 e fuso horário de brasilia (-3:00)
*/
function setDate(){
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:00'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  return data;
}

 module.exports = { 
  setDate, 
  setSenha,
  reqCadastros
};

var Password = codificarInBase64(setSenha());

// ---------------------- FUNÇÃO DA REQUISIÇÃO ---------------------- //
/**
 * Função para realizar a requisição post dos cadastros utilizando biblitoeca AXIOS
 */
function reqCadastros(){
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    //Content-Length: length
    'SOAPAction': 'http://saurus.net.br/retCadastros'
  }

  const body = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <retCadastros xmlns="http://saurus.net.br/">
        <xBytesParametros>${xBytesParametros}</xBytesParametros>
        <xSenha>${Password}</xSenha>
      </retCadastros>
    </soap:Body>
  </soap:Envelope>`

  axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros.asmx', body, { headers })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      console.log('Requisição Finalizada');
    })   
}
