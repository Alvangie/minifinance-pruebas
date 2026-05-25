function agregarMovimiento() {
    let monto = document.getElementById("monto").value;
    let tipo = document.getElementById("tipo").value;

    let lista = document.getElementById("listaMovimientos");

    lista.innerHTML += `<p>${tipo} - $${monto}</p>`;
}
// ========================================================
// 🛠️ MÓDULO A: LÓGICA DE LA META DE AHORRO PREMIUM
// ========================================================
const OBJETIVO_VIAJE = 500000;

function calcularYRenderizarMeta() {
    // 1. Extraer los datos directamente de los elementos <p> que generan tus compañeras
    const movimientos = document.querySelectorAll('#listaMovimientos p');
    let ingresos = 0;
    let gastos = 0;

    movimientos.forEach(p => {
        const texto = p.textContent; // Formato: "Ingreso - $250000" o "Gasto - $15000"
        const desglosado = texto.split(' - $');
        const tipo = desglosado[0].trim().toLowerCase();
        const monto = parseFloat(desglosado[1]);

        if (!isNaN(monto)) {
            if (tipo === 'ingreso') ingresos += monto;
            if (tipo === 'gasto') gastos += monto;
        }
    });

    const ahorroReal = ingresos - gastos;
    let porcentaje = OBJETIVO_VIAJE > 0 ? Math.round((ahorroReal / OBJETIVO_VIAJE) * 100) : 0;
    porcentaje = Math.max(0, Math.min(porcentaje, 100)); // Clamping seguro entre 0 y 100

    // 2. Inyectar valores calculados en el DOM nativo
    document.getElementById('barra-progreso-nativa').value = porcentaje;
    document.getElementById('txt-meta-porcentaje').textContent = `${porcentaje}% completado`;
    document.getElementById('txt-meta-ahorrado').textContent = `$${Math.max(0, ahorroReal).toLocaleString('es-AR')}`;
    
    const faltante = OBJETIVO_VIAJE - ahorroReal;
    document.getElementById('txt-meta-restante').textContent = `$${Math.max(0, faltante).toLocaleString('es-AR')}`;

    // 3. DESAFÍO OBLIGATORIO: Alerta visual si no alcanza la meta o si la cumple
    const tarjeta = document.getElementById('tarjeta-meta-ahorro');
    if (tarjeta) {
        if (porcentaje >= 100) {
            tarjeta.style.borderColor = 'var(--color-exito)';
            tarjeta.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.3)';
        } else if (porcentaje < 35 && ahorroReal < gastos) {
            tarjeta.style.borderColor = 'var(--color-alerta)'; // Alerta por exceso de gastos
        } else {
            tarjeta.style.borderColor = 'var(--border-color)';
            tarjeta.style.boxShadow = 'none';
        }
    }
}

// Interceptar el envío del formulario de las chicas para actualizar tu tarjeta inmediatamente
document.addEventListener('DOMContentLoaded', () => {
    calcularYRenderizarMeta();
    const formOriginal = document.querySelector('form');
    if (formOriginal) {
        formOriginal.addEventListener('submit', () => {
            setTimeout(calcularYRenderizarMeta, 20);
        });
    }
});