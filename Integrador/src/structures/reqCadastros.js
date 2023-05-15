/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64, decodificarEsalvar, decodificarEsalvarEstoque } = require('./tratamentoDados');
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


async function codificarXmlRetProdutoEstoque(idParametro){
  try {
    let idProdutoColsulta = idParametro;
    xBytesParametros = codificarInBase64(`<xmlIntegracao>
    <Dominio>${Dominio}</Dominio>
    <IdProduto>${idProdutoColsulta}</IdProduto>
    <CodProduto/>
  </xmlIntegracao>`);
  }
  catch(err){
    console.err('Erro ao codificar xmlRetProdutoEstoque:', err)
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
      TpSync = Sync;
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
                autorizarAcesso(retCadastrosResult);
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



async function retProdutoEstoque(id) {
    getDominio()
    .then(() => codificarSenha())
    .then(() => codificarXmlRetProdutoEstoque(id))
    .then(() => {
      const headers = {
        'Host': 'wsretaguarda.saurus.net.br',
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://saurus.net.br/retProdutoEstoque'
      }

      const body = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <retProdutoEstoque xmlns="http://saurus.net.br/">
            <xBytesParametros>${xBytesParametros}</xBytesParametros>
            <xSenha>${Password}</xSenha>
          </retProdutoEstoque>
        </soap:Body>
      </soap:Envelope>`
      axios.post('http://wsretaguarda.saurus.net.br/v001/serviceRetaguarda.asmx', body, { headers })
        .then((response) => {
          xml2js.parseString(response.data, async (err, result) => {
            if (err) {
              console.error(err);
            } else {
              if ((result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero) == 1){
                console.log('Erro na requisição');
              } else if((result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero) == 0){
                let retProdutoEstoqueResult = result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].retProdutoEstoqueResult[0];
                await decodificarEsalvarEstoque(retProdutoEstoqueResult, id);
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


async function getPrecoFromXml(xmlString, id) {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const table = xmlDoc.getElementsByTagName('tbProdutoPrecos')[0];
    let rowNodes = table.getElementsByTagName('row');

    let preco;
    for (let i = 0; i < rowNodes.length; i++) {
      const rowNode = rowNodes[i];
      if (rowNode.getAttribute('pro_idProduto') == id) {
        preco = rowNode.getAttribute('pro_vPreco');
        break;
      }
    }
    if (preco !== null) {
      resolve(preco);
    } else {
      reject(new Error('Could not find preco for pro_idProduto="10"'));
    }
  });
}


async function getEstoqueXml(id) {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    let xmlString = fs.readFileSync(`../GravacaoXMLprodutoEstoque/cadastros-${id}.xml`, 'utf8');
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const estoqueLojas = xmlDoc.getElementsByTagName('EstoqueLoja');

    let saldoTotal = 0;
    for (let i = 0; i < estoqueLojas.length; i++) {
      const qSaldo = parseFloat(estoqueLojas[i].getAttribute('qSaldo'));
      saldoTotal += qSaldo;
    }
    if(saldoTotal==undefined){
      console.log('saldo zerado');
      saldoTotal = 0;
    }
    resolve(parseInt(saldoTotal));
  });
}


async function wsCadastro(){
   try {
    let name = await retornaCampo('nameFile'); 
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    let table = xmlDoc.getElementsByTagName('tbProdutoDados')[0];
    let rows = table.getElementsByTagName('row');

    for (let i = 0; i < rows.length; i++) {
      
      let idProduto = rows[i].getAttribute('pro_idProduto');
      let exclusaoProduto = rows[i].getAttribute('pro_indStatus');

      
      let descProduto = rows[i].getAttribute('pro_descProduto');
      let provPreco = parseFloat(await getPrecoFromXml(xmlString, idProduto));
      let precoProduto = provPreco.toFixed(2);
      let custoProduto = rows[i].getAttribute('pro_vCompra');
      let marcaProduto = rows[i].getAttributeNS('pro_descMarca');
      let estoqueProduto;

      await retProdutoEstoque(idProduto);
      await getEstoqueXml(idProduto).then((saldoTotal) => {
          estoqueProduto = saldoTotal;
      }).catch((err) => {
        console.error(err);
      });
      
      const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));
      if (dados.produtos[idProduto]) {
          if(exclusaoProduto=="1"){
            let idTray = dados.produtos[idProduto];
            await deletarProduto(idTray)
            .then(() => {
              delete dados.produtos[idProduto];
            })
            .catch((_) => { console.err(_)})
          }
          else if(exclusaoProduto=="0"){                       
            let idTray = dados.produtos[idProduto];
            await atualizarProduto(descProduto, precoProduto, estoqueProduto, custoProduto, marcaProduto, idTray);
          }
      } else {
          if(exclusaoProduto=="1"){
           
          }
          else if(exclusaoProduto=="0"){
            dados.produtos[idProduto] = descProduto;
            await cadastrarProduto(descProduto, precoProduto, estoqueProduto, custoProduto, marcaProduto);
          }
      }
      fs.writeFileSync('./src/build/produtos.json', JSON.stringify(dados));
    }

  } catch (err) {
    console.error(err);
  }

}


async function autorizarAcesso(retCadastrosResult) {
  await decodificarEsalvar(retCadastrosResult);
  
  let data_expiraAcess = await retornaCampo('expira_acessToken');
  let data_expiraRefresh = await retornaCampo('expira_refreshToken');

  let dataAcess = new Date(data_expiraAcess);
  let dataRefresh = new Date(data_expiraRefresh);

  let dataAtual = new Date();

  if (dataAcess < dataAtual) {
    if(dataRefresh < dataAtual){
      createToken();
    }
    else{
      refreshToken()
    }
  } 

  wsCadastro();
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
function sincronizacaoUnica(data){
    getData(data);
    reqCadastros(1);
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
function sincronizacaoContinua(data){
  getTimerJSON()
  .then(() => {
    getData(data);
    reqCadastros(1);
    //
    setInterval(function() {
      setDate();
      reqCadastros(2);
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
