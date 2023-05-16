/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const axios = require('axios');
const fs = require('fs');
const { resolve } = require('path');

var consumerSecret, consumerKey, code, url, tokenRefresh, acessToken, produto;


/**
 * Função para gravar no arquivo dados.JSOn as informações retornadas na requisição
 * @param {*} dados 
 */
function gravarDados(dados) {
    fs.readFile('./src/build/dados.json', 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
      }
  
      let arquivoJSON = JSON.parse(data);
  
      arquivoJSON.dadosApp.tray.access_token = dados.access_token;
      arquivoJSON.dadosApp.tray.refresh_token = dados.refresh_token;
      arquivoJSON.dadosApp.tray.date_expiration_access_token = dados.date_expiration_access_token;
      arquivoJSON.dadosApp.tray.date_expiration_refresh_token = dados.date_expiration_refresh_token;
      
      fs.writeFile('./src/build/dados.json', JSON.stringify(arquivoJSON), (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Dados Gravados com Sucesso');
        }
      });
    });
  }  
  


/**
 * Função para ler dados.json e parametrizar valores a serem enviados nas requisições
 * @returns gravação dos valores usados na requisição
 */
function leituraDosDados() {
    return new Promise((resolve, reject) => {
      fs.readFile('./src/build/dados.json', 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
  
        let dados = JSON.parse(data);
  
        try {
          consumerKey = dados.dadosApp.tray.consumer_key;
          consumerSecret = dados.dadosApp.tray.consumer_secret;
          code = dados.dadosApp.tray.code;
          url = dados.dadosApp.tray.url;
          tokenRefresh = dados.dadosApp.tray.refresh_token;
          acessToken = dados.dadosApp.tray.access_token;
          
          resolve();
        } catch {
          console.log('Erro na leitura');
          reject(new Error('Erro na leitura dos dados'));
        }
      });
    });
  }


  
/**
 * Função para gerar o token de acesso, função executado quando será gerado o acess_token do cliente pela primeira vez ou quando refresh_token vence
 */
async function createToken() {
    try {
        await leituraDosDados();
  
        let keysValue = new URLSearchParams();
        keysValue.append('consumer_key', consumerKey);
        keysValue.append('consumer_secret', consumerSecret);
        keysValue.append('code', code);
  
        const config = {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
  
        axios.post(`${url}/auth`, keysValue, config)
        .then((response) => {
            gravarDados(response.data);
        })
        .catch((error) => {
            console.log(error);
        });

    } catch (error) {
      console.log(error);
    }
}


/**
 * Função para renovar token de acesso, será executada qando expirar data valida para o acess_token
 */
async function refreshToken(){
    try {
        await leituraDosDados();
        axios.get(`${url}/auth`, { params:{
            refresh_token: tokenRefresh
        } })
        .then((response) => {
            console.log(response.data)
            gravarDados(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
    }
    catch(error){
        console.err(error);
    }
}


async function definirProduto(nome, preco, estoque, precoCompra) {
  return new Promise((resolve, reject) => {
    try {
      const produto = {
        "Product": {
          "ean": "",
          "name": `${nome}`,
          "description": "",
          "description_small": "",
          "price": `100`,
          "cost_price": `${precoCompra}`,
          "promotional_price": "",
          "start_promotion": "",
          "end_promotion": "",
          "brand": "",
          "model": "",
          "weight": "1",
          "length": "",
          "width": "",
          "height": "",
          "stock": `${estoque}`,
          "category_id": "888967495",
          "available": "1",
          "availability": "",
          "availability_days": "",
          "reference": "",
          "hot": "",
          "release": "",
          "additional_button": "",
          "related_categories": "",
          "release_date": "",
          "shortcut": "",
          "virtual_product": ""
        }
      };
      resolve(produto);
    } catch (error) {
      reject(error);
    }
  });
}


async function definirProdutoAtualizado(nome, preco, estoque, precoCompra) {
  return new Promise((resolve, reject) => {
    try {
      let produto = {
        "Product": {
          "name": `${nome}`,
          "price": `100`,
          "cost_price": `${precoCompra}`,
          "stock": `${estoque}`,
          "available": "1"
        }
      };
      resolve(produto);
    } catch (error) {
      reject(error);
    }
  });
}


async function cadastrarProduto(thisnome, thispreco, thisestoque, thisprecoCompra) {
  return new Promise(async (resolve, reject) => {
    try {
      await leituraDosDados();
      const produto = await definirProduto(thisnome, thispreco, thisestoque, thisprecoCompra);
      const response = await axios.post(`${url}/products?access_token=${acessToken}`, produto);
      const idRetorno = response.data.id; // Armazena o valor do ID retornado pela API na variável idRetorno
      resolve(idRetorno);
    } catch (error) {
      reject(error);
    }
  });
}




async function atualizarProduto(thisnome, thispreco, thisestoque, thisprecoCompra, thisid) {
  try {
    let id;
    await leituraDosDados()
      .then(() => {
        id = thisid;
      })
      .then(() => definirProdutoAtualizado(thisnome, thispreco, thisestoque, thisprecoCompra))
      .then(produtoAtualizado => {
        axios.put(`${url}/products/${id}?access_token=${acessToken}`, produtoAtualizado)
          .then(response => {
            console.log('Deu certo');
          })
          .catch(error => {
            console.log('erro');
          });
      });
  } catch (error) {
    console.error(error);
  }
}



async function deletarProduto(thisid) {
  try {
    let id = thisid;
    await leituraDosDados()
      .then(() => {
        axios.delete(`${url}/products/${id}?access_token=${acessToken}`)
          .then(response => {
            console.log('Resposta da API:', response.data);
          })
          .catch(error => {
            console.error('Erro ao fazer requisição:', error);
          });
      });
  } catch (error) {
    console.error(error);
  }
}


module.exports = {
    createToken,
    refreshToken,
    cadastrarProduto,
    atualizarProduto,
    deletarProduto
};


/*
ver se mudança no estoque manda como mundaça para o xml ou deve ser feito lera recorrente. - deve ser feito recorrente 
ver pra refresh ser feito antes de tudo
ver erro JSON que ocorre direto
ver preço e estoque
ver update
ver retornos para front
adicionar input da URL
adicionar visual inicial
*/