console.log("JS cargado");

let miembroAEliminar = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarMiembros();
});

/* ============================= */
/* CARGAR MIEMBROS */
/* ============================= */
async function cargarMiembros() {
  try {
    const res = await fetch("http://localhost:3000/miembros");

    if (!res.ok) {
      throw new Error("Error en servidor");
    }

    const data = await res.json();

    const tabla =
      document.getElementById(
        "tablaMiembros"
      );

    if (!tabla) {
      console.error(
        "No existe tablaMiembros"
      );
      return;
    }

    tabla.innerHTML = "";

    data.forEach((m) => {

      const estado =
        m.fecha_vencimiento &&
        new Date(
          m.fecha_vencimiento
        ) > new Date()
          ? "Activo"
          : "Vencido";

      const tr =
        document.createElement("tr");

      tr.innerHTML = `

        <td>${m.id}</td>

        <td>${m.nombres}</td>

        <td>${m.apellidos}</td>

        <td>${m.email || "-"}</td>

        <td>${m.telefono || "-"}</td>

        <td>
          ${
            m.huella_id
              ? "✅"
              : "❌"
          }
        </td>

        <td>
          ${
            m.nfc_uid
              ? "📶 Asignado"
              : "❌"
          }
        </td>

        <td>
          ${formatearFecha(
            m.fecha_registro
          )}
        </td>

        <td>
          ${
            m.fecha_vencimiento
              ? formatearFecha(
                  m.fecha_vencimiento
                )
              : "-"
          }
        </td>

        <td>
          <span class="badge ${
            estado === "Activo"
              ? "bg-success"
              : "bg-danger"
          }">
            ${estado}
          </span>
        </td>

        <td class="acciones">

          <button class="btn btn-warning btn-sm btn-editar">
            Editar
          </button>

          <button class="btn btn-danger btn-sm btn-eliminar">
            Eliminar
          </button>

        </td>
      `;

      // =============================
      // EVENTOS
      // =============================

      tr.querySelector(
        ".btn-editar"
      ).addEventListener(
        "click",
        () => abrirEditar(m.id)
      );

      tr.querySelector(
        ".btn-eliminar"
      ).addEventListener(
        "click",
        (e) => eliminarMiembro(m.id, e)
      );

      tabla.appendChild(tr);

    });

  } catch (err) {

    console.error(
      "Error cargando miembros:",
      err
    );
  }
}

/* ============================= */
/* ABRIR EDITAR */
/* ============================= */
async function abrirEditar(id) {

  try {

    const res = await fetch(
      `http://localhost:3000/miembros/${id}`
    );

    if (!res.ok) {
      throw new Error(
        "Error al obtener miembro"
      );
    }

    const m = await res.json();

    document.getElementById(
      "editId"
    ).value = m.id;

    document.getElementById(
      "editNombre"
    ).value = m.nombres;

    document.getElementById(
      "editApellido"
    ).value = m.apellidos;

    document.getElementById(
      "editEmail"
    ).value = m.email || "";

    document.getElementById(
      "editTelefono"
    ).value = m.telefono || "";

    document.getElementById(
      "editHuella"
    ).value = m.huella_id || "-";

    document.getElementById(
      "editVencimiento"
    ).value =
      m.fecha_vencimiento
        ? m.fecha_vencimiento.split("T")[0]
        : "";

    new bootstrap.Modal(
      document.getElementById(
        "modalEditar"
      )
    ).show();

  } catch (err) {

    console.error(
      "Error abriendo edición:",
      err
    );
  }
}

/* ============================= */
/* ABRIR CONFIRMACIÓN */
/* ============================= */
window.abrirConfirmacion =
  function () {

    const modalEditar =
      bootstrap.Modal.getInstance(
        document.getElementById(
          "modalEditar"
        )
      );

    if (modalEditar) {
      modalEditar.hide();
    }

    setTimeout(() => {

      new bootstrap.Modal(
        document.getElementById(
          "modalConfirmar"
        )
      ).show();

    }, 200);
  };

