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
    let caminho = document.getElementById('caminho-input').value;

    fetch(`http://localhost:3000/saveGeral/${caminho}/${timer}`)
    .then(response => response.text())
    .then(data =>{
        console.log('Fetch concluido');
        console.log(data);
    })
    .catch(error =>{
        confirm.log(error);
    })
}

function carregarInfo(){
    console.log('Inicio carregar Info');
    fetch('http://localhost:3000/carregarInfo')
    .then(response => response.json())
    .then(dados =>{
        console.log(dados[0]);
        /*document.getElementById('chaveCaixa-input').value = dados[0];
        document.getElementById('dominio-input').value = dados[1];
        document.getElementById('caminho-input').value = dados[2];
        document.getElementById('timer-input').value = dados[3];*/
    });
    console.log('Fim carregar info')
}

window.onload = carregarInfo;
