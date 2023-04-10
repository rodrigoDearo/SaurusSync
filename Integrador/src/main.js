// IMPORTAÇÃO DAS BIBLIOTECAS PARA CRIAÇÃO E COMPACTAÇÃO XML
const builder = require ('xmlbuilder'); 
const zlib = require ('zlib');
const axios = require('axios');


// VAR GERAIS DO PROGRAMA


// ATRIBUIÇÃO DOS VALORES A SEREM COMPACTADOS
var Dominio = 'testescontrollerplus';
var TpArquivo = 50;
var ChaveCaixa = "8FC34496-0E8F-4877-9DF7-8D58B0B94788";
var TpSync = 1;
var DhReferencia = setDate();
var Password = codificarInBase64(setSenha());
var xBytesParametros = codificarInBase64(criarEziparArquivoXml());
/*codificarInBase64(criarEziparArquivoXml())*/;
// AREA TESTE






// ---------------------- FUNÇÃO DA REQUISIÇÃO ---------------------- //
function reqStatus(){
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    //Content-Length: length
    'SOAPAction': 'http://saurus.net.br/retCadastros'
  }

  const body = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <retCadastros xmlns="http://saurus.net.br/">
        <xBytesParametros>${xBytesParametros}</xBytesParametros>
        <xSenha>${Password}}</xSenha>
      </retCadastros>
    </soap:Body>
  </soap:Envelope>`

  axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros.asmx', body, { headers })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      console.log('Termieni aq kk');
    })   
}




// ---------------------- FUNÇÃO PARA CRIAR E ZIPAR DADOS  ---------------------- //
function criarEziparArquivoXml(){
  let xmlIntegracao = builder.create('xmlIntegracao') // CRIAR XML INTEGRAÇÃO
  .ele('Dominio', Dominio) 
  .ele('TpArquivo', TpArquivo)
  .ele('ChaveCaixa', ChaveCaixa)
  .ele('TpSync', TpSync)
  .ele('DhReferencia', DhReferencia)
  .end({ pretty: true });

  let xmlString = xmlIntegracao.toString(); // TRANSFORMA XML EM STRING
  let compressedXml = zlib.gzipSync(xmlString); // COMPACTA XML
  return compressedXml;
}



// ---------------------- FUNÇÃO PARA CODIFICAR EM BASE 64 ---------------------- //
function codificarInBase64(valueString){
  let bytesXmlGzip = Buffer.from(valueString).toString('base64');
  return bytesXmlGzip;
}



// ---------------------- FUNÇÃO PARA DEFINIR SENHA ---------------------- //
function setSenha(){
    let dataAtual = new Date();

    let dia = dataAtual.getDate();
    let mes = dataAtual.getMonth() + 1;
    let ano = dataAtual.getFullYear();

    let senha = `ophd02ophd02|@${dia + mes + ano - 2000}|${Dominio}|1`;
    return senha;
}



// ---------------------- FUNÇÃO PARA PUXAR HORÁRIO ---------------------- //
function setDate(){
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:00'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  return data;
}



// EXECUTAR FUNÇÕES 
reqStatus();



// ---------------------- ELECTRON JS ---------------------- //

const { app, BrowserWindow, nativeImage, ipcMain } = require("electron");

require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/../node_modules/electron`),
});

// Função que cria uma janela desktop
function createWindow() {
  // Adicionando um ícone na barra de tarefas/dock
  const icon = nativeImage.createFromPath(`${app.getAppPath()}/build/icon.png`);

  if (app.dock) {
    app.dock.setIcon(icon);
  }


  // CRIA UMA JANELA DESKTOP
  const win = new BrowserWindow({
    icon,
    width: 650,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");
}


ipcMain.on('execute-function', () => {
  // Execute sua função aqui
  console.log('Executando função...')
})

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



