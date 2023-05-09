const fs = require('fs');

/**
 * Função para salvar em um banco de dados não relacional as informações para agilizar próximas cargas
 * @param {*} campo1 Caso não nulo, é uma informação para ser cadastrada
 * @param {*} campo2 Caso não nuulo, é outra informalção para ser cadastrada
 * @param {string} systemSave Informa qual tabela do arquivo JSOn pertence a informação
 */
function salvarDados(campo1, campo2, campo3, systemSave){
  fs.readFile('./src/build/dados.json', 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  
    try {
      let dadosApp = JSON.parse(data);
    
    switch (systemSave) {
      case 'saurus':
        dadosApp.dadosApp.saurus.chave = campo1;
        dadosApp.dadosApp.saurus.dominio = campo2;
        break;
    
      case 'geral':
        dadosApp.dadosApp.geral.timer = campo1;
        break;

      case 'tray':
        dadosApp.dadosApp.tray.consumer_key = campo1;
        dadosApp.dadosApp.tray.consumer_secret = campo2;
        dadosApp.dadosApp.tray.code = campo3;
        break;
    }
  
      let novoJson = JSON.stringify(dadosApp, null, 2);

      fs.writeFile('./src/build/dados.json', novoJson, 'utf-8', (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Dados Atualizados');
      });
    } catch (err) {
      console.error('Erro ao processar o arquivo JSON:', err);
    }
  });
}

/**
 * Função que retorna array com informações puxadas o arquivo dados.JSON
 * @returns {dadosRetorno} uma array contendo as informação a serem alocadas nos campos "value" dos input HTML 
 */
function retornarDados() {
  return new Promise((resolve, reject) => {
    fs.readFile('./src/build/dados.json', 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        let dados = JSON.parse(data);
        var dadosRetorno = [
          dados.dadosApp.saurus.chave,
          dados.dadosApp.saurus.dominio,
          dados.dadosApp.geral.timer,
          dados.dadosApp.tray.consumer_key,
          dados.dadosApp.tray.consumer_secret,
          dados.dadosApp.tray.code
        ];
        resolve(dadosRetorno);
      }
    });
  });
}


function retornaCampo(campo){
  return new Promise((resolve, reject) => {
    fs.readFile('./src/build/dados.json', 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        let dados = JSON.parse(data);
        switch (campo) {
          case 'chave':
            var dadosRetorno = dados.dadosApp.saurus.chave;
            break;
          
          case 'dominio':
            var dadosRetorno = dados.dadosApp.saurus.dominio;
            break;
          
        }
        resolve(dadosRetorno);
      }
    });
  });
}



module.exports = { 
    salvarDados,
    retornarDados,
    retornaCampo
}