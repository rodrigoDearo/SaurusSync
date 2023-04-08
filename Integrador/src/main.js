// IMPORTAÇÃO DAS BIBLIOTECAS PARA CRIAÇÃO E COMPACTAÇÃO XML
const builder = require ('xmlbuilder'); 
const zlib = require ('zlib');
const axios = require('axios');


// VAR GERAIS DO PROGRAMA

var bytesXmlGzip;

// ATRIBUIÇÃO DOS VALORES A SEREM COMPACTADOS
var Dominio = "dev08";
var TpArquivo = "50";
var ChaveCaixa = "38e358ee-3553-4622-81f8-fd9c323f45b4";
var TpSync = "1";
var DhReferencia = setDate();

// AREA TESTE


function testarIsso(){
  if(typeof window === 'undefined'){
    console.log('Ao lado do Servidor');
  }
  else{
    console.log('Ao lado do Cliente');
  }
}

// ---------------------- FUNÇÃO DA REQUISIÇÃO ---------------------- //

function reqStatus(){
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    //Content-Length: length
    'SOAPAction': 'http://saurus.net.br/retStatusServico' // "http://saurus.net.br/retCadastros"
  }
  
  /*
  ADD CONST BODY{

    <retCadastros xmlns="http://saurus.net.br/">
        <xBytesParametros>base64Binary</xBytesParametros>
        <xSenha>string</xSenha>
      </retCadastros>
  }
  */ 
  const body = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <retStatusServico xmlns="http://saurus.net.br/" />
    </soap:Body>
  </soap:Envelope>`

  axios.post('https://wscadastros.saurus.net.br/v001/serviceCadastros.asmx', body, { headers })
    .then(response => {
      console.log(response.data)
    })
    .catch(error => {
      console.log(error)
    })
}

// ---------------------- FIM DA FUNÇÃO DA REQUISIÇÃO ---------------------- //



// ---------------------- FUNÇÃO PARA CRIAR E ZIPAR DADOS  ---------------------- //

function criarEziparArquivoXml(){
  const xmlIntegracao = builder.create('xmlIntegracao') // CRIAR XML INTEGRAÇÃO
  .ele('Dominio', Dominio) 
  .ele('TpArquivo', TpArquivo)
  .ele('ChaveCaixa', ChaveCaixa)
  .ele('TpSync', TpSync)
  .ele('DhReferencia', DhReferencia)
  .end({ pretty: true });

  const xmlString = xmlIntegracao.toString(); // TRANSFORMA XML EM STRING
  const compressedXml = zlib.gzipSync(xmlString); // COMPACTA XML
  bytesXmlGzip = new Uint8Array(compressedXml); //TRANSFORMA ARQUIVO COMPACTADO EM BYTES
  console.log(bytesXmlGzip);
}

// ---------------------- FIM DA FUNÇÃO PARA CRIAR E ZIPAR DADOS  ---------------------- //



// ---------------------- FUNÇÃO PARA PUXAR HORÁRIO ---------------------- //

function setDate(){
  let data = new Date();  // FUNÇÃO PADRÃO NDOE PARA PUXAR DATA;
  let dataISO8601 = data.toISOString(); // TRANSFORMA NO PADRÃO DE DATA ISO8601
  data = dataISO8601.slice(0, -5);  //RETIRA OS 5DÍTIGOT SINAIS PARA DEIXAR NO PADRÃO SOLICITADO
  data += '-03:00'; //ADICIONA FUSO HORÁRIO DE BRASILIA
  return data;
}

// ---------------------- FIM DA FUNÇÃO PARA PUXAR HORÁRIO ---------------------- //




// EXECUTAR FUNÇÕES 
criarEziparArquivoXml();
reqStatus();
setDate();
testarIsso();

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



