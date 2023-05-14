/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64, decodificarEsalvar} = require('./tratamentoDados');
const { retornaCampo } = require('./manipulacaoJSON');
const { createToken, refreshToken, cadastrarProduto, atualizarProduto, deletarProduto } = require('./configTray');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const { DOMParser } = require('xmldom');


var Dominio, ChaveCaixa, xBytesParametros, Password, TpSync, DateTime, minutos, segundos;

/**
 *  Função para retornar a data a ser enviado para requisição continua Saurus, atribuindo o horário da requisição baseada no tiemr da configuração geral
 * @returns {Datetime}  data no formato ISO8601 para ser enviada no corpo da requisição de cadastro Saurus
 */
function setDate(){
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
  data.setHours(data.getHours() - 3);
  data.setMinutes(data.getMinutes() - minutos);
  data.setSeconds(data.getSeconds() - segundos); 
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:0'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  DateTime = data;
  console.log(DateTime)
  return DateTime;
}

/**
 * Define a senha para ser enviada na requisição para consumir WebService Saurus
 * @returns {senha} no padrão consultado com desenvolvdedores do software
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


/**
 * Fução assíncrona para atribuir valor da chaveCaixa com base no retorno da função retornarCampo
 */
async function getChaveCaixa() {
  try {
    let chaveRetorno = await retornaCampo('chave');
    ChaveCaixa = chaveRetorno;
  } catch (err) {
    console.error('Erro ao retornar dados:', err);
  }
}

/**
 * Atribui os valores de minuto e segundo referente ao timer definido na configuração geral
 */
async function getTimerJSON(){
  try {
    let timerRetorno = await retornaCampo('timer');
    let timerValor = timerRetorno.toString();
    minutos = parseInt(timerValor.substring(0, 2));
    segundos = parseInt(timerValor.substring(3, 5));
  } catch (err) {
    console.error('Erro ao pegar timer JSON', err);
  }
}

/**
 * Função para estrutura data e horário no padrão solicitado
 * @param {*} data data informada no input como base para requisição 
 * @returns {DateTime} a mesma data recebida como parametro porém estruturada no formado solicitado para consumo do WebService (adição do fuso hórario)
 */
function getData(data){
    DateTime = data + ':00-03:0';
    console.log(DateTime);
    return DateTime;
}


/**
 * Fução assíncrona para atribuir valor do Dominio com base no retorno da função retornarCampo
 */
async function getDominio() {
  try {
    let dominioRetorno = await retornaCampo('dominio');
    Dominio = dominioRetorno;
  } catch (err) {
    console.error('Erro ao retornar dados:', err);
  }
}


/**
 * Fução assíncrona para codificar a string do xml a ser enviado para requisição, em formato 64x bytes (padrão solicitado para ser enviado o xBytes)
 */
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


/**
 * Função para codificar a senha en base 64 para ser enviada no corpo da requisição e consumo do WebService
 */
async function codificarSenha(){
  try{
    Password = codificarInBase64(setSenha());
  }
  catch (err){
    console.err('Erro ao codificar Senha:', err);
  }
}


/**
 * Função que realiza a requisção POST para o WebSevice reqCadastros através da biblioteca Axios
 * @param {*} Sync paramêtro informado para realização da requisição (explicação dos valores passados a Sync são explicados na documentação)
 */
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

      axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros.asmx', body, { headers })
        .then((response) => {
          xml2js.parseString(response.data, async (err, result) => {
            if (err) {
              console.error(err);
            } else {
              if ((result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult) == undefined){
                console.log('Sem mudancas a serem carregadas');
              } else{
                let retCadastrosResult = result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult[0];
                processarDados(retCadastrosResult);
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


async function lerDados(){
   try {
    let name = await retornaCampo('nameFile'); 
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    let table = xmlDoc.getElementsByTagName('tbProdutoDados')[0];
    let rows = table.getElementsByTagName('row');

    console.log(`Quantidade de registros: ${rows.length}`);

    for (let i = 0; i < rows.length; i++) {
      let descProduto = rows[i].getAttribute('pro_descProduto');
      let idProduto = rows[i].getAttribute('pro_idProduto');
      console.log(`Produto ${i + 1}: ${idProduto} - ${descProduto}`);
    }

  } catch (err) {
    console.error(err);
  }

}


async function processarDados(retCadastrosResult) {
  await decodificarEsalvar(retCadastrosResult);
  
  let data_expiraAcess = await retornaCampo('expira_acessToken');
  let data_expiraRefresh = await retornaCampo('expira_refreshToken');

  let dataAcess = new Date(data_expiraAcess);
  let dataRefresh = new Date(data_expiraRefresh);

  let dataAtual = new Date();

  if (dataAcess < dataAtual) {
    if(dataRefresh < dataAtual){
      console.log('createToken');
      createToken();
    }
    else{
      console.log('refreshToken');
      refreshToken()
    }
  } 
  else{
    console.log('desnecessario refreshs');
  }

  lerDados();
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
function sincronizacaoUnica(data){
    getData(data);
    reqCadastros('1');
    
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
function sincronizacaoContinua(data){
  getTimerJSON()
  .then(() => {
    getData(data);
    reqCadastros('1');
    //
    setInterval(function() {
      setDate();
      reqCadastros('1');
      //
    }, ((minutos*60)+segundos)*1000);
  })
}



module.exports = {
  setDate, 
  setSenha,
  sincronizacaoUnica,
  sincronizacaoContinua
};
