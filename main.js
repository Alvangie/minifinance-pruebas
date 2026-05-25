function agregarMovimiento() {
    let monto = document.getElementById("monto").value;
    let tipo = document.getElementById("tipo").value;

    let lista = document.getElementById("listaMovimientos");

    lista.innerHTML += `<p>${tipo} - $${monto}</p>`;
}
