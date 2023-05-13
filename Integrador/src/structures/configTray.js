/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const axios = require('axios');
const fs = require('fs');

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


async function definirProduto(nome, preco, estoque, precoCompra, marca){
  try{
    produto = {
        "Product": {
        "ean": "",
        "name": `${nome}`,
        "description": "",
        "description_small": "",
        "price": `${preco}`,
        "cost_price": `${precoCompra}`,
        "promotional_price": "",
        "start_promotion": "",
        "end_promotion": "",
        "brand": `${marca}`,
        "model": "",
        "weight": "1",
        "length": "",
        "width": "",
        "height": "",
        "stock": `${estoque}`,
        "category_id": "",
        "available": "",
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
    }
  }
  catch(error){
    console.err(error);
  }
}


async function cadastrarProduto(thisnome, thispreco, thisestoque, thisprecoCompra, thismarca){
    try {
      await leituraDosDados()
      .then(await definirProduto(thisnome, thispreco, thisestoque, thisprecoCompra, thismarca))
      .then(() => {
        axios.post(`${url}/products?access_token=APP_ID-5005-STORE_ID-391250-61ac44f87f7ca2426f9943b7082ef7e74925fe45b193f14b12f391606cc9760e`, produto)
        .then(function (response) {
        console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
      })
    
    }
    catch(error){
      console.err(error);
    }
}


async function atualizarProduto(){
  try {
    await leituraDosDados();
    let id = 1356613263;      //produto
    axios.put(`${url}/products/${id}?access_token=${acessToken}`, {
      "Product":{
        "price": 4.5
      }
    })
    .then(response => {
      console.log('Resposta da API:', response.data);
    })
    .catch(error => {
      console.error('Erro ao fazer requisição:', error);
    });
  }
  catch(error){
    console.err(error);
  }
}


async function deletarProduto(){
  try {
    await leituraDosDados();
    let id = 1356613257;
    axios.delete(`${url}/products/${id}?access_token=${acessToken}`)
    .then(response => {
      console.log('Resposta da API:', response.data);
    })
    .catch(error => {
      console.error('Erro ao fazer requisição:', error);
    });
  }
  catch(error){
    console.err(error);
  }
}

module.exports = {
    createToken,
    refreshToken,
    cadastrarProduto,
    atualizarProduto,
    deletarProduto
};