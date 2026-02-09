// --- VARIABLES GLOBALES DEL CRONÓMETRO ---
let totalSegundos = 0;
let intervalo = null;
let estaCorriendo = false;
let horaInicioReal = ""; // Guardará la hora exacta en que diste click a "Iniciar"
let horaFinReal = "";    // Guardará la hora exacta en que calculaste

// Establecer fecha actual por defecto al cargar la página
document.getElementById('fecha').valueAsDate = new Date();

// Cargar historial al iniciar
cargarHistorial();

// --- LÓGICA DEL CRONÓMETRO ---
function cronometro() {
    totalSegundos++; // Aquí está la clave: contamos segundos totales

    // Cálculos matemáticos para mostrar H:M:S en pantalla
    let horas = Math.floor(totalSegundos / 3600);
    let minutos = Math.floor((totalSegundos % 3600) / 60);
    let segundos = totalSegundos % 60;

    // Formateo con ceros (01:05:09)
    let h = horas < 10 ? "0" + horas : horas;
    let m = minutos < 10 ? "0" + minutos : minutos;
    let s = segundos < 10 ? "0" + segundos : segundos;

    document.getElementById("tiempo").innerHTML = `${h}:${m}:${s}`;
}

function iniciar() {
    if (!estaCorriendo) {
        // Si es la primera vez que inicia (está en 0), guardamos la hora de inicio para el ticket
        if (totalSegundos === 0) {
            let ahora = new Date();
            horaInicioReal = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        intervalo = setInterval(cronometro, 1000);
        estaCorriendo = true;
    }
}

function pausar() {
    if (estaCorriendo) {
        clearInterval(intervalo);
        estaCorriendo = false;
    }
}

function reiniciar() {
    clearInterval(intervalo);
    estaCorriendo = false;
    totalSegundos = 0;
    horaInicioReal = ""; // Reseteamos la hora de inicio
    document.getElementById("tiempo").innerHTML = "00:00:00";
    
    // Opcional: Ocultar resultados si reinicias
    document.getElementById('resultado').classList.remove('show');
}

// --- LÓGICA DE LA CALCULADORA ---
function calcular() {
    // Primero pausamos el cronómetro para que no siga corriendo mientras calculas
    pausar();

    // Guardamos la hora de fin actual
    let ahora = new Date();
    horaFinReal = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cliente = document.getElementById('cliente').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha = document.getElementById('fecha').value;
    const tarifa = parseFloat(document.getElementById('tarifa').value);

    // Validaciones
    if (!cliente || !descripcion || !fecha || !tarifa) {
        alert('Por favor, completa los datos del cliente, descripción y tarifa.');
        return;
    }

    if (totalSegundos === 0) {
        alert('El cronómetro está en cero. Debes iniciar el trabajo primero.');
        return;
    }

    // CALCULO MATEMÁTICO PRINCIPAL
    // Convertimos los segundos acumulados a horas con decimales (ej: 1h 30m = 1.5 horas)
    const horasTrabajadas = totalSegundos / 3600; 
    const montoTotal = horasTrabajadas * tarifa;

    // Formatear fecha para mostrar
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Mostrar resultados en el HTML
    document.getElementById('resultCliente').textContent = cliente;
    document.getElementById('resultDescripcion').textContent = descripcion;
    document.getElementById('resultFecha').textContent = fechaFormateada;
    
    // Mostramos el horario real capturado automáticamente
    document.getElementById('resultHorario').textContent = `${horaInicioReal} - ${horaFinReal}`;
    
    document.getElementById('resultHoras').textContent = `${horasTrabajadas.toFixed(2)} horas`;
    document.getElementById('resultTarifa').textContent = `$${tarifa.toFixed(2)}`;
    document.getElementById('resultTotal').textContent = `$${montoTotal.toFixed(2)}`;

    // Mostrar panel visual con animación
    const resultDiv = document.getElementById('resultado');
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Guardar en el historial
    guardarEnHistorial({
        cliente: cliente,
        descripcion: descripcion,
        fecha: fecha,
        fechaFormateada: fechaFormateada,
        horaInicio: horaInicioReal, // Usamos la variable automática
        horaFin: horaFinReal,       // Usamos la variable automática
        horasTrabajadas: horasTrabajadas,
        tarifa: tarifa,
        montoTotal: montoTotal,
        timestamp: new Date().getTime()
    });
}

// --- GESTIÓN DE HISTORIAL ---
function guardarEnHistorial(trabajo) {
    let historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    historial.unshift(trabajo);
    localStorage.setItem('historialTrabajos', JSON.stringify(historial));
    cargarHistorial();
}

function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    const historialDiv = document.getElementById('historial');
    
    if (historial.length === 0) {
        historialDiv.innerHTML = '<p class="empty-history">No hay registros guardados</p>';
    } else {
        historialDiv.innerHTML = historial.map((trabajo, index) => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-date">📅 ${trabajo.fechaFormateada}</span>
                    <div class="history-item-buttons">
                        <button class="history-item-print" onclick="imprimirTicket(${index})">🖨️ Imprimir</button>
                        <button class="history-item-delete" onclick="eliminarRegistro(${index})">✕</button>
                    </div>
                </div>
                <div class="history-item-client">👤 ${trabajo.cliente}</div>
                <div class="history-item-description">📝 ${trabajo.descripcion}</div>
                <div class="history-item-details">
                    <div>⏱️ Horas: ${trabajo.horasTrabajadas.toFixed(2)} hrs</div>
                    <div>💵 Tarifa: $${trabajo.tarifa.toFixed(2)}/hr</div>
                </div>
                <div class="history-item-total">Total: $${trabajo.montoTotal.toFixed(2)}</div>
            </div>
        `).join('');
    }
    
    // Calcular totales del historial - SIEMPRE SE ACTUALIZA
    const totalTrabajos = historial.length;
    const totalHoras = historial.reduce((sum, t) => sum + t.horasTrabajadas, 0);
    const totalGanado = historial.reduce((sum, t) => sum + t.montoTotal, 0);
    
    document.getElementById('totalTrabajos').textContent = totalTrabajos;
    document.getElementById('totalHoras').textContent = totalHoras.toFixed(2) + ' hrs';
    document.getElementById('totalGanado').textContent = '$' + totalGanado.toFixed(2);
}

function eliminarRegistro(index) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        let historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
        historial.splice(index, 1);
        localStorage.setItem('historialTrabajos', JSON.stringify(historial));
        cargarHistorial();
    }
}

function limpiarHistorial() {
    if (confirm('¿Estás seguro de eliminar todo el historial?')) {
        localStorage.removeItem('historialTrabajos');
        cargarHistorial();
    }
}

// Función para imprimir ticket
function imprimirTicket(index) {
    const historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    const trabajo = historial[index];
    
    // --- CORRECCIÓN: Recuperamos la configuración aquí dentro ---
    const config = JSON.parse(localStorage.getItem('appConfig')) || { nombreNegocio: "Tu Empresa" };
    
    if (!trabajo) return;
    
    const ventanaImpresion = window.open('', '_blank', 'width=400,height=600');
    
    const contenidoTicket = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Ticket de Trabajo</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
                .ticket { border: 2px dashed #333; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
                .label { font-weight: bold; font-size: 12px; color: #666; }
                .value { font-size: 16px; font-weight: bold; }
                .total-section { background: #eee; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin-top: 20px; }
                .no-print { margin-top: 20px; width: 100%; padding: 10px; background: #667eea; color: white; border: none; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <h3>${config.nombreNegocio.toUpperCase()}</h3>
                    <p>Comprobante de Servicio</p>
                </div>
                <div class="section"><div class="label">CLIENTE</div><div class="value">${trabajo.cliente}</div></div>
                <div class="section"><div class="label">FECHA</div><div class="value">${trabajo.fechaFormateada}</div></div>
                <div class="section"><div class="label">DESCRIPCIÓN</div><div>${trabajo.descripcion}</div></div>
                <div class="total-section">TOTAL: $${trabajo.montoTotal.toFixed(2)}</div>
            </div>
            <button class="no-print" onclick="window.print()">Imprimir</button>
        </body>
        </html>
    `;
    ventanaImpresion.document.write(contenidoTicket);
    ventanaImpresion.document.close();
}

// --- FUNCIÓN PARA EXPORTAR A EXCEL ---
function exportarAExcel() {
    const historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    
    if (historial.length === 0) {
        alert('No hay registros para exportar');
        return;
    }
    
    // Preparar datos para Excel
    const datosExcel = historial.map(trabajo => ({
        'Cliente': trabajo.cliente,
        'Descripción': trabajo.descripcion,
        'Fecha': trabajo.fecha,
        'Hora Inicio': trabajo.horaInicio,
        'Hora Fin': trabajo.horaFin,
        'Horas Trabajadas': trabajo.horasTrabajadas.toFixed(2),
        'Tarifa por Hora': trabajo.tarifa.toFixed(2),
        'Monto Total': trabajo.montoTotal.toFixed(2)
    }));
    
    // Agregar fila de totales
    const totalHoras = historial.reduce((sum, t) => sum + t.horasTrabajadas, 0);
    const totalGanado = historial.reduce((sum, t) => sum + t.montoTotal, 0);
    
    datosExcel.push({
        'Cliente': '',
        'Descripción': '',
        'Fecha': '',
        'Hora Inicio': '',
        'Hora Fin': 'TOTAL:',
        'Horas Trabajadas': totalHoras.toFixed(2),
        'Tarifa por Hora': '',
        'Monto Total': totalGanado.toFixed(2)
    });
    
    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
        { wch: 20 }, // Cliente
        { wch: 40 }, // Descripción
        { wch: 12 }, // Fecha
        { wch: 12 }, // Hora Inicio
        { wch: 12 }, // Hora Fin
        { wch: 15 }, // Horas Trabajadas
        { wch: 15 }, // Tarifa por Hora
        { wch: 15 }  // Monto Total
    ];
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Trabajos');
    
    // Generar nombre de archivo con fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Historial_Trabajos_${fechaActual}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
}

// --- LÓGICA DE PERSONALIZACIÓN ---

// 1. Cargar configuración al iniciar la app
document.addEventListener('DOMContentLoaded', () => {
    const config = JSON.parse(localStorage.getItem('appConfig'));
    if (config) {
        aplicarPersonalizacion(config);
    } else {
        // Si es la primera vez, abrimos el menú para que configuren
        setTimeout(abrirConfig, 1000);
    }
});

function aplicarPersonalizacion(config) {
    // Cambiar el título principal
    const titulo = document.querySelector('h1');
    if (titulo) titulo.innerText = "💼 " + config.nombreNegocio;
    
    // Cambiar el título de la pestaña del navegador
    document.title = config.nombreNegocio + " - Calculadora";

    // Cambiar el color de fondo (el gradiente)
    if (config.colorPrincipal) {
        document.body.style.background = config.colorPrincipal;
        // Opcional: Cambiar botones también
        const botones = document.querySelectorAll('.calculate-btn, .btn-inicio');
        botones.forEach(btn => btn.style.backgroundColor = config.colorPrincipal);
    }
}

function guardarConfig() {
    const nombre = document.getElementById('configNombre').value;
    const color = document.getElementById('configColor').value;

    if (nombre.trim() === "") {
        alert("Por favor pon un nombre");
        return;
    }

    const config = {
        nombreNegocio: nombre,
        colorPrincipal: color
    };

    localStorage.setItem('appConfig', JSON.stringify(config));
    aplicarPersonalizacion(config);
    cerrarConfig();
}

// Funciones para abrir/cerrar modal
function abrirConfig() {
    document.getElementById('modalConfig').style.display = 'flex';
    // Rellenar con datos actuales si existen
    const config = JSON.parse(localStorage.getItem('appConfig'));
    if (config) {
        document.getElementById('configNombre').value = config.nombreNegocio;
        document.getElementById('configColor').value = config.colorPrincipal;
    }
}

function cerrarConfig() {
    document.getElementById('modalConfig').style.display = 'none';
}