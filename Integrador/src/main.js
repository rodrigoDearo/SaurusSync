// IMPORTANDO MÓDULOS E BIBLIOTECAS 
const express = require('express');
const { salvarDados, retornarDados } = require('./structures/manipulacaoJSON');
const { sincronizacaoUnica, sincronizacaoContinua } = require('./structures/reqCadastros');
const { createToken, refreshToken } = require('./structures/configTray');

// AREA TESTE


// ADICAO DE COMENT


// EXECUTAR FUNÇÕES 



// ---------------------- EXPRESS JS ---------------------- //

const expss = express();

expss.get('/sincronizacaoUnica/:data', (req, res) => {
    sincronizacaoUnica(req.params.data);
    console.log('Sincronização Única Realizada');
});

expss.get('/sincronizacaoContinua/:data', (req, res) =>{
  sincronizacaoContinua(req.params.data);
  console.log('Sincronização Contínua Executada');
});

expss.get('/closeApp', (req, res) => {
    console.log('Função de fechamento do APP executada !');
    app.quit();
});

expss.get(`/saveSaurus/:chave/:dominio`, (req, res) => {
  salvarDados(req.params.chave, req.params.dominio, null, 'saurus');
});

expss.get(`/saveTray/:consumer_key/:consumer_secret/:code`, (req, res) => {
  salvarDados(req.params.consumer_key, req.params.consumer_secret, req.params.code, 'tray');
});

expss.get(`/saveGeral/:timer`, (req, res) =>{
  salvarDados(req.params.timer, null, null, 'geral');
});

expss.get(`/carregarInfo`, (req, res) =>{
  retornarDados()
  .then((dadosRetorno) => {
    res.json(dadosRetorno);
  })
  .catch((err) => {
    console.error('Erro ao retornar dados:', err);
  });
})

expss.listen(3000, () => {
    console.log('Servidor Express iniciado na porta 3000');
});



// ---------------------- ELECTRON JS ---------------------- //

const { app, BrowserWindow, nativeImage } = require("electron");

require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/../node_modules/electron`),
});

// Função que cria uma janela desktop
function createWindow() {
  // Adicionando um ícone na barra de tarefas/dock
  const icon = nativeImage.createFromPath(`${app.getAppPath()}/build/icon.jpg`);

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
