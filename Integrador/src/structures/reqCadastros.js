/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const { codificarInBase64, decodificarEsalvar, decodificarEsalvarEstoque } = require('./tratamentoDados');
const { retornaCampo } = require('./manipulacaoJSON');
const { createToken, refreshToken, cadastrarProduto, atualizarProduto, deletarProduto, cadastrarImagem, criarCategoria } = require('./configTray');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const { invalid } = require('moment');


var Dominio, ChaveCaixa, xBytesParametros, Password, TpSync, DateTime, minutos, segundos;
var produtosCadastrados = 0;
var produtosDeletados = 0;
var produtosModificados = 0;
var mensagemRetorno, numeroCadastros;
var sincUnica;
/**
 *  Função para retornar a data a ser enviado para requisição continua Saurus, atribuindo o horário da requisição baseada no tiemr da configuração geral
 * @returns {Datetime}  data no formato ISO8601 para ser enviada no corpo da requisição de cadastro Saurus
 */
function setDate() {
  return new Promise((resolve, reject) => {
    try {
      let data = new Date();
      data.setHours(data.getHours() - 4);
      data.setMinutes(data.getMinutes() - minutos);
      data.setSeconds(data.getSeconds() - segundos);
      console.log(`Data > ${data}`);
      let dataISO8601 = data.toISOString();
      data = dataISO8601.slice(0, -5);
      data += '-03:0';
      DateTime = data;
      console.log('Puxando mudancas desde: ' + DateTime);
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
function setSenha() {
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
    gravarLogErro('Erro ao retornar dados:', err);
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
function getData(data) {
  return new Promise((resolve, reject) => {
    DateTime = data + ':00-03:0';
    console.log(DateTime);
    resolve(DateTime);
  })
}


/**
 * Fução assíncrona para atribuir valor do Dominio com base no retorno da função retornarCampo
 */
async function getDominio() {
  try {
    let dominioRetorno = await retornaCampo('dominio');
    Dominio = dominioRetorno;
  } catch (err) {
    gravarLogErro('Erro ao retornar dados:', err);
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
    gravarLogErro('Erro ao codificar xmlReqCadastro:', err);
  }
}


async function codificarXmlRetProdutoEstoque(idParametro) {
  try {
    let idProdutoColsulta = idParametro;
    xBytesParametros = codificarInBase64(`<xmlIntegracao>
    <Dominio>${Dominio}</Dominio>
    <IdProduto>${idProdutoColsulta}</IdProduto>
    <CodProduto/>
  </xmlIntegracao>`);
  }
  catch (err) {
    gravarLogErro('Erro ao codificar xmlRetProdutoEstoque:', err)
  }
}


/**
 * Função para codificar a senha en base 64 para ser enviada no corpo da requisição e consumo do WebService
 */
async function codificarSenha() {
  try {
    Password = codificarInBase64(setSenha());
  }
  catch (err) {
    console.err('Erro ao codificar Senha:', err);
  }
}


/**
 * Função que realiza a requisção POST para o WebSevice reqCadastros através da biblioteca Axios
 * @param {*} Sync paramêtro informado para realização da requisição (explicação dos valores passados a Sync são explicados na documentação)
 */
function reqCadastros(Sync) {
  return new Promise((resolve, reject) => {
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
                gravarLogErro(err);
              } else {

                if ((result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].xRetNumero[0]) == '1') {
                  reject('Verifique as informações cadastradas, se estão preenchidas corretamente. Caso esteja tudo de acordo entre em contato com desenvolvimento para averiguar');
                } else {
                  if (result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult == undefined) {
                    console.log('Não foi encontrado mudanças para serem carregadas');
                    gravarLog('Não foi encontrado mudanças para serem carregadas');
                    mensagemRetorno = 'Não foi encontrado mudanças para serem carregadas';
                    resolve();
                  }
                  else {
                    let retCadastrosResult = result['soap:Envelope']['soap:Body'][0].retCadastrosResponse[0].retCadastrosResult[0];
                    await autorizarAcesso(retCadastrosResult)
                      .then(async () => {
                        await wsCadastro()
                        .then(async () => {
                          await uploadImages()
                          .then(async () => {
                            await uploadPreco()
                          .then(async () => {
                              await uploadCodigos()
                              .then(() => {
                                resolve();
                              })
                          })
                        })
                        })
                      })
                      .catch((_) => { gravarLogErro('Erro ao gerar chaves de acesso') })
                  }
                }
              }
            });
          })
          .catch((error) => {
            gravarLogErro('Erro na requisição 2:', error);
          });
      })
      .catch((error) => {
        gravarLogErro('Erro ao obter dados:', error);
      });
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
                gravarLogErro(err);
                reject(err);
              } else {
                if (result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero == 1) {
                  gravarLogErro('Erro na requisição 6')
                  resolve(0);
                } else if (result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].xRetNumero == 0) {
                  let retProdutoEstoqueResult = result['soap:Envelope']['soap:Body'][0].retProdutoEstoqueResponse[0].retProdutoEstoqueResult[0];
                  await VerificaAutorizarAcesso()
                  .then(async () => {
                    await decodificarEsalvarEstoque(retProdutoEstoqueResult, id)
                    .then(() => {
                      resolve(1);
                    })
                  })
                }
              }
            });
          })
          .catch((error) => {
            gravarLogErro('Erro na requisição 5');
            resolve(0);
          });
      })
      .catch((error) => {
        gravarLogErro('Erro na requisição 6');
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
      gravarLogErro(`O estoque do produto de id Saurus: ${id} foi zerado devido a um erro ao pegar estoque no XML`);
      saldoTotal = 0;
    }

    return saldoTotal;
  } catch (error) {
    gravarLogErro(error);
    throw error;
  }
}


