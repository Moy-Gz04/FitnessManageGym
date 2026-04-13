const API = "http://localhost:3000"; // cambia a tu URL de Render si ya lo subiste

let grafica = null;

// ==============================
// CARGAR DATOS DEL DASHBOARD
// ==============================
async function cargarDashboard() {
    try {
        const res = await fetch(`${API}/dashboard`);
        const data = await res.json();

        document.getElementById("activos").textContent = data.activos;
        document.getElementById("vencidos").textContent = data.vencidos;
        document.getElementById("ingresosMes").textContent = "$" + data.ingresos;
        document.getElementById("miembrosTotal").textContent = data.total;

        // 🔥 NUEVOS
        document.getElementById("nuevosMes").textContent = data.nuevos || 0;

        // ⚠️ POR VENCER
        document.getElementById("porVencer").textContent = data.porVencer || 0;

    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

// ==============================
// CARGAR GRÁFICA ANUAL
// ==============================
async function cargarGrafica() {
    try {
        const res = await fetch(`${API}/ingresos-anuales`);
        const data = await res.json();

        // 📅 MESES (ya vienen listos del backend)
        const labels = data.map(d => d.mes);
        const valores = data.map(d => d.total);

        if (grafica) {
            grafica.destroy();
        }

        grafica = new Chart(document.getElementById('grafica'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Ingresos por Mes',
                    data: valores,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.2)',
                    pointBackgroundColor: '#38bdf8',
                    pointRadius: 5,
                    borderWidth: 3,
                    tension: 0.4
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.05)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.05)'
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando gráfica:", error);
    }
}

// ==============================
// CARGAR ÚLTIMOS ACCESOS (MEJORADO)
// ==============================
async function cargarAccesos() {
    try {
        const res = await fetch(`${API}/accesos`);
        const data = await res.json();

        const lista = document.getElementById("listaAccesos");
        lista.innerHTML = "";

        data.forEach(a => {

            const fecha = new Date(a.hora_entrada);

            const fechaFormateada = fecha.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short"
            });

            const horaFormateada = fecha.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit"
            });

            lista.innerHTML += `
                <li class="acceso-item">
                    <div class="acceso-nombre">${a.nombre}</div>
                    <div class="acceso-info">
                        <span class="acceso-fecha">${fechaFormateada}</span>
                        <span class="acceso-hora">${horaFormateada}</span>
                    </div>
                </li>
            `;
        });

    } catch (error) {
        console.error("Error cargando accesos:", error);
    }
}

// ==============================
// INICIALIZAR TODO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    cargarGrafica();
    cargarAccesos();
});