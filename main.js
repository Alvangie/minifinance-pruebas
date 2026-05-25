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

// ========================================================
// 🛠️ MÓDULO B: SISTEMA DE TEMAS DINÁMICOS CON LOCALSTORAGE
// ========================================================
function inicializarSistemaTemas() {
    const switchTema = document.getElementById('input-switch-tema');
    if (!switchTema) return;

    // Recuperar preferencia guardada o aplicar oscuro por defecto (según diseño de las chicas)
    const temaGuardado = localStorage.getItem('minifinance-tema') || 'dark';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    switchTema.checked = temaGuardado === 'dark';
    actualizarIndicadorVisualTema(temaGuardado);

    switchTema.addEventListener('change', (e) => {
        const nuevoTema = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nuevoTema);
        localStorage.setItem('minifinance-tema', nuevoTema); // Guardado obligatorio en storage
        actualizarIndicadorVisualTema(nuevoTema);
    });
}

function actualizarIndicadorVisualTema(tema) {
    const icono = document.getElementById('icono-estado-tema');
    if (icono) {
        icono.textContent = tema === 'dark' ? '☀️' : '🌙';
    }
}

// Arrancar el tema inmediatamente al procesar el script para evitar parpadeos
inicializarSistemaTemas();

// ========================================================
// 🛠️ MÓDULO C: GRÁFICO DE GASTOS DINÁMICO (CONIC-GRADIENT)
// ========================================================
const MAPA_COLORES = {
    'Alimentación': '#ff4d6d',
    'Ocio': '#7209b7',
    'Transporte': '#f77f00',
    'Servicios': '#4361ee',
    'Otros': '#2ec4b6'
};

function calcularYRenderizarGrafico() {
    const movimientos = document.querySelectorAll('#listaMovimientos p');
    const leyenda = document.getElementById('leyenda-dinamica-gastos');
    const dona = document.querySelector('.wrapper-dona-grafica');
    
    if (!leyenda || !dona) return;

    let totalGastos = 0;
    const acumuladoCategorias = {};

    // 1. Recorrer movimientos del DOM y acumular únicamente los Gastos
    movimientos.forEach(p => {
        const texto = p.textContent;
        const desglosado = texto.split(' - $');
        const tipo = desglosado[0].trim().toLowerCase();
        const monto = parseFloat(desglosado[1]);

        if (!isNaN(monto) && tipo === 'gasto') {
            totalGastos += monto;

            // Clasificación automatizada basada en texto para acoplarse al prototipo
            let categoria = 'Otros';
            if (texto.toLowerCase().includes('super') || texto.toLowerCase().includes('comida')) categoria = 'Alimentación';
            if (texto.toLowerCase().includes('juego') || texto.toLowerCase().includes('ocio') || texto.toLowerCase().includes('video')) categoria = 'Ocio';
            if (texto.toLowerCase().includes('transporte') || texto.toLowerCase().includes('bondi') || texto.toLowerCase().includes('viaje')) categoria = 'Transporte';
            if (texto.toLowerCase().includes('luz') || texto.toLowerCase().includes('agua') || texto.toLowerCase().includes('servicios')) categoria = 'Servicios';

            acumuladoCategorias[categoria] = (acumuladoCategorias[categoria] || 0) + monto;
        }
    });

    document.getElementById('monto-total-grafico').textContent = `$${totalGastos.toLocaleString('es-AR')}`;
    leyenda.innerHTML = '';

    if (totalGastos === 0) {
        dona.style.background = 'conic-gradient(var(--border-color) 0% 100%)';
        leyenda.innerHTML = '<li class="text-muted">No hay gastos registrados.</li>';
        return;
    }

    // 2. Generar los ángulos de color del conic-gradient y rellenar la leyenda semántica
    let anguloAcumulado = 0;
    const segmentosDegradado = [];

    for (const [cat, monto] of Object.entries(acumuladoCategorias)) {
        const color = MAPA_COLORES[cat] || MAPA_COLORES['Otros'];
        const porcentaje = (monto / totalGastos) * 100;
        const siguienteAngulo = anguloAcumulado + porcentaje;

        segmentosDegradado.push(`${color} ${anguloAcumulado}% ${siguienteAngulo}%`);
        anguloAcumulado = siguienteAngulo;

        // Crear item de lista dinámico semántico sin usar divs
        const li = document.createElement('li');
        li.style.borderLeft = `4px solid ${color}`;
        li.style.paddingLeft = '10px';
        li.style.marginBottom = '6px';
        li.innerHTML = `<strong>${cat}</strong>: $${monto.toLocaleString('es-AR')} <small class="text-muted">(${Math.round(porcentaje)}%)</small>`;
        leyenda.appendChild(li);
    }

    // Aplicar el estilo al elemento del DOM
    dona.style.background = `conic-gradient(${segmentosDegradado.join(', ')})`;
}

// Enganchar actualización en tiempo real junto con el módulo A
document.addEventListener('DOMContentLoaded', () => {
    calcularYRenderizarGrafico();
    const formOriginal = document.querySelector('form');
    if (formOriginal) {
        formOriginal.addEventListener('submit', () => {
            setTimeout(calcularYRenderizarGrafico, 20);
        });
    }
});