/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64, decodificarEsalvar } = require('./tratamentoDados');
const { retornaCampo } = require('./manipulacaoJSON');
const axios = require('axios');
const xml2js = require('xml2js');

var Dominio, ChaveCaixa, xBytesParametros, Password, TpSync, DateTime;
// ...resto do código...
function setDate(){
  console.log('cheguei aqui')
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
<<<<<<< HEAD
  data.setHours(data.getHours() - 3);
  data.setMinutes(data.getMinutes() - minutos);
  data.setSeconds(data.getSeconds() - segundos); 
=======
>>>>>>> sincronizacao-continua
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:0'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  DateTime = data;
  console.log(DateTime)
  return DateTime;
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
    let chaveRetorno = await retornaCampo('chave');
    ChaveCaixa = chaveRetorno;
  } catch (err) {
    console.error('Erro ao retornar dados:', err);
  }
}

function getData(data){
    DateTime = data + ':00-03:0';
    console.log(DateTime);
    return DateTime;
}

// Função assíncrona para retornar o Dominio
async function getDominio() {
  try {
    let dominioRetorno = await retornaCampo('dominio');
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
      <DhReferencia>${DateTime}</DhReferencia>
    </xmlIntegracao>`);
  } catch (err) {
    console.error('Erro ao codificar xmlReqCadastro:', err);
  }
}
console.log(xBytesParametros);
// Função assíncrona para codificar a senha
async function codificarSenha(){
  try{
    Password = codificarInBase64(setSenha());
  }
  catch (err){
    console.err('Erro ao codificar Senha:', err);
  }
}

// Função para realizar a requisição post dos cadastros
function reqCadastros(Sync) {
  getChaveCaixa()
    .then(() => {
      TpSync = Sync
    })
    .then(() => getDominio())
    .then(() => codificarSenha())
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
<<<<<<< HEAD

=======
      console.log(body);
>>>>>>> sincronizacao-continua
      axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros.asmx', body, { headers })
        .then((response) => {
          console.log(response.data);
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              if ((result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult) == undefined){
                console.log('Sem mudancas a serem carregadas');
              } else{
                let retCadastrosResult = result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult[0];
                decodificarEsalvar(retCadastrosResult);
              }
            }
          });
        })
        .catch((error) => {
          console.error('Erro na requisição:', error);
        });
    })
    .catch((error) => {
      console.error('Erro ao obter dados:', error);
    });
}


function sincronizacaoUnica(data){
  console.log('Cheguei');
    getData(data);
    reqCadastros('1');
}
  

module.exports = {
  setDate, 
  setSenha,
  sincronizacaoUnica,
};
