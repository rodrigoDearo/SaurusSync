// IMPORTANDO MÓDULOS E BIBLIOTECAS 
const builder = require ('xmlbuilder'); 
const zlib = require ('zlib');
const { reqCadastros, setSenha } = require('./structures/reqCadastros')
const express = require('express');



// AREA TESTE


// ADICAO DE COMENT


// EXECUTAR FUNÇÕES 



// ---------------------- EXPRESS JS ---------------------- //



const expss = express();

expss.get('/reqCadastro', (req, res) => {
    console.log('Função executada no servidor!');
    reqCadastros()
});

expss.listen(3000, () => {
    console.log('Servidor Express iniciado na porta 3000');
});



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




