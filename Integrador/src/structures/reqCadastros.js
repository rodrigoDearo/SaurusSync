/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64, decodificarEsalvar, decodificarEsalvarEstoque } = require('./tratamentoDados');
const { retornaCampo } = require('./manipulacaoJSON');
const { createToken, refreshToken, cadastrarProduto, atualizarProduto, deletarProduto, cadastrarImagem } = require('./configTray');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const { DOMParser } = require('xmldom');


var Dominio, ChaveCaixa, xBytesParametros, Password, TpSync, DateTime, minutos, segundos;

/**
 *  Função para retornar a data a ser enviado para requisição continua Saurus, atribuindo o horário da requisição baseada no tiemr da configuração geral
 * @returns {Datetime}  data no formato ISO8601 para ser enviada no corpo da requisição de cadastro Saurus
 */
function setDate() {
  return new Promise((resolve, reject) => {
    try {
      let data = new Date();
      data.setHours(data.getHours() - 3);
      data.setMinutes(data.getMinutes() - minutos);
      data.setSeconds(data.getSeconds() - segundos);
      let dataISO8601 = data.toISOString();
      data = dataISO8601.slice(0, -5);
      data += '-03:0';
      DateTime = data;
      resolve(DateTime); 
    } catch (error) {
      reject(error);
    }
  });
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
function getTimerJSON() {
  return new Promise(async (resolve, reject) => {
    try {
      let timerRetorno = await retornaCampo('timer');
      let timerValor = timerRetorno.toString();
      minutos = parseInt(timerValor.substring(0, 2));
      segundos = parseInt(timerValor.substring(3, 5));
      resolve(); // Resolving the promise without any data
    } catch (error) {
      reject(error); // Rejecting the promise with the error
    }
  });
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

              if ((result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].xRetNumero[0]) == '1'){
                console.log('Erro na requisição 1');
              } else{
                if(result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult == undefined){
                  wsCadastro();
                }
                else{
                  let retCadastrosResult = result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult[0];
                  await autorizarAcesso(retCadastrosResult)
                  .then(() => {
                    wsCadastro();
                  })
                  .catch((_) => { console.err('Erro ao gerar chaves de acesso') })
                }
              }
            }
          });
        })
        .catch((error) => {
          console.error('Erro na requisição 2:', error);
        });
    })
    .catch((error) => {
      console.error('Erro ao obter dados:', error);
    });
}



