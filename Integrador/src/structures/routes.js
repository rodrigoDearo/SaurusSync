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


function saveSaurus(chave, dominio){
    fetch(`http://localhost:3000/saveSaurus/${chave}/${dominio}`)
    .then(response => response.text())
    .then(data =>{
        console.log('fetch concluido');
        console.log(data);
    })
    .catch(error =>{
        confirm.log(error);
    })
}
