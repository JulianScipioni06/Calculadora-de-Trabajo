// Establecer fecha actual por defecto al cargar la página
document.getElementById('fecha').valueAsDate = new Date();

// Cargar historial al iniciar
cargarHistorial();

function calcular() {
    const cliente = document.getElementById('cliente').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('inicio').value;
    const horaFin = document.getElementById('fin').value;
    const tarifa = parseFloat(document.getElementById('tarifa').value);

    // Validaciones
    if (!cliente || !descripcion || !fecha || !horaInicio || !horaFin || !tarifa) {
        alert('Por favor, completa todos los campos');
        return;
    }

    if (tarifa <= 0) {
        alert('La tarifa debe ser mayor a 0');
        return;
    }

    // Calcular horas trabajadas
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

    let minutosInicio = horaInicioH * 60 + horaInicioM;
    let minutosFin = horaFinH * 60 + horaFinM;

    // Si la hora de fin es menor, asumimos que es del día siguiente
    if (minutosFin < minutosInicio) {
        minutosFin += 24 * 60;
    }

    const minutosTrabajajos = minutosFin - minutosInicio;
    const horasTrabajadas = minutosTrabajajos / 60;

    // Calcular monto total
    const montoTotal = horasTrabajadas * tarifa;

    // Formatear fecha
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Mostrar resultados
    document.getElementById('resultCliente').textContent = cliente;
    document.getElementById('resultDescripcion').textContent = descripcion;
    document.getElementById('resultFecha').textContent = fechaFormateada;
    document.getElementById('resultHorario').textContent = `${horaInicio} - ${horaFin}`;
    document.getElementById('resultHoras').textContent = `${horasTrabajadas.toFixed(2)} horas`;
    document.getElementById('resultTarifa').textContent = `$${tarifa.toFixed(2)}`;
    document.getElementById('resultTotal').textContent = `$${montoTotal.toFixed(2)}`;

    // Mostrar panel de resultados
    const resultDiv = document.getElementById('resultado');
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Guardar en el historial
    guardarEnHistorial({
        cliente: cliente,
        descripcion: descripcion,
        fecha: fecha,
        fechaFormateada: fechaFormateada,
        horaInicio: horaInicio,
        horaFin: horaFin,
        horasTrabajadas: horasTrabajadas,
        tarifa: tarifa,
        montoTotal: montoTotal,
        timestamp: new Date().getTime()
    });
}

function guardarEnHistorial(trabajo) {
    // Obtener historial existente
    let historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    
    // Agregar nuevo trabajo al inicio
    historial.unshift(trabajo);
    
    // Guardar en localStorage
    localStorage.setItem('historialTrabajos', JSON.stringify(historial));
    
    // Actualizar visualización
    cargarHistorial();
}

