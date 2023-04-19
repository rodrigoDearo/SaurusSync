/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64 } = require('./tratamentoDados');
const { retornaCampo } = require('./manipulacaoJSON');
const axios = require('axios');
const fs = require('fs');

var TpSync = '1';
var Dominio, ChaveCaixa, xBytesParametros; // Declarar as variáveis

// ...resto do código...
function setDate(){
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:00'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  return data;
}

function setSenha(){
  let dataAtual = new Date();

  let dia = dataAtual.getDate();
  let mes = dataAtual.getMonth();
  let ano = dataAtual.getFullYear() + 1;

  let senha = `ophd02ophd02|@${dia + mes + ano - 2000}|${Dominio}|1`;
  senha = senha.toString();
  return senha;
}

// Função assíncrona para retornar a ChaveCaixa
async function getChaveCaixa() {
  try {
    const chaveRetorno = await retornaCampo('chave');
    ChaveCaixa = chaveRetorno;
  } catch (err) {
    console.error('Erro ao retornar dados:', err);
  }
}

// Função assíncrona para retornar o Dominio
async function getDominio() {
  try {
    const dominioRetorno = await retornaCampo('dominio');
    Dominio = dominioRetorno;
  } catch (err) {
    console.error('Erro ao retornar dados:', err);
  }
}

// Função assíncrona para codificar o xmlReqCadastro
async function codificarXmlReqCadastro() {
  try {
    xBytesParametros = codificarInBase64(`<xmlIntegracao>
      <Dominio>${Dominio}</Dominio>
      <TpArquivo>50</TpArquivo>
      <ChaveCaixa>${ChaveCaixa}</ChaveCaixa>
      <TpSync>${TpSync}</TpSync>
      <DhReferencia>2021-04-13T12:50:07-03:0</DhReferencia>
    </xmlIntegracao>`);
  } catch (err) {
    console.error('Erro ao codificar xmlReqCadastro:', err);
  }
}

// Função para realizar a requisição post dos cadastros
function reqCadastros() {
  getChaveCaixa()
    .then(() => getDominio())
    .then(() => codificarXmlReqCadastro())
    .then(() => {
      const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
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

      console.log('Dominio: ' + Dominio);
      console.log('Chave Caixa: ' + ChaveCaixa);
      console.log(xBytesParametros);
      axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros', body, { headers })
        .then((response) => {
          console.log('Resposta:', response.data);
        })
        .catch((error) => {
          console.error('Erro na requisição:', error);
        });
    })
    .catch((error) => {
      console.error('Erro ao obter dados:', error);
    });
}


module.exports = {
  setDate, 
  setSenha,
  reqCadastros
};


/*
CÓDIGO ANTIGO


*/  