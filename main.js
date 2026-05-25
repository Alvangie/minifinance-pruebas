// ========================================================
// 📊 ESTADO GLOBAL CENTRALIZADO (PERSISTENCIA CON STORAGE)
// ========================================================
let appState = {
    movimientos: JSON.parse(localStorage.getItem('minifinance_movimientos')) || [],
    montoMeta: parseFloat(localStorage.getItem('minifinance_monto_meta')) || 0
};

const MAPA_COLORES = {
    'Alimentación': '#ff4d6d',
    'Ocio': '#7209b7',
    'Transporte': '#f77f00',
    'Servicios': '#4361ee',
    'Otros': '#2ec4b6'
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarSistemaTemas();
    configurarValidacionInputs();
    
    // Escuchar el formulario de movimientos
    const formMovimiento = document.getElementById('form-movimiento');
    if (formMovimiento) {
        formMovimiento.addEventListener('submit', (e) => {
            e.preventDefault();
            agregarMovimiento();
        });
    }

    // Escuchar tu nuevo formulario para fijar la meta
    const formMeta = document.getElementById('form-configurar-meta');
    if (formMeta) {
        formMeta.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputMeta = document.getElementById('input-monto-meta');
            const valor = parseFloat(inputMeta.value);

            if (!isNaN(valor) && valor > 0) {
                appState.montoMeta = valor;
                localStorage.setItem('minifinance_monto_meta', valor);
                actualizarTodaLaInterfaz();
                inputMeta.value = '';
            }
        });
    }

    // Primera renderización con los datos que hayan quedado guardados
    actualizarTodaLaInterfaz();
});

// ─── VALIDACIÓN DE ENTRADAS (DOM FEEDBACK) ──────────────────────────────
function configurarValidacionInputs() {
    const inputsNumericos = document.querySelectorAll('input[inputmode="numeric"]');
    inputsNumericos.forEach(input => {
        // Bloquear letras, signos de exponente y números negativos en tiempo real
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
}

// ─── CONTROLADOR DE MOVIMIENTOS CON CATEGORÍA REAL ──────────────────────
function agregarMovimiento() {
    const inputMonto = document.getElementById("monto");
    const selectTipo = document.getElementById("tipo");
    const selectCategoria = document.getElementById("categoria");
    
    const monto = parseFloat(inputMonto.value);
    const tipo = selectTipo.value;
    // Si es ingreso, no lleva categoría de gasto, por estándar le ponemos 'Ingreso'
    const categoria = tipo === "Gasto" ? selectCategoria.value : "Otros";

    if (isNaN(monto) || monto <= 0) return;

    // Guardamos la propiedad de forma explícita en el objeto
    appState.movimientos.push({ tipo, monto, categoria });
    localStorage.setItem('minifinance_movimientos', JSON.stringify(appState.movimientos));

    inputMonto.value = "";
    actualizarTodaLaInterfaz();
}

// ─── REFACTORIZACIÓN DEL ORQUESTADOR PARA LEER LA CATEGORÍA REAL ────────
function actualizarTodaLaInterfaz() {
    let ingresos = 0;
    let gastos = 0;
    const acumuladoCategorias = {};
    const listaUI = document.getElementById("listaMovimientos");
    
    if (listaUI) listaUI.innerHTML = "";

    appState.movimientos.forEach(m => {
        if (m.tipo === "Ingreso") {
            ingresos += m.monto;
        } else {
            gastos += m.monto;
            
            // Leemos directamente la categoría real guardada por el usuario
            const catReal = m.categoria || "Otros";
            acumuladoCategorias[catReal] = (acumuladoCategorias[catReal] || 0) + m.monto;
        }

        if (listaUI) {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid var(--border-color)';
            // Si es gasto, mostramos su categoría en la lista para mayor jerarquía visual
            const detalleText = m.tipo === "Gasto" ? `${m.tipo} (${m.categoria})` : m.tipo;
            li.innerHTML = `<strong>${detalleText}</strong> — $${m.monto.toLocaleString('es-AR')}`;
            listaUI.appendChild(li);
        }
    });

    if(document.getElementById('resumen-ingresos')) {
        document.getElementById('resumen-ingresos').textContent = `$${ingresos.toLocaleString('es-AR')}`;
        document.getElementById('resumen-gastos').textContent = `$${gastos.toLocaleString('es-AR')}`;
        document.getElementById('resumen-saldo').textContent = `$${(ingresos - gastos).toLocaleString('es-AR')}`;
    }

    renderizarModuloMeta(ingresos, gastos);
    renderizarModuloGrafico(gastos, acumuladoCategorias);
}

// ─── ORQUESTADOR DE RENDERIZADO VISUAL ──────────────────────────────────
function actualizarTodaLaInterfaz() {
    let ingresos = 0;
    let gastos = 0;
    const acumuladoCategorias = {};
    const listaUI = document.getElementById("listaMovimientos");
    
    if (listaUI) listaUI.innerHTML = "";

    appState.movimientos.forEach(m => {
        if (m.tipo === "Ingreso") {
            ingresos += m.monto;
        } else {
            gastos += m.monto;
            
            // Simulación semántica de categorías basada en reglas de negocio dinámicas
            let categoria = 'Otros';
            if (m.monto >= 50000) categoria = 'Servicios';
            else if (m.monto >= 15000) categoria = 'Alimentación';
            else if (m.monto >= 5000) categoria = 'Ocio';
            else if (m.monto > 0) categoria = 'Transporte';

            acumuladoCategorias[categoria] = (acumuladoCategorias[categoria] || 0) + m.monto;
        }

        // Renderizar en la lista usando elementos semánticos nativos (li) sin divs
        if (listaUI) {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid var(--border-color)';
            li.innerHTML = `<strong>${m.tipo}</strong> — $${m.monto.toLocaleString('es-AR')}`;
            listaUI.appendChild(li);
        }
    });

    // Actualizar el bloque de Resumen Financiero
    if(document.getElementById('resumen-ingresos')) {
        document.getElementById('resumen-ingresos').textContent = `$${ingresos.toLocaleString('es-AR')}`;
        document.getElementById('resumen-gastos').textContent = `$${gastos.toLocaleString('es-AR')}`;
        document.getElementById('resumen-saldo').textContent = `$${(ingresos - gastos).toLocaleString('es-AR')}`;
    }

    // Disparar tus componentes específicos
    renderizarModuloMeta(ingresos, gastos);
    renderizarModuloGrafico(gastos, acumuladoCategorias);
}

// ─── MÓDULO A: META DE AHORRO DINÁMICA ──────────────────────────────────
function renderizarModuloMeta(ingresos, gastos) {
    const ahorroReal = ingresos - gastos;
    const objetivo = appState.montoMeta;

    let porcentaje = objetivo > 0 ? Math.round((ahorroReal / objetivo) * 100) : 0;
    porcentaje = Math.max(0, Math.min(porcentaje, 100));

    document.getElementById('txt-meta-monto').textContent = `$${objetivo.toLocaleString('es-AR')}`;
    document.getElementById('barra-progreso-nativa').value = porcentaje;
    document.getElementById('txt-meta-porcentaje').textContent = `${porcentaje}% completado`;
    document.getElementById('txt-meta-ahorrado').textContent = `$${Math.max(0, ahorroReal).toLocaleString('es-AR')}`;
    
    const faltante = objetivo - ahorroReal;
    document.getElementById('txt-meta-restante').textContent = `$${Math.max(0, faltante).toLocaleString('es-AR')}`;

    // DESAFÍO OBLIGATORIO: Alertas por comportamiento financiero en el DOM
    const tarjeta = document.getElementById('tarjeta-meta-ahorro');
    if (tarjeta && objetivo > 0) {
        if (porcentaje >= 100) {
            tarjeta.style.borderColor = 'var(--color-exito)';
            tarjeta.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.3)';
        } else if (porcentaje < 35 && ahorroReal < gastos) {
            tarjeta.style.borderColor = 'var(--color-alerta)';
        } else {
            tarjeta.style.borderColor = 'var(--border-color)';
            tarjeta.style.boxShadow = 'none';
        }
    }
}

// ─── MÓDULO B: SISTEMA DE TEMAS ─────────────────────────────────────────
function inicializarSistemaTemas() {
    const switchTema = document.getElementById('input-switch-tema');
    if (!switchTema) return;

    const temaGuardado = localStorage.getItem('minifinance-tema') || 'dark';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    switchTema.checked = temaGuardado === 'dark';

    switchTema.addEventListener('change', (e) => {
        const nuevoTema = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nuevoTema);
        localStorage.setItem('minifinance-tema', nuevoTema);
    });
}

