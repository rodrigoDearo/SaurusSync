/* ---------------------- IMPORTAÇÃO DE MÓDULOS ----------------------*/
const axios = require('axios');
const fs = require('fs');

var consumerSecret, consumerKey, code, url, tokenRefresh;


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


async function cadastrarProduto(){
    try {
      axios.post('{{api_address}}/products?access_token={{access_token}}', {
        'Product[ean]': '98799979789879',
        'Product[name]': 'Produto Teste API',
        'Product[description]': 'Descrição do Produto de Teste da API',
        'Product[description_small]': 'Produto de Teste da API',
        'Product[price]': '10.01',
        'Product[cost_price]': '10.01',
        'Product[promotional_price]': '10.01',
        'Product[start_promotion]': '2019-04-01',
        'Product[end_promotion]': '2019-04-30',
        'Product[brand]': 'Marca',
        'Product[model]': 'Modelo',
        'Product[weight]': '1000',
        'Product[length]': '10',
        'Product[width]': '10',
        'Product[height]': '10',
        'Product[stock]': '100',
        'Product[category_id]': '2',
        'Product[available]': '1',
        'Product[availability]': 'Disponível em 3 dias',
        'Product[availability_days]': '3',
        'Product[reference]': '111',
        'Product[hot]': '1',
        'Product[release]': '1',
        'Product[additional_button]': '0',
        'Product[related_categories]': '[3,5,7]',
        'Product[release_date]': '""',
        'Product[shortcut]': '""',
        'Product[virtual_product]': '0'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log('Unexpected HTTP status: ' + error.response.status + ' ' + error.response.statusText);
      });
    }
    catch(error){
      console.err(error);
    }
}

module.exports = {
    createToken,
    refreshToken
};