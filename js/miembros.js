document.addEventListener("DOMContentLoaded", () => {
    cargarMiembros();
});

function cargarMiembros() {
    fetch("http://localhost:3000/miembros")
        .then(res => res.json())
        .then(data => {
            const tabla = document.getElementById("tablaMiembros");
            tabla.innerHTML = "";

            data.forEach(m => {
                const estado = new Date(m.fecha_vencimiento) > new Date()
                    ? "Activo"
                    : "Vencido";

                tabla.innerHTML += `
                    <tr>
                        <td>${m.id}</td>
                        <td>${m.nombres}</td>
                        <td>${m.apellidos}</td>
                        <td>${m.email}</td>
                        <td>${m.telefono}</td>
                        <td>${m.huella_id ?? "-"}</td>
                        <td>${formatearFecha(m.fecha_registro)}</td>
                        <td>${formatearFecha(m.fecha_vencimiento)}</td>
                        <td>
                            <span class="badge ${estado === "Activo" ? "bg-success" : "bg-danger"}">
                                ${estado}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-warning btn-sm">Editar</button>
                            <button class="btn btn-danger btn-sm">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Error:", err));
}

function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString();
}