async function setCategoria(name){
  let idCategoria;
  return new Promise(async (resolve, reject) => {
    try {
      const dados = JSON.parse(fs.readFileSync('./src/build/categoria.json', 'utf8'));

      if(dados.categorias[name]){
        idCategoria = dados.categorias[name];
      }
      else{
        await criarCategoria(name)
        .then(response => {
          dados.categorias[name] = response;
          gravarLog(`Criado categoria ${name} -> ${response}`);
          resolve(response);
        })
      }

      fs.writeFileSync('./src/build/categoria.json', JSON.stringify(dados));
      resolve(idCategoria)
    } catch (error) {
      reject(error)
    }
  })
}


async function wsCadastro() {
  return new Promise(async (resolve, reject) => {
    try {
      let name = await retornaCampo('nameFile');
      let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      let table = xmlDoc.getElementsByTagName('tbProdutoDados')[0];
      if (table == undefined) {
        gravarLog('Sem novos produtos/alterações para cadastro');
        mensagemRetorno = 'Não foi encontrado mudanças para serem carregadas';
        resolve();
      }
      else {
        let rows = table.getElementsByTagName('row');
        numeroCadastros = rows.length;
        gravarLog(`Numero de cadastros: ${numeroCadastros}`);

        for (let i = 0; i < rows.length; i++) {
              await VerificaAutorizarAcesso()
              .then(async () => {
                gravarLog(`Contagem: ${i}`)
                let idProduto = rows[i].getAttribute('pro_idProduto');
                let exclusaoProduto = rows[i].getAttribute('pro_indStatus');
  
                let descProduto = rows[i].getAttribute('pro_descProduto');
                let custoProduto = rows[i].getAttribute('pro_vCompra');
                let estoqueProduto = 0;

                let nameCategoria = rows[i].getAttribute('pro_descCategoria');
                let idCategoria = "";
                if(nameCategoria != "Sem Categoria"){
                  await setCategoria(nameCategoria)
                  .then(response => {
                    idCategoria = response;
                  })
                }
  
                const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));
                if (dados.produtos[idProduto]) {
                  if (exclusaoProduto == "1") {
                    let id = dados.produtos[idProduto];
                    let idTray = parseInt(id);
                    await deletarProduto(idTray)
                      .then(() => {
                        delete dados.produtos[idProduto];
                        gravarLog(`Produto deletado: ${idProduto}`);
                        produtosDeletados++;
                      })
                      .catch((_) => {
                        gravarLogErro(_);
                      });
                  } else if (exclusaoProduto == "0") {
                    gravarLog(`Produto já cadastrado, id ${idProduto}`);
                    if(sincUnica==0){
                      let id = dados.produtos[idProduto];
                      let idTray = parseInt(id);
                      await retProdutoEstoque(idProduto)
                      .then(async sucess => {
                        if (sucess == 1) {
                          await getEstoqueXml(idProduto)
                            .then(response => {
                              estoqueProduto = response;
                            })
                            .catch((_) => { gravarLogErro('Deu erro aqui 1') })
                        }
                        else {
                          gravarLogErro(`Estoque do produto ${idProduto} foi zerado devido à um TIMEOUT na requisição`);
                          estoqueProduto = '0';
                        }
                      })
                      .then(async() =>{
                        await atualizarProduto(descProduto, null, estoqueProduto, custoProduto, idCategoria, null, idTray);
                      })
                    }
                    else{
                      produtosModificados++;
                    }
                  }
                } else {
                  if (exclusaoProduto == "1") {
                    gravarLog(`Produto não cadastrado pois se encontra deletado, id ${idProduto}`);
                  } else if (exclusaoProduto == "0") {
                    await retProdutoEstoque(idProduto)
                      .then(async sucess => {
                        if (sucess == 1) {
                          await getEstoqueXml(idProduto)
                            .then(response => {
                              estoqueProduto = response;
                            })
                            .catch((_) => { gravarLogErro('Deu erro aqui 1') })
                        }
                        else {
                          gravarLogErro(`Estoque do produto ${idProduto} foi zerado devido à um TIMEOUT na requisição`);
                          estoqueProduto = '0';
                        }
                      })
                      .then(async () => {
                        await cadastrarProduto(descProduto, estoqueProduto, custoProduto, idCategoria)
                          .then(id => {
                            dados.produtos[idProduto] = id;
                            produtosCadastrados++;
                            gravarLog(`Produto ${descProduto} cadastrado, ${idProduto} -> ${id}`);
                          })
                      })
                  }
                }
                fs.writeFileSync('./src/build/produtos.json', JSON.stringify(dados));
              })
              .catch((_) => {
                gravarLogErro(_)
              })    
        }
          mensagemRetorno = `Sincronização concluída. ${numeroCadastros} recebidos. ${produtosCadastrados} produtos cadastrados. ${produtosDeletados} produtos deletados. ${produtosModificados} já cadastrados antes.`;
          resolve(); 
        }
    } catch (err) {
      reject(err);
      gravarLogErro(err);
    }
  });
}


