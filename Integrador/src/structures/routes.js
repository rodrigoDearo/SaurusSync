/**
 * 
 */
function sincronizacaoUnica() {
    let data = document.getElementById('datetime-input').value;
    fetch(`http://localhost:3000/sincronizacaoUnica/${data}`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
}


/**
 * 
 */
function sincronizacaoContinua(){
    let data = document.getElementById('datetime-input').value;
    fetch(`http://localhost:3000/sincronizacaoContinua/${data}`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
}


/**
 * Função que faz requisição para porta 3000 para fechamento ao app Electron.js
 */
function closeApp() {
    fetch('http://localhost:3000/closeApp')
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
}


/**
 * Função de requisição para porta 3000 para gravar dados do cadastro de informações do Saurus
 */
function saveSaurus(){
    let chave = document.getElementById('chaveCaixa-input').value;
    let dominio = document.getElementById('dominio-input').value;

    fetch(`http://localhost:3000/saveSaurus/${chave}/${dominio}`)
    .then(response => response.text())
    .then(data =>{
        console.log('Fetch concluido');
        console.log(data);
    })
    .catch(error =>{
        confirm.log(error);
    })
}


/**
 * Função de requisição para porta 3000 para gravar dados do cadastro de informações Gerais do app
 */
function saveGeral(){
    let timer = document.getElementById('timer-input').value;
    fetch(`http://localhost:3000/saveGeral/${timer}`)
    .then(response => response.text())
    .then(data =>{
        console.log('Fetch concluido');
        console.log(data);
    })
    .catch(error =>{
        confirm.log(error);
    })
}


/**
 * Função de requisição para porta 3000 para carregar valores dos campos "value" dos inputs HTML Saurus
 */
function carregarInfoSaurus(){
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        document.getElementById('chaveCaixa-input').value = dados[0];
        document.getElementById('dominio-input').value = dados[1];
    });
}


/**
 * Função de requisição para porta 3000 para carregar valores dos campos "value" dos inputs HTML geral
 */
function carregarInfoGeral(){
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        document.getElementById('timer-input').value = dados[2];
    });
}

/**
 * Função de requisição para porta 3000 para carregar valor do campo data como horario atual
 */
function carregarData(){
    let data = new Date();
    data.setHours(data.getHours() - 3);
    document.getElementById('datetime-input').value = data.toISOString().slice(0, 16);;
}




/**
 * Função para rodar funções no carregamento das paginas
 */
window.onload = function(){
    carregarInfoSaurus();
    carregarInfoGeral();
};

carregarData();