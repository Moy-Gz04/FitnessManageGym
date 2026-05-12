let miembros = [];

let miembroSeleccionado = null;

let tipoPago = null;

// =============================
// 🔐 TOKEN
// =============================

const token =
    localStorage.getItem("token");

// NO LOGIN
if (!token) {

    window.location.href =
        "index.html";

}

// HEADERS
function obtenerHeaders() {

    return {

        "Content-Type":
            "application/json",

        Authorization:
            `Bearer ${token}`

    };

}

// =============================
// 🔹 CARGAR MIEMBROS
// =============================

async function cargarMiembros() {

    try {

        const res =
            await fetch(
                "http://localhost:3000/miembros",
                {

                    headers:
                        obtenerHeaders()

                }
            );

        const data =
            await res.json();

        if (!res.ok) {

            throw new Error(

                data.error ||
                "Error al cargar miembros"

            );

        }

        miembros = data;

        console.log(
            "MIEMBROS:",
            miembros
        );

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        mostrarModalPago(

            "Error",

            "No se pudieron cargar los miembros",

            true

        );

    }

}

cargarMiembros();

// =============================
// 🔍 BUSCADOR
// =============================

document.getElementById(
    "buscarMiembro"
).addEventListener(
    "input",
    (e) => {

        const texto =
            e.target.value.toLowerCase();

        const lista =
            document.getElementById(
                "listaMiembros"
            );

        lista.innerHTML = "";

        if (texto.length < 2) {

            return;

        }

        const filtrados =
            miembros.filter((m) =>

                (
                    m.nombres +
                    " " +
                    m.apellidos
                )
                .toLowerCase()
                .includes(texto)

            );

        filtrados.forEach((m) => {

            lista.innerHTML += `

                <div
                    class="
                        p-2
                        border
                        mb-1
                        item-miembro
                    "
                    data-id="${m.id}"
                    style="cursor:pointer;"
                >

                    ${m.nombres}
                    ${m.apellidos}

                </div>

            `;

        });

    }
);

// =============================
// 🎯 SELECCIONAR MIEMBRO
// =============================

document.getElementById(
    "listaMiembros"
).addEventListener(
    "click",
    (e) => {

        if (

            !e.target.classList.contains(
                "item-miembro"
            )

        ) {

            return;

        }

        const id =
            e.target.dataset.id;

        const m =
            miembros.find(
                (x) => x.id == id
            );

        if (!m) {

            return;

        }

        miembroSeleccionado = m;

        console.log(
            "MIEMBRO SELECCIONADO:",
            m
        );

        document.getElementById(
            "cardUsuario"
        ).classList.remove(
            "d-none"
        );

        document.getElementById(
            "nombreCompleto"
        ).textContent =

            m.nombres +
            " " +
            m.apellidos;

        document.getElementById(
            "idUsuario"
        ).textContent =
            m.id;

        // limpiar lista
        document.getElementById(
            "listaMiembros"
        ).innerHTML = "";

        document.getElementById(
            "buscarMiembro"
        ).value =
            m.nombres;

        validarFormulario();

    }
);

// =============================
// 💰 SELECCIONAR TIPO DE PAGO
// =============================

document
    .querySelectorAll(".btn-pago")
    .forEach((btn) => {

        btn.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".btn-pago"
                    )
                    .forEach((b) =>

                        b.classList.remove(
                            "active"
                        )

                    );

                btn.classList.add(
                    "active"
                );

                tipoPago =
                    btn.dataset.tipo;

                console.log(
                    "TIPO SELECCIONADO:",
                    tipoPago
                );

                validarFormulario();

            }
        );

    });

// =============================
// ✅ VALIDAR FORMULARIO
// =============================

function validarFormulario() {

    const btn =
        document.getElementById(
            "btnConfirmar"
        );

    btn.disabled = !(

        miembroSeleccionado &&
        tipoPago

    );

}

// =============================
// 🚀 CONFIRMAR PAGO
// =============================

document.getElementById(
    "btnConfirmar"
).addEventListener(
    "click",
    async () => {

        if (

            !miembroSeleccionado ||
            !tipoPago

        ) {

            mostrarModalPago(

                "Error",

                "Selecciona miembro y tipo de pago",

                true

            );

            return;

        }

        console.log(
            "ENVIANDO:",
            {

                miembro_id:
                    miembroSeleccionado.id,

                tipo:
                    tipoPago

            }
        );

        try {

            const res =
                await fetch(
                    "http://localhost:3000/pagos",
                    {

                        method: "POST",

                        headers:
                            obtenerHeaders(),

                        body:
                            JSON.stringify({

                                miembro_id:
                                    miembroSeleccionado.id,

                                tipo:
                                    tipoPago

                            })

                    }
                );

            const data =
                await res.json()
                .catch(() => ({}));

            console.log(
                "RESPUESTA:",
                data
            );

            if (!res.ok) {

                throw new Error(

                    data.error ||
                    "Error en servidor"

                );

            }

            // =============================
            // MODAL ÉXITO
            // =============================

            mostrarModalPago(

                "Pago registrado",

                `

                <strong>
                    ${miembroSeleccionado.nombres}
                    ${miembroSeleccionado.apellidos}
                </strong>

                <br><br>

                Pago realizado correctamente

                <br><br>

                <strong>Monto:</strong>
                $${data.monto || 0}

                <br>

                <strong>Días agregados:</strong>
                ${data.dias || 0}

                `

            );

            // =============================
            // RESET UI
            // =============================

            miembroSeleccionado =
                null;

            tipoPago =
                null;

            document.getElementById(
                "cardUsuario"
            ).classList.add(
                "d-none"
            );

            document.getElementById(
                "buscarMiembro"
            ).value = "";

            document.getElementById(
                "listaMiembros"
            ).innerHTML = "";

            document
                .querySelectorAll(
                    ".btn-pago"
                )
                .forEach((b) =>

                    b.classList.remove(
                        "active"
                    )

                );

            validarFormulario();

        } catch (error) {

            console.error(
                "ERROR:",
                error
            );

            mostrarModalPago(

                "Error",

                error.message,

                true

            );

        }

    }
);

// =============================
// 🎨 MODAL GLOBAL
// =============================

function mostrarModalPago(

    titulo,
    mensaje,
    error = false

) {

    document.getElementById(
        "tituloPago"
    ).innerHTML =
        titulo;

    document.getElementById(
        "mensajePago"
    ).innerHTML =
        mensaje;

    const icono =
        document.getElementById(
            "iconoPago"
        );

    // ERROR
    if (error) {

        icono.innerHTML = "✕";

        icono.style.background =
            "rgba(220,53,69,0.12)";

        icono.style.color =
            "var(--color-error)";

        icono.style.border =
            "2px solid var(--color-error)";

    }

    // ÉXITO
    else {

        icono.innerHTML = "✓";

        icono.style.background =
            "rgba(25,135,84,0.15)";

        icono.style.color =
            "var(--color-exito)";

        icono.style.border =
            "2px solid var(--color-exito)";

    }

    new bootstrap.Modal(

        document.getElementById(
            "modalPago"
        )

    ).show();

}