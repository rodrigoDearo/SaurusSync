const builder = require('xmlbuilder');

function criandoXML(){
    var xml = builder.create('config')
    .ele('saurus')
      .ele('dominio', '')
      .ele('chaveCaixa', '')
    .end({ pretty: true})
  
    .ele('geral')
      .ele('timer', '')
      .ele('caminho', '')
    .end({pretty: true});
   
    console.log(xml);
}

module.exports = { 
    criandoXML
  };