/* ============================= */
/* CONFIRMAR GUARDADO */
/* ============================= */
window.confirmarGuardar =
  async function () {

    try {

      const id =
        document.getElementById(
          "editId"
        ).value;

      const res = await fetch(
        `http://localhost:3000/miembros/${id}`,
        {

          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            nombres:
              document.getElementById(
                "editNombre"
              ).value,

            apellidos:
              document.getElementById(
                "editApellido"
              ).value,

            email:
              document.getElementById(
                "editEmail"
              ).value,

            telefono:
              document.getElementById(
                "editTelefono"
              ).value,

            fecha_vencimiento:
              document.getElementById(
                "editVencimiento"
              ).value

          })

        }
      );

      if (!res.ok) {
        throw new Error(
          "Error al actualizar"
        );
      }

      cerrarModal(
        "modalConfirmar"
      );

      await cargarMiembros();

      mostrarExito(
        "Datos actualizados correctamente"
      );

    } catch (err) {

      console.error(
        "Error guardando:",
        err
      );
    }
  };

/* ============================= */
/* SEGUIR EDITANDO */
/* ============================= */
window.seguirEditando =
  function () {

    cerrarModal(
      "modalConfirmar"
    );

    new bootstrap.Modal(
      document.getElementById(
        "modalEditar"
      )
    ).show();
  };

/* ============================= */
/* CANCELAR TODO */
/* ============================= */
window.cancelarTodo =
  function () {

    cerrarModal(
      "modalConfirmar"
    );

    cerrarModal(
      "modalEditar"
    );
  };

/* ============================= */
/* ELIMINAR */
/* ============================= */
function eliminarMiembro(
  id,
  e
) {

  const tr =
    e.target.closest("tr");

  const textoFecha =
    tr.children[8].innerText;

  let fechaVencimiento = null;

  if (
    textoFecha &&
    textoFecha !== "-"
  ) {

    fechaVencimiento =
      new Date(
        textoFecha
          .split("/")
          .reverse()
          .join("-")
      );
  }

  const hoy =
    new Date();

  if (
    fechaVencimiento &&
    fechaVencimiento > hoy
  ) {

    new bootstrap.Modal(
      document.getElementById(
        "modalBloqueado"
      )
    ).show();

    return;
  }

  miembroAEliminar = id;

  new bootstrap.Modal(
    document.getElementById(
      "modalEliminar"
    )
  ).show();
}

/* ============================= */
/* CONFIRMAR ELIMINACIÓN */
/* ============================= */
window.confirmarEliminar =
  async function () {

    try {

      const res = await fetch(
        `http://localhost:3000/miembros/${miembroAEliminar}`,
        {
          method: "DELETE"
        }
      );

      if (!res.ok) {
        throw new Error(
          "Error al eliminar"
        );
      }

      cerrarModal(
        "modalEliminar"
      );

      await cargarMiembros();

      mostrarExito(
        "Miembro eliminado correctamente"
      );

    } catch (err) {

      console.error(
        "Error eliminando:",
        err
      );
    }
  };

/* ============================= */
/* MODAL ÉXITO */
/* ============================= */
function mostrarExito(
  mensaje
) {

  document.getElementById(
    "mensajeExito"
  ).innerText = mensaje;

  new bootstrap.Modal(
    document.getElementById(
      "modalExito"
    )
  ).show();
}

/* ============================= */
/* UTILIDAD */
/* ============================= */
function cerrarModal(id) {

  const modal =
    bootstrap.Modal.getInstance(
      document.getElementById(id)
    );

  if (modal) {
    modal.hide();
  }
}

/* ============================= */
/* FORMATO FECHA */
/* ============================= */
function formatearFecha(
  fecha
) {

  if (!fecha) {
    return "-";
  }

  return new Date(
    fecha
  ).toLocaleDateString();
}