async function atualizarEstoque() {
  return new Promise(async (resolve, reject) => {
    refreshToken();
    try {
      const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));
      let numeroProdutos = Object.keys(dados.produtos).length;;
      let chaves = Object.keys(dados.produtos);
      let estoqueProduto = 0;

      for (let i = 0; i < numeroProdutos; i++) {
        await VerificaAutorizarAcesso()
        .then(async () => {
          let idSaurus = chaves[i];
          let idTray = dados.produtos[idSaurus];
          await retProdutoEstoque(idSaurus)
            .then(async () => {
              await getEstoqueXml(idSaurus)
                .then(response => {
                  estoqueProduto = response;
                })
                .then(async () => {
                  let id = parseInt(idTray);
                  await atualizarProduto(null, null, estoqueProduto, null, null, null, id);
                  gravarLog(`Atualizado estoque do produto de idTray: ${idTray}`);
                })
                .catch((_) => { console.log(_) })
            })
            .catch((err) => { console.err(err) });
        })
      }
      resolve('Estoque dos produtos foram atualizados com sucesso');
    } catch (error) {
      reject('Não foi possível atualizar o estoque, entre em contato com desenvolvimento');
      gravarLogErro(error);
    }
  })
}


function VerificaAutorizarAcesso() {
  return new Promise(async (resolve, reject) => {
    try {

      let data_expiraAcess = await retornaCampo('expira_acessToken');
      let data_expiraRefresh = await retornaCampo('expira_refreshToken');

      let dataAcess = new Date(data_expiraAcess);
      let dataRefresh = new Date(data_expiraRefresh);

      let dataAtual = new Date();

      if (dataAcess < dataAtual) {
        if (dataRefresh < dataAtual) {
          await createToken()
          .then(() => {
            gravarLog('Access Token Criado');
            setTimeout(() => {
              resolve();
            })
          })
        } else {
          await refreshToken()
          .then(() => {
            gravarLog('Access Token Atualizado');
            setTimeout(() => {
              resolve();
            }, 5000)
          })
        }
      }
      else if(dataAcess=='Invalid Date'){
        await createToken()
          .then(() => {
            gravarLog('Access Token Criado');
            setTimeout(() => {
              resolve();
            }, 5000);
          })
      }
      else{
        resolve();
      }

    } catch (error) {
      reject(error); // Rejecting the promise with the error
      gravarLogErro(error);
    }
  });
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
          await createToken()
          .then(() => {
            gravarLog('Access Token Criado');
            setTimeout(() => {
              resolve();
            }, 5000);
          })
        } else {
          await refreshToken()
          .then(() => {
            gravarLog('Access Token Atualizado');
            setTimeout(() => {
              resolve();
            }, 5000);
          })
        }
      }
      else if(dataAcess=='Invalid Date'){
        await createToken()
          .then(() => {
            gravarLog('Access Token Criado');
            setTimeout(() => {
              resolve();
            }, 5000);
          })
      }
      else{
        resolve();
      }
    } catch (error) {
      reject(error); // Rejecting the promise with the error
      gravarLogErro(error);
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

    if ((xmlDoc.getElementsByTagName('tbProdutoPrecos')) != undefined) {
      const table = xmlDoc.getElementsByTagName('tbProdutoPrecos')[0];
      let precos = table.getElementsByTagName('row');
      let quantidadeRegistro = precos.length;
      gravarLog(`Encontrado ao todo ${quantidadeRegistro} registros de preco. Iniciando leitura`);

      for (let i = 0; i < quantidadeRegistro; i++) {
        await VerificaAutorizarAcesso()
        .then(() => {
          let precoLeitura = precos[i];
          let idSaurus = precoLeitura.getAttribute('pro_idProduto');
          let tabPreco = precoLeitura.getAttribute('pro_idTabPreco');
          let idTray = dados.produtos[idSaurus];
          let preco = precoLeitura.getAttribute('pro_vPreco');
          let precoNumber = parseFloat(preco);
          let valorFixado = precoNumber.toFixed(2);
  
          if (dados.produtos[idSaurus] && tabPreco=="1") {
            atualizarProduto(null, valorFixado, null, null, null, null, idTray)
              .then(() => {
                gravarLog(`Preco ${valorFixado} Cadastrado no id ${idTray} com sucesso`);
              })
              .catch((_) => {
                gravarLogErro(_);
                gravarLogErro(`Erro ao cadastrar preco do id ${idTray}`);
              })
          }
        })
  
      }
    }
    resolve();
  });
}