function retProdutoEstoque(id) {
  return new Promise((resolve, reject) => {
    getDominio()
      .then(() => codificarSenha())
      .then(() => codificarXmlRetProdutoEstoque(id))
      .then(() => {
        const headers = {
          'Host': 'wsretaguarda.saurus.net.br',
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://saurus.net.br/retProdutoEstoque'
        };

        const body = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <retProdutoEstoque xmlns="http://saurus.net.br/">
              <xBytesParametros>${xBytesParametros}</xBytesParametros>
              <xSenha>${Password}</xSenha>
            </retProdutoEstoque>
          </soap:Body>
        </soap:Envelope>`;

        axios.post('http://wsretaguarda.saurus.net.br/v001/serviceRetaguarda.asmx', body, { headers })
          .then((response) => {
            xml2js.parseString(response.data, async (err, result) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                if (result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero == 1) {
                  console.log('Erro na requisição 3');
                  reject('Erro na requisição 4');
                } else if (result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero == 0) {
                  let retProdutoEstoqueResult = result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].retProdutoEstoqueResult[0];
                  await decodificarEsalvarEstoque(retProdutoEstoqueResult, id)
                  .then(() => {
                    resolve();
                  })
                }
              }
            });
          })
          .catch((error) => {
            console.error('Erro na requisição 5', error);
            reject(error);
          });
      })
      .catch((error) => {
        console.error('Erro na requisição 6', error);
        reject(error);
      });
  });
}


async function getEstoqueXml(id) {
  try {
    const parser = new DOMParser();
    let xmlString = fs.readFileSync(`../GravacaoXMLprodutoEstoque/cadastros-${id}.xml`, { encoding: 'utf8' });
    let xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    let estoqueLojas = xmlDoc.getElementsByTagName('EstoqueLoja');

    let saldoTotal = 0;
    for (let i = 0; i < estoqueLojas.length; i++) {
      let qSaldo = parseFloat(estoqueLojas[i].getAttribute('qSaldo'));
      saldoTotal += qSaldo;
    }

    if (isNaN(saldoTotal)) {
      console.log('saldo zerado');
      saldoTotal = 0;
    }

    return saldoTotal;
  } catch (error) {
    console.error(error);
    throw error;
  }
}




async function wsCadastro() {
  try {
    let name = await retornaCampo('nameFile');
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    let table = xmlDoc.getElementsByTagName('tbProdutoDados')[0];
    if(table==undefined){
      console.log('Sem novos produtos/alterações para cadastro');
      atualizarEstoque();
    }
    else{
      await atualizarEstoque();
      let rows = table.getElementsByTagName('row');
      
    for (let i = 0; i < rows.length; i++) {

      let idProduto = rows[i].getAttribute('pro_idProduto');
      let exclusaoProduto = rows[i].getAttribute('pro_indStatus');


      let descProduto = rows[i].getAttribute('pro_descProduto');
      let custoProduto = rows[i].getAttribute('pro_vCompra');
      let estoqueProduto = 0;

      await retProdutoEstoque(idProduto)
      .then(async () => {
        await getEstoqueXml(idProduto)
        .then(response => {
          estoqueProduto = response;
        })
        .catch((_) => { console.log('Deu erro aqui 1') })
      })
      .then(async () => {
          const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));
          if (dados.produtos[idProduto]) {
            if (exclusaoProduto == "1") {
              let id = dados.produtos[idProduto];
              let idTray = parseInt(id);
              await deletarProduto(idTray)
                .then(() => {
                  delete dados.produtos[idProduto];
                })
                .catch((_) => {
                  console.error(_);
                });
            } else if (exclusaoProduto == "0") {
              let id = dados.produtos[idProduto];
              let idTray = parseInt(id);
              await atualizarProduto(descProduto, null, estoqueProduto, custoProduto, idTray);
            }
          } else {
            if (exclusaoProduto == "1") {

            } else if (exclusaoProduto == "0") {
              await cadastrarProduto(descProduto, estoqueProduto, custoProduto)
              .then(id => {
                dados.produtos[idProduto] = id;
              })              
            }
          }
          fs.writeFileSync('./src/build/produtos.json', JSON.stringify(dados));
          await uploadImages()
          .then(() => {
            uploadPreco();
          })
        })
        .catch((err) => {
          console.error(err);
        });
    
      }
    }
    
  } catch (err) {
    console.error(err);
  }
}


async function atualizarEstoque(){
  return new Promise(async (resolve, reject) => {
    try {
      const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));
      let numeroProdutos = Object.keys(dados.produtos).length;;
      let chaves = Object.keys(dados.produtos);
      let estoqueProduto = 0;

      for(let i=0; i<numeroProdutos; i++){
        let idSaurus = chaves[i];
        let idTray = dados.produtos[idSaurus];
        console.log(`Estou na ${i} leitura. | Id Saurus: ${idSaurus} | Id Tray: ${idTray} |`);
        await retProdutoEstoque(idSaurus)
        .then(async () => {
          await getEstoqueXml(idSaurus)
          .then(response => {
            estoqueProduto = response;
          })
          .then(async () => {
            let id = parseInt(idTray);
            await atualizarProduto(null, null, estoqueProduto, null, id);
          })
          .catch((_) => { console.log(_) })
        })
        .catch((err) => { console.err(err) });
      }
      resolve();
    } catch (error) {
      reject(error)
    }
  })
}


function autorizarAcesso(retCadastrosResult) {
  return new Promise(async (resolve, reject) => {
    try {
      await decodificarEsalvar(retCadastrosResult);

      let data_expiraAcess = await retornaCampo('expira_acessToken');
      let data_expiraRefresh = await retornaCampo('expira_refreshToken');

      let dataAcess = new Date(data_expiraAcess);
      let dataRefresh = new Date(data_expiraRefresh);

      let dataAtual = new Date();

      if (dataAcess < dataAtual) {
        if (dataRefresh < dataAtual) {
          await createToken();
          console.log('Access Token Criado');
        } else {
          await refreshToken();
          console.log('Access Token Atualizado');
        }
      }

      resolve(); 
    } catch (error) {
      reject(error); // Rejecting the promise with the error
    }
  });
}


async function uploadPreco() {
  return new Promise(async (resolve, reject) => {
    let name = await retornaCampo('nameFile');
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    if((xmlDoc.getElementsByTagName('tbProdutoPrecos')) != undefined){
      const table = xmlDoc.getElementsByTagName('tbProdutoPrecos')[0];
      let precos = table.getElementsByTagName('row');

      for (let i = 0; i < precos.length; i++) {
        let precoLeitura = precos[i];
        let idSaurus = precoLeitura.getAttribute('pro_idProduto');
        let idTray = dados.produtos[idSaurus];
        let preco = precoLeitura.getAttribute('pro_vPreco');
        let precoNumber = parseFloat(preco);
        let valorFixado = precoNumber.toFixed(2);

        if(dados.produtos[idSaurus]){
          atualizarProduto(null, valorFixado, null, null, idTray)
          .then(() => {
            console.log('Preco Cadastrado');
          })
          .catch((_) => {
            console.log(_);
            console.log('Erro ao cadastrar preco');
          })
        }

      }
    }
    
  });
}


async function uploadImages() {
  return new Promise(async (resolve, reject) => {
    let name = await retornaCampo('nameFile');
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    if((xmlDoc.getElementsByTagName('tbProdutoImagens')) != undefined){
      const table = xmlDoc.getElementsByTagName('tbProdutoImagens')[0];
      let imagens = table.getElementsByTagName('row');

      for (let i = 0; i < imagens.length; i++) {
        let imageLeitura = imagens[i];
        let idSaurus = imageLeitura.getAttribute('pro_idProduto');
        let idTray = dados.produtos[idSaurus];
        let imagemURL = imageLeitura.getAttribute('pro_localImagem');
        cadastrarImagem(idTray, imagemURL)
        .then(() => {
          console.log('Imagem Cadastrada');
        })
        .catch((_) => {
          console.log('Erro ao cadastrar imagem');
        })
      }
      resolve();
    }
    
  });
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
function sincronizacaoUnica(data){
    getData(data);
    reqCadastros(2);
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
async function sincronizacaoContinua(data){
  await getTimerJSON()
  .then(() => {
    getData(data);
    reqCadastros(1);
    setInterval(async function() {
      await setDate()
      .then(() => {
        reqCadastros(1);
      })
      .catch((err) => { console.log('Erro') });
    }, ((minutos*60)+segundos)*1000);
  }) 
}



module.exports = {
  setDate, 
  setSenha,
  sincronizacaoUnica,
  sincronizacaoContinua
};