function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    const historialDiv = document.getElementById('historial');
    const resumenDiv = document.getElementById('resumenTotal');
    
    if (historial.length === 0) {
        historialDiv.innerHTML = '<p class="empty-history">No hay registros guardados</p>';
        resumenDiv.style.display = 'none';
        return;
    }
    
    // Mostrar registros
    historialDiv.innerHTML = historial.map((trabajo, index) => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-item-date">📅 ${trabajo.fechaFormateada}</span>
                <div class="history-item-buttons">
                    <button class="history-item-print" onclick="imprimirTicket(${index})">🖨️</button>
                    <button class="history-item-delete" onclick="eliminarRegistro(${index})">✕</button>
                </div>
            </div>
            <div class="history-item-client">
                👤 ${trabajo.cliente}
            </div>
            <div class="history-item-description">
                📝 ${trabajo.descripcion}
            </div>
            <div class="history-item-details">
                <div>⏰ Horario: ${trabajo.horaInicio} - ${trabajo.horaFin}</div>
                <div>⏱️ Horas: ${trabajo.horasTrabajadas.toFixed(2)} hrs</div>
                <div>💵 Tarifa: $${trabajo.tarifa.toFixed(2)}/hr</div>
            </div>
            <div class="history-item-total">
                Total: $${trabajo.montoTotal.toFixed(2)}
            </div>
        </div>
    `).join('');
    
    // Calcular totales
    const totalTrabajos = historial.length;
    const totalHoras = historial.reduce((sum, t) => sum + t.horasTrabajadas, 0);
    const totalGanado = historial.reduce((sum, t) => sum + t.montoTotal, 0);
    
    // Mostrar resumen
    document.getElementById('totalTrabajos').textContent = totalTrabajos;
    document.getElementById('totalHoras').textContent = totalHoras.toFixed(2) + ' hrs';
    document.getElementById('totalGanado').textContent = '$' + totalGanado.toFixed(2);
    resumenDiv.style.display = 'block';
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

// Permitir calcular con Enter
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calcular();
        }
    });
});

// Función para imprimir ticket
function imprimirTicket(index) {
    const historial = JSON.parse(localStorage.getItem('historialTrabajos')) || [];
    const trabajo = historial[index];
    
    if (!trabajo) return;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=400,height=600');
    
    const contenidoTicket = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket de Trabajo</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    max-width: 350px;
                    margin: 0 auto;
                    background: white;
                }
                
                .ticket {
                    border: 2px dashed #333;
                    padding: 20px;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                
                .header p {
                    font-size: 12px;
                    color: #666;
                }
                
                .section {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px dashed #ccc;
                }
                
                .section:last-of-type {
                    border-bottom: none;
                }
                
                .label {
                    font-weight: bold;
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                
                .value {
                    font-size: 16px;
                    color: #333;
                    word-wrap: break-word;
                }
                
                .description {
                    font-size: 14px;
                    line-height: 1.5;
                    color: #333;
                }
                
                .total-section {
                    background: #f0f0f0;
                    padding: 20px;
                    margin-top: 20px;
                    text-align: center;
                    border: 2px solid #333;
                }
                
                .total-label {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    color: #666;
                }
                
                .total-amount {
                    font-size: 36px;
                    font-weight: bold;
                    color: #333;
                }
                
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px solid #333;
                    font-size: 11px;
                    color: #666;
                }
                
                .timestamp {
                    font-size: 10px;
                    color: #999;
                    text-align: center;
                    margin-top: 10px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .no-print {
                        display: none;
                    }
                    
                    .ticket {
                        border: 2px dashed #333;
                        page-break-inside: avoid;
                    }
                }
                
                .print-btn {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    margin-top: 20px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .print-btn:hover {
                    background: #5568d3;
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <h1>💼 RECIBO DE TRABAJO</h1>
                    <p>Comprobante de Servicios</p>
                </div>
                
                <div class="section">
                    <div class="label">Cliente</div>
                    <div class="value">${trabajo.cliente}</div>
                </div>
                
                <div class="section">
                    <div class="label">Fecha</div>
                    <div class="value">${trabajo.fechaFormateada}</div>
                </div>
                
                <div class="section">
                    <div class="label">Descripción del Trabajo</div>
                    <div class="description">${trabajo.descripcion}</div>
                </div>
                
                <div class="total-section">
                    <div class="total-label">Monto Total</div>
                    <div class="total-amount">$${trabajo.montoTotal.toFixed(2)}</div>
                </div>
                
                <div class="footer">
                    <p>Gracias por su preferencia</p>
                </div>
                
                <div class="timestamp">
                    Generado: ${new Date().toLocaleString('es-ES')}
                </div>
            </div>
            
            <button class="print-btn no-print" onclick="window.print()">
                🖨️ Imprimir Ticket
            </button>
            
            <script>
                // Auto-imprimir después de cargar (opcional)
                // window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;
    
    ventanaImpresion.document.write(contenidoTicket);
    ventanaImpresion.document.close();
}

//Probando Cronometrooo
let horas = 0;
let minutos = 0;
let segundos = 0;
let intervalo = null;
let estaCorriendo = false;

function cronometro() {
    segundos++;

    if (segundos === 60) {
        segundos = 0;
        minutos++;
        if (minutos === 60) {
            minutos = 0;
            horas++;
        }
    }

    // Formateo de ceros
    let h = horas < 10 ? "0" + horas : horas;
    let m = minutos < 10 ? "0" + minutos : minutos;
    let s = segundos < 10 ? "0" + segundos : segundos;

    document.getElementById("tiempo").innerHTML = `${h}:${m}:${s}`;
}

function iniciar() {
    if (!estaCorriendo) {
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
    horas = 0;
    minutos = 0;
    segundos = 0;
    document.getElementById("tiempo").innerHTML = "00:00:00";
}