async function uploadImages() {
  return new Promise(async (resolve, reject) => {
    let name = await retornaCampo('nameFile');
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const table = xmlDoc.getElementsByTagName('tbProdutoImagens')[0];

    if (table != undefined) {
      let imagens = table.getElementsByTagName('row');
      let quantidadeRegistro = imagens.length;
      gravarLog(`Encontrado ao todo ${quantidadeRegistro} registros de imagens. Iniciando leitura`);

      for (let i = 0; i < quantidadeRegistro; i++) {
        await VerificaAutorizarAcesso()
        .then(() => {
          let imageLeitura = imagens[i];
          let idSaurus = imageLeitura.getAttribute('pro_idProduto');
          let idTray = dados.produtos[idSaurus];
          let imagemURL = imageLeitura.getAttribute('pro_localImagem');
          cadastrarImagem(idTray, imagemURL)
            .then(() => {
              gravarLog(`Imagem ${imagemURL} foi cadastrada no id ${idTray} com sucesso`);
            })
            .catch((_) => {
              gravarLogErro(`Erro ao cadastrar imagem ${imagemURL} no id ${idTray}`);
            })
        })
      }

    }
    resolve();
  });
}


async function uploadCodigos() {
  return new Promise(async (resolve, reject) => {
    let name = await retornaCampo('nameFile');
    let xmlString = fs.readFileSync(`../GravacaoXML/${name}`, 'utf8');
    const dados = JSON.parse(fs.readFileSync('./src/build/produtos.json', 'utf8'));

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    if ((xmlDoc.getElementsByTagName('tbProdutoCodigos')) != undefined) {
      const table = xmlDoc.getElementsByTagName('tbProdutoCodigos')[0];
      let codigos = table.getElementsByTagName('row');
      let quantidadeRegistro = codigos.length;
      gravarLog(`Encontrado ao todo ${quantidadeRegistro} registros de codigos. Iniciando leitura`);

      for (let i = 0; i < quantidadeRegistro; i++) {
        await VerificaAutorizarAcesso()
        .then(() => {
          let codigoLeitura = codigos[i];
          let idSaurus = codigoLeitura.getAttribute('pro_idProduto');
          let idTray = dados.produtos[idSaurus];
          let codigo = codigoLeitura.getAttribute('pro_codProduto');
  
          if (dados.produtos[idSaurus]) {
            atualizarProduto(null, null, null, null, null, codigo, idTray)
              .then(() => {
                gravarLog(`Codigo ${codigo} Cadastrado no id ${idTray} com sucesso`);
              })
              .catch((_) => {
                gravarLogErro(_);
                gravarLogErro(`Erro ao cadastrar codigo do id ${idTray}`);
              })
          }
        })
  
      }
    }
    resolve();
  });
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
async function sincronizacaoUnica(data) {
  return new Promise(async (resolve, reject) => {
    sincUnica = 1;
    await getData(data)
    .then(async() => {
      await reqCadastros('1');
    })
    .then(() => {
      resolve(mensagemRetorno);
    })
    .catch((erro) => {
      reject(erro);
    })
  })
}


/**
 * Função para definir horário a ser usado na requisição e chamar função para realizar o consumo da API
 * @param {*} data parametro referente ao horário a ser usado na requisição
 */
async function sincronizacaoContinua(data) {
  return new Promise(async (resolve, reject) => {
    await getTimerJSON()
      .then(() => {
        sincUnica = 0;
      })
      .then(() => {
        getData(data);
        return reqCadastros('1')
      })
      .then(() => {
        setInterval(async function () {
          await setDate()
            .then(async (response) => {
              console.log(`Tempo lido ${minutos}:${segundos} ----- ${response}`);
              gravarLog("======== SINCRONIZAÇÃO AUTOMÁTICA ========")
              await reqCadastros('1')
              .then(async() => {
                await atualizarEstoque();
              })
            })
            .catch((err) => { throw new Error('Verifique as informações cadastradas, se estão preenchidas corretamente. Caso esteja tudo de acordo, entre em contato com o desenvolvimento para averiguar.'); });
        }, ((minutos * 60) + segundos) * 1000);
      })
      .catch(erro => {    //LINHA 686
        reject(erro);
      })
  })
}


function gravarLog(mensagem) {
  if (!fs.existsSync('../logs')) {
    fs.mkdirSync('../logs');
  }
  const data = new Date();
  data.setHours(data.getHours() - 3);
  const dataFormatada = `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`;
  const logMessage = `[${data.toISOString()}]: ${mensagem}\n`;
  const logFileName = `../../../logs/log_${dataFormatada}.txt`;
  const logFilePath = path.join(__dirname, logFileName);
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Erro ao gravar o log:', err);
    } else {
      console.log('Log gravado com sucesso!');
    }
  });
}

function gravarLogErro(mensagem) {
  if (!fs.existsSync('../logs')) {
    fs.mkdirSync('../logs');
  }
  
  if (!fs.existsSync('../logs/logsErr')) {
    fs.mkdirSync('../logs/logsErr');
  }

  const data = new Date();
  data.setHours(data.getHours() - 3);
  const dataFormatada = `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`;
  const logMessage = `[${data.toISOString()}]: ${mensagem}\n`;
  const logFileName = `../../../logs/logsErr/log_${dataFormatada}Err.txt`;
  const logFilePath = path.join(__dirname, logFileName);

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Erro ao gravar o log:', err);
    } else {
      console.log('Log gravado com sucesso!');
    }
  });
}

module.exports = {
  setDate,
  setSenha,
  sincronizacaoUnica,
  sincronizacaoContinua,
  atualizarEstoque,
  setCategoria
};