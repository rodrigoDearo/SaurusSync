const fs = require('fs');
const xml2js = require('xml2js');


function salvarDados(campo1, campo2, systemSave){
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
        dadosApp.dadosApp.geral.caminho = campo1;
        dadosApp.dadosApp.geral.timer = campo2;
        break;

      case tray:
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


  

module.exports = { 
    salvarDados
}