/**
 * 
 */
function sincronizacaoUnica() {
    let dataInput = document.getElementById('datetime-input').value;
    let dataAtual = new Date();
    dataAtual.setMinutes(dataAtual.getMinutes() + 9);
    let dataISO8601 = dataAtual.toISOString();

    if(dataInput < dataISO8601){
        alert('Favor, insira um horário com 10 minutos ou mais de antecedência ao horário atual');
    }
    else{
        fetch(`http://localhost:3000/sincronizacaoUnica/${dataInput}`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
    }
}


/**
 * 
 */
function sincronizacaoContinua(){
    let sincronizar;

    let dataInput = document.getElementById('datetime-input').value;
    let dataAtual = new Date();
    dataAtual.setMinutes(dataAtual.getMinutes() + 9);
    let dataISO8601 = dataAtual.toISOString();

    if(dataInput < dataISO8601){
        sincronizar = confirm('Caso tenha inserido/modificado/deletado algum produto nos últimos 10 minutos, essa modificação não será carregada. Deseja prosseguir ou voltar e inserir um horário inicial maior?');
    }
    else{
        sincronizar = false;
        console.log('Cancelado pedido de sincronização');
    }

    if(sincronizar==true){
        document.getElementById("botaoSincCont").disabled = true;
        document.getElementById("botaoSincUn").disabled = true;
        fetch(`http://localhost:3000/sincronizacaoContinua/${dataInput}`)
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
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
 * Função de requisição para porta 3000 para gravar dados do cadastro de informações Gerais do app
 */
function saveGeral(){
    let timerInput = document.getElementById('timer-input').value;
    let time = timerInput.split(":");
    let segundos = (+time[0]) * 60 + (+time[1]);

    if(segundos < 600){
        alert('Favor, insira um timer de requisição superior a 10 minutos;')
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