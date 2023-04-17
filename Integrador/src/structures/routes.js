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
    let chaveLet = chave;
    let dominioLet = dominio;
    console.log('Testee, chamando funcao');
    fetch(`http://localhost:3000/saveSaurus/${chaveLet}/${dominioLet}`)
    .then(response => response.text())
    .then(data =>{
        console.log('fetch concluido');
        console.log(data);
    })
    .catch(error =>{
        confirm.log(error);
    })
}
