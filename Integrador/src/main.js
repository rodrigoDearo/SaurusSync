// IMPORTANDO MÓDULOS E BIBLIOTECAS 
const express = require('express');
const { salvarDados, retornarDados } = require('./structures/manipulacaoJSON');
const { sincronizacaoUnica, sincronizacaoContinua, atualizarEstoque } = require('./structures/reqCadastros');




// ---------------------- EXPRESS JS ---------------------- //

const expss = express();

expss.get('/sincronizacaoUnica/:data', async (req, res) => {
  console.log('Sincronização Única Realizada');

  await sincronizacaoUnica(req.params.data)
  .then(async (response) => {
    res.status(200).send(response);
    //! VERIFICAR POSSIBILIDADE DE CADASTRAR OS PRODUTOS DELETADOS DA BASE DO INTEGRADOR SEM TER QUE RODAR NOVAMENTE A SINCRONIZAÇÃO
    await sincronizacaoUnica(req.params.data)
    .then((response) => {
      res.status(200).send(response);
    })
  })
  .catch((error) => {
    res.status(500).send(error);
  });
});

expss.get('/atualizarEstoque', async (req, res) => {
  console.log('Atualização de Estoque Realizada');
  await atualizarEstoque()
  .then((response) => {
    res.status(200).send(response);
  })
  .catch((error) => {
    res.status(500).send(error);
  });
})

expss.get('/closeApp', (req, res) => {
    console.log('Função de fechamento do APP executada !');
    app.quit();
});

expss.get('/minimizeApp', (req, res) => {
  if (win) {
    win.minimize();
  }
  res.status(200).send('Aplicativo minimizado');
})

expss.get(`/saveSaurus/:chave/:dominio`, (req, res) => {
  salvarDados(req.params.chave, req.params.dominio, null, 'saurus')
  .then((response) => {
    res.status(200).send(response);
  })
  .catch((error) => {
    res.status(500).send('Erro na Atualizar Dados');
  })
});

expss.get(`/saveTray/:code/:url`, (req, res) => {
  salvarDados(req.params.code, req.params.url, null, 'tray')
  .then((response) => {
    res.status(200).send(response);
  })
  .catch((error) => {
    res.status(500).send('Erro na Atualizar Dados');
  })
});

expss.get(`/saveGeral/:timer`, (req, res) =>{
  salvarDados(req.params.timer, null, null, 'geral')
  .then((response) => {
    res.status(200).send(response);
  })
  .catch((error) => {
    res.status(500).send('Erro na Atualizar Dados');
  })
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

const {  app, BrowserWindow, nativeImage, Tray, Menu } = require("electron");
const path = require("path");
const electronReload = require('electron-reload');


/*electronReload(__dirname);*/

let win = null; // Variável global para armazenar a instância da janela
let tray = null; // Variável global para armazenar a instância do ícone na bandeja

// Função que cria uma janela desktop
function createWindow() {
  // Adicionando um ícone na barra de tarefas/dock
  const icon = nativeImage.createFromPath(`${app.getAppPath()}/build/icon.jpg`);

  if (app.dock) {
    app.dock.setIcon(icon);
  }


  // CRIA UMA JANELA DESKTOP
  win = new BrowserWindow({
    icon,
    width: 650,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("./index.html");

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir', click: () => win.show() },
    { label: 'Fechar', click: () => app.quit() }
  ]);
  tray.setToolTip('SaurusSync');
  tray.setContextMenu(contextMenu);

  // Evento para minimizar a janela quando ela for fechada
  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  });
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

expss.get('/sincronizacaoContinua/:data', (req, res) =>{
  sincronizacaoContinua(req.params.data)
  .then((response) => {
    if (win) {
      win.setSkipTaskbar(true);
      win.minimize(); // Minimiza a janela
    }
    console.log('Sincronização Contínua Executada');
  })
  .catch((error) => {
    res.status(500).send(error);
  });
});
