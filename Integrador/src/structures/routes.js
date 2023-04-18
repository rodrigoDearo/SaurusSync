function chamarFuncaoNoServidor() {
    fetch('http://localhost:3000/reqCadastro')
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
}


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

function carregarInfoSaurus(){
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        document.getElementById('chaveCaixa-input').value = dados[0];
        document.getElementById('dominio-input').value = dados[1];
    });
}

function carregarInfoGeral(){
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        document.getElementById('timer-input').value = dados[2];
    });
}

window.onload = function(){
    carregarInfoSaurus();
    carregarInfoGeral();
};
/*document.getElementById('caminho-input').value = dados[0];
        document.getElementById('timer-input').value = dados[1];*/