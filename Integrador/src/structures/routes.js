const createCustomAlert = (message, status) => {
    // Cria um elemento de alerta personalizado
    const alertElement = document.createElement('div');
    alertElement.classList.add('custom-alert');
    alertElement.textContent = message;
  
    // Define a posição absoluta do alerta
    if(status == 'success'){
        alertElement.style.backgroundColor = '#d4edda';
        alertElement.style.color = '#155724';
        alertElement.style.border = '1px solid #c3e6cb';  
    }  
    else if(status == 'warning'){
        alertElement.style.backgroundColor = '#fff3cd';
        alertElement.style.color = '#856404';
        alertElement.style.border = '1px solid #ffeeba';  
    }
    else if(status == 'danger'){
        alertElement.style.backgroundColor = '#f8d7da';
        alertElement.style.color = '#721c24';
        alertElement.style.border = '1px solid #f5c6cb';  
    }

    // Adiciona o alerta ao corpo da página
    document.body.appendChild(alertElement);
  
    // Define um tempo para remover o alerta após alguns segundos
    setTimeout(() => {
      alertElement.remove();
    }, 7000); // Remove o alerta após 5 segundos (ajuste conforme necessário)
};


function sincronizacaoUnica() {
    let datetimeInput = document.getElementById('datetime-input').value;
    let datetimeValue = new Date(datetimeInput);
    let dateTimeNow = new Date();

    if(dateTimeNow.getTime() - datetimeValue.getTime() >= 60 * 60 * 1000){
        const elements = document.getElementsByClassName('sync');
        document.getElementById('gif-loading').src = "../build/loading.gif";
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = true;
        }
        fetch(`http://localhost:3000/sincronizacaoUnica/${datetimeInput}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('gif-loading').src = "";
            if(data=='Verifique as informações cadastradas, se estão preenchidas corretamente. Caso esteja tudo de acordo entre em contato com desenvolvimento para averiguar'){
                createCustomAlert(data, 'danger');
            }
            else{
                createCustomAlert(data, 'success');
            }
        })
        .then(() => {
            for (let i = 0; i < elements.length; i++) {
                elements[i].disabled = false;
            }
        })
        .catch(error => {
            createCustomAlert(error.text(), 'danger');
        });
    }
    else{
        createCustomAlert('Favor, insira um horário com 1 hora ou mais de antecedência ao horário atual', 'warning');
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

    if(dateTimeNow.getTime() - datetimeValue.getTime() >= 60 * 60 * 1000){
        sincronizar = true;
    }
    else{
        sincronizar = confirm('Caso tenha inserido/modificado/deletado algum produto na ultima hora, essa modificação não será carregada. Deseja prosseguir?')
    }

    if(sincronizar==true){
        const elements = document.getElementsByClassName('sync');
        document.getElementById('gif-loading').src = "../build/loading.gif";
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = true;
        }
        fetch(`http://localhost:3000/sincronizacaoContinua/${datetimeInput}`)
            .then(response => response.text())
            .then(data => {
                createCustomAlert(data, 'danger');
                document.getElementById('gif-loading').src = "";
                for (let i = 0; i < elements.length; i++) {
                    elements[i].disabled = false;
                }
            })
            .catch(error => {
                console.error(error);
            });
    }
    else{
        console.log('Cancelado pedido de sincronização');
    }
}


function atualizarEstoque(){
    const elements = document.getElementsByClassName('sync');
    document.getElementById('gif-loading').src = "../build/loading.gif";
    for (let i = 0; i < elements.length; i++) {
        elements[i].disabled = true;
    }
    fetch(`http://localhost:3000/atualizarEstoque`)
    .then(response => response.text())
    .then(data => {
        document.getElementById('gif-loading').src = "";
        createCustomAlert(data, 'success');
    })
    .then(() => {
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = false;
        }
    })
    .catch(error => {
        console.error(error);
    });
}

/**
 * Função que faz requisição para porta 3000 para fechamento ao app Electron.js
 */
function closeApp(){
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
 * Função que faz requisição para porta 3000 para fechamento do app Electron.js
 */
function minimizeApp(){
    fetch('http://localhost:3000/minimizeApp')
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
    url = encodeURIComponent(url);
    fetch(`http://localhost:3000/saveTray/${code}/${url}`)
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

    if(segundos < 3600){
        alert('Favor, insira um timer de requisição superior a 1 hora;')
    }
    else{
        
        fetch(`http://localhost:3000/saveGeral/${timerInput}`)
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

