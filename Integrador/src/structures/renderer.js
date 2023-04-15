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
