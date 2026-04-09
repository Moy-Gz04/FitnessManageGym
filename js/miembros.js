let miembrosGlobal = []

async function cargarMiembros() {

    const res = await fetch(API)
    const data = await res.json()

    miembrosGlobal = data

    renderTabla(data)

}

function renderTabla(data) {

    const tabla = document.getElementById("tablaMiembros")

    tabla.innerHTML = ""

    data.forEach(m => {

        const hoy = new Date();
        const fechaVencimiento = new Date(m.fechaVencimiento);

        let estado = "";
        let claseEstado = "";

        const diffDias = (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24);

        if (fechaVencimiento < hoy) {

            estado = "Vencido";
            claseEstado = "estado-rojo";

        }
        else if (diffDias <= 5) {

            estado = "Por vencer";
            claseEstado = "estado-amarillo";

        }
        else {

            estado = "Activo";
            claseEstado = "estado-verde";

        }
        tabla.innerHTML += `

<tr>

<td>${m.id}</td>
<td>${m.nombre}</td>
<td>${m.apellido}</td>
<td>${m.email}</td>
<td>${m.telefono}</td>
<td>${m.huellaId}</td>

<td>${new Date(m.fechaRegistro).toLocaleDateString()}</td>

<td>${new Date(m.fechaVencimiento).toLocaleDateString()}</td>

<td>
<span class="estado ${claseEstado}">
${estado}
</span>
</td>

<td>

<button class="btn btn-warning btn-sm me-2"
onclick="abrirEditar(${m.id})">
Editar
</button>

<button  class="btn neon-pay-btn"
onclick="abrirPago(${m.id}, '${m.nombre}')">
Pagar
</button>

</td>

</tr>

`
    })

}

cargarMiembros()

/* BUSCADOR */

document.getElementById("buscadorMiembros")
    .addEventListener("keyup", function () {

        const texto = this.value.toLowerCase()

        const filtrados = miembrosGlobal.filter(m =>

            m.nombre.toLowerCase().includes(texto) ||
            m.apellido.toLowerCase().includes(texto) ||
            m.email.toLowerCase().includes(texto) ||
            m.telefono.includes(texto)

        )

        renderTabla(filtrados)

    })

/* ABRIR MODAL EDITAR */
function abrirPago(id, nombre) {

    document.getElementById("pagoMiembroId").value = id
    document.getElementById("pagoNombre").value = nombre

    const modal = new bootstrap.Modal(document.getElementById("modalPago"))

    modal.show()

}

async function registrarPago() {

    const id = document.getElementById("pagoMiembroId").value

    const pago = {

        monto: parseFloat(document.getElementById("pagoMonto").value),
        mesesPagados: parseInt(document.getElementById("pagoMeses").value),
        observaciones: document.getElementById("pagoObs").value

    }

    const res = await fetch(`${API}/${id}/pagar`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pago)

    })

    if (res.ok) {

        const data = await res.json()

        alert("Pago registrado. Nueva fecha: " + data.nuevaFechaVencimiento)

        location.reload()

    } else {

        alert("Error al registrar pago")

    }

}
function abrirEditar(id) {

    const miembro = miembrosGlobal.find(m => m.id === id)

    document.getElementById("editId").value = miembro.id
    document.getElementById("editNombre").value = miembro.nombre
    document.getElementById("editApellido").value = miembro.apellido
    document.getElementById("editEmail").value = miembro.email
    document.getElementById("editTelefono").value = miembro.telefono
    document.getElementById("editHuella").value = miembro.huellaId
    document.getElementById("editVencimiento").value = miembro.fechaVencimiento.split("T")[0]
    document.getElementById("editActivo").checked = miembro.activo

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"))
    modal.show()

}

/* GUARDAR CAMBIOS */

async function guardarCambios() {

    const id = document.getElementById("editId").value

    const miembroActualizado = {

        id: parseInt(id),   // 👈 ESTA ES LA CLAVE

        nombre: document.getElementById("editNombre").value,
        apellido: document.getElementById("editApellido").value,
        email: document.getElementById("editEmail").value,
        telefono: document.getElementById("editTelefono").value,
        huellaId: document.getElementById("editHuella").value,
        fechaVencimiento: document.getElementById("editVencimiento").value + "T00:00:00",
        activo: document.getElementById("editActivo").checked

    }

    const res = await fetch(`${API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(miembroActualizado)

    })

    if (res.ok) {

        alert("Miembro actualizado")

        location.reload()

    } else {

        alert("Error al actualizar")

    }

}