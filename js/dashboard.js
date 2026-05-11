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

        // NUEVOS
        document.getElementById("nuevosMes").textContent = data.nuevos || 0;

        // POR VENCER
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

        // Variables del tema
        const rootStyles = getComputedStyle(document.documentElement);

        const colorPrimario = rootStyles.getPropertyValue("--color-primario").trim();
        const colorAcento = rootStyles.getPropertyValue("--color-acento").trim();
        const colorTexto = rootStyles.getPropertyValue("--color-texto").trim();
        const colorTextoSecundario = rootStyles.getPropertyValue("--color-texto-secundario").trim();

        // Datos backend
        const labels = data.map(d => d.mes);
        const valores = data.map(d => d.total);

        if (grafica) {
            grafica.destroy();
        }

        grafica = new Chart(document.getElementById("grafica"), {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Ingresos por Mes",
                    data: valores,
                    borderColor: colorPrimario,
                    backgroundColor: colorAcento,
                    pointBackgroundColor: colorPrimario,
                    pointRadius: 5,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: colorTexto
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: colorTexto
                        },
                        grid: {
                            color: "rgba(0,0,0,0.05)"
                        }
                    },
                    y: {
                        ticks: {
                            color: colorTexto
                        },
                        grid: {
                            color: "rgba(0,0,0,0.05)"
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
// CARGAR ÚLTIMOS ACCESOS
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
// RECARGAR GRÁFICA SI CAMBIA TEMA
// ==============================
function observarCambiosTema() {
    const observer = new MutationObserver(() => {
        cargarGrafica();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

// ==============================
// INICIALIZAR TODO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    cargarGrafica();
    cargarAccesos();
    observarCambiosTema();
});