// ─── MÓDULO C: GRÁFICO CÓNICO PREMIUM ───────────────────────────────────
function renderizarModuloGrafico(totalGastos, categorias) {
    const dona = document.querySelector('.wrapper-dona-grafica');
    const leyenda = document.getElementById('leyenda-dinamica-gastos');
    if (!dona || !leyenda) return;

    document.getElementById('monto-total-grafico').textContent = `$${totalGastos.toLocaleString('es-AR')}`;
    leyenda.innerHTML = '';

    if (totalGastos === 0) {
        dona.style.background = 'conic-gradient(var(--border-color) 0% 100%)';
        leyenda.innerHTML = '<li class="text-muted">No hay gastos registrados.</li>';
        return;
    }

    let anguloAcumulado = 0;
    const segmentos = [];

    for (const [cat, monto] of Object.entries(categorias)) {
        const color = MAPA_COLORES[cat] || MAPA_COLORES['Otros'];
        const porcentaje = (monto / totalGastos) * 100;
        const siguienteAngulo = anguloAcumulado + porcentaje;

        segmentos.push(`${color} ${anguloAcumulado}% ${siguienteAngulo}%`);
        anguloAcumulado = siguienteAngulo;

        const li = document.createElement('li');
        li.style.borderLeft = `4px solid ${color}`;
        li.style.paddingLeft = '10px';
        li.style.marginBottom = '6px';
        li.innerHTML = `<strong>${cat}</strong>: $${monto.toLocaleString('es-AR')} <small class="text-muted">(${Math.round(porcentaje)}%)</small>`;
        leyenda.appendChild(li);
    }

    dona.style.background = `conic-gradient(${segmentos.join(', ')})`;
}