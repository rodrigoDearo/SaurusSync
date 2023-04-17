const fs = require('fs');
const xml2js = require('xml2js');


function salvarDadosSaurus(chave, dominio){
        
    fs.readFile('./src/build/dados.xml', 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
      
        xml2js.parseString(data, (err, result) => {
            if (err) {
              console.error(err);
              return;
            }
            result.dadosApp.saurus.chave = chave;
            result.dadosApp.saurus.dominio = dominio;
            const builder = new xml2js.Builder();
            const novoXml = builder.buildObject(result);
        
            fs.writeFile('./src/build/dados.xml', novoXml, 'utf-8', (err) => {
              if (err) {
                console.error(err);
                return;
              }
        
              console.log('Arquivo XML modificado com sucesso!');
            });
          });
      });
}


  

module.exports = { 
    salvarDadosSaurus
}