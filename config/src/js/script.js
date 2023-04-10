function alertar() {
    var valor = document.getElementById('enviar').value;
    window.api.send('enviar-valor', valor);
}