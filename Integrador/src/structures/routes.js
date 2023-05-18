/**
 * 
 */
function sincronizacaoUnica() {
    let datetimeInput = document.getElementById('datetime-input').value;
    let datetimeValue = new Date(datetimeInput);
    let dateTimeNow = new Date();

    if(dateTimeNow.getTime() - datetimeValue.getTime() >= 30 * 60 * 1000){
        fetch(`http://localhost:3000/sincronizacaoUnica/${datetimeInput}`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
    }
    else{
        alert('Favor, insira um horário com 30 minutos ou mais de antecedência ao horário atual');
    }
}


/**
 * 
 */
function sincronizacaoContinua(){
    let sincronizar;

    let datetimeInput = document.getElementById('datetime-input').value;
    let datetimeValue = new Date(datetimeInput);
    let dateTimeNow = new Date();

    if(dateTimeNow.getTime() - datetimeValue.getTime() >= 30 * 60 * 1000){
        console.log('Tempo superior a 15 minutos');
        sincronizar = true;
    }
    else{
        sincronizar = confirm('Caso tenha inserido/modificado/deletado algum produto nos últimos 30 minutos, essa modificação não será carregada. Deseja prosseguir ou voltar e inserir um horário inicial maior?');
    }

    if(sincronizar==true){
        document.getElementById("botaoSincCont").disabled = true;
        document.getElementById("botaoSincUn").disabled = true;
        fetch(`http://localhost:3000/sincronizacaoContinua/${datetimeInput}`)
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
    else{
        console.log('Cancelado pedido de sincronização');
    }
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
    .then(() => {
        alert('DADOS ATUALIZADOS COM SUCESSO');
    })
    .catch(error =>{
        confirm.log(error);
    })
}


/**
 * Função de requisição para porta 3000 para gravar dados do cadastro de informações da Tray
 */
function saveTray(){
    let code = document.getElementById('code-input').value;
    let url = document.getElementById('url-input').value;

    fetch(`http://localhost:3000/saveTray/${code}/${url}`)
    .then(response => response.text())
    .then(data =>{
        console.log('Fetch concluido');
        console.log(data);
    })
    .then(() => {
        alert('DADOS ATUALIZADOS COM SUCESSO');
    })
    .catch(error =>{
        confirm.log(error);
    })
}


/**
 * Função de requisição para porta 3000 para gravar dados do cadastro de informações Gerais do app
 */
function saveGeral(){
    let timerInput = document.getElementById('timer-input').value;
    let time = timerInput.split(":");
    let segundos = (+time[0]) * 60 + (+time[1]);

    if(segundos < 1800){
        alert('Favor, insira um timer de requisição superior a 30 minutos;')
    }
    else{
        
        fetch(`http://localhost:3000/saveGeral/${timerInput}`)
        .then(response => response.text())
        .then(data =>{
            console.log('Fetch concluido');
            console.log(data);
        })
        .then(() =>{
            alert('TIMER ATUALIZADO COM SUCESSO!')
        })
        .catch(error =>{
            confirm.log(error);
        })
    }
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
 * Função de requisição para porta 3000 para carregar valores dos campos "value" dos inputs HTML Tray
 */
function carregarInfoTray(){
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        document.getElementById('code-input').value = dados[3];
        document.getElementById('url-input').value = dados[4];
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
    carregarInfoTray();
};

carregarData();