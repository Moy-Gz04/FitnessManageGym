console.log("Pantalla biométrica cargada");

// =============================
// ESTADO GLOBAL
// =============================

let escaneoActivo = false;
let nfcUID = null;

// =============================
// INICIO
// =============================

window.addEventListener("DOMContentLoaded", () => {

    actualizarEstado(
        "Esperando tarjeta NFC..."
    );

    iniciarNFC();

});

// =============================
// INICIAR NFC
// =============================

function iniciarNFC() {

    const input =
        document.getElementById(
            "nfcInput"
        );

    if (!input) {

        console.error(
            "No existe nfcInput"
        );

        actualizarEstado(
            "Input NFC no encontrado"
        );

        return;
    }

    console.log(
        "LECTOR NFC INICIADO"
    );

    actualizarEstado(
        "Acerque tarjeta NFC..."
    );

    // mantener foco SIEMPRE
    setInterval(() => {

        input.focus();

    }, 500);

    // detectar lectura
    input.addEventListener(
        "keydown",
        async (e) => {

            if (e.key !== "Enter") {
                return;
            }

            e.preventDefault();

            const uid =
                input.value.trim();

            input.value = "";

            if (!uid) {
                return;
            }

            nfcUID = uid;

            console.log(
                "NFC DETECTADO:",
                nfcUID
            );

            actualizarEstado(
                "Validando tarjeta..."
            );

            try {

                // =============================
                // VALIDAR NFC
                // =============================

                const accesoNFC =
                    await validarNFC(
                        nfcUID
                    );

                console.log(
                    "RESPUESTA NFC:",
                    accesoNFC
                );

                // no encontrada
                if (
                    !accesoNFC.success
                ) {

                    ocultarMiembro();

                    actualizarEstado(
                        "❌ Tarjeta no registrada"
                    );

                    return;
                }

                // vencido
                if (
                    accesoNFC.miembro.estado ===
                    "Vencido"
                ) {

                    ocultarMiembro();

                    actualizarEstado(
                        "❌ Membresía vencida"
                    );

                    return;
                }

                // =============================
                // ACCESO NFC
                // =============================

                mostrarMiembro(
                    accesoNFC.miembro
                );

            } catch (err) {

                console.error(
                    "ERROR NFC:",
                    err
                );

                actualizarEstado(
                    "❌ Error validando NFC"
                );
            }
        }
    );
}

// =============================
// ESCANEAR HUELLA
// =============================

async function escanearHuella() {

    if (escaneoActivo) {
        return;
    }

    escaneoActivo = true;

    try {

        const boton =
            document.getElementById(
                "btnEscanear"
            );

        if (boton) {

            boton.disabled = true;
        }

        actualizarEstado(
            "Escanee huella..."
        );

        const credential =
            await solicitarHuella();

        // cancelado
        if (!credential) {

            actualizarEstado(
                "Escaneo cancelado"
            );

            return;
        }

        actualizarEstado(
            "Validando acceso..."
        );

        const credentialId =
            credential.id;

        console.log(
            "HUELLA:",
            credentialId
        );

        // =============================
        // VALIDAR BACKEND
        // =============================

        const acceso =
            await validarAcceso(
                credentialId
            );

        console.log(
            "RESPUESTA BACKEND:",
            acceso
        );

        if (acceso.success) {

            mostrarMiembro(
                acceso.miembro
            );

        } else {

            ocultarMiembro();

            actualizarEstado(
                "❌ Huella no registrada"
            );
        }

    } catch (err) {

        console.error(
            "ERROR BIOMÉTRICO:",
            err
        );

        actualizarEstado(
            "❌ Error biométrico"
        );

    } finally {

        escaneoActivo = false;

        const boton =
            document.getElementById(
                "btnEscanear"
            );

        if (boton) {

            boton.disabled = false;
        }
    }
}

// =============================
// SOLICITAR HUELLA
// =============================

async function solicitarHuella() {

    const challenge =
        new Uint8Array(32);

    crypto.getRandomValues(
        challenge
    );

    try {

        console.log(
            "ABRIENDO WINDOWS HELLO..."
        );

        const credential =
            await navigator.credentials.get({

                publicKey: {

                    challenge,

                    timeout: 60000,

                    userVerification:
                        "required",

                    rpId:
                        window.location.hostname

                }

            });

        console.log(
            "CREDENTIAL RECIBIDA:",
            credential
        );

        return credential;

    } catch (err) {

        console.error(
            "ERROR HUELLA:",
            err
        );

        return null;
    }
}

// =============================
// VALIDAR NFC
// =============================

async function validarNFC(
    nfc_uid
) {

    const res =
        await fetch(
            "http://localhost:3000/acceso-nfc",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    nfc_uid

                })

            }
        );

    return await res.json();
}

// =============================
// VALIDAR HUELLA
// =============================

async function validarAcceso(
    credentialId
) {

    const res =
        await fetch(
            "http://localhost:3000/acceso-biometrico",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    credentialId

                })

            }
        );

    return await res.json();
}

// =============================
// MOSTRAR MIEMBRO
// =============================

function mostrarMiembro(
    miembro
) {

    const card =
        document.getElementById(
            "miembroCard"
        );

    card.classList.remove(
        "d-none"
    );

    // =============================
    // NOMBRE
    // =============================

    document.getElementById(
        "nombreMiembro"
    ).innerText =
        miembro.nombre;

    // =============================
// FECHA VENCIMIENTO
// =============================

const fechaFormateada =
    miembro.vencimiento

        ? new Date(
            miembro.vencimiento
        ).toLocaleDateString(
            "es-MX"
        )

        : "-";

document.getElementById(
    "fechaVencimiento"
).innerText =
    fechaFormateada;

    // =============================
    // DÍAS RESTANTES
    // =============================

    document.getElementById(
        "diasRestantes"
    ).innerText =
        (miembro.dias_restantes ?? 0)
        + " días";

    // =============================
    // ÚLTIMO ACCESO
    // =============================

    document.getElementById(
        "ultimoAcceso"
    ).innerText =
        miembro.ultimo_acceso ||
        "Primer acceso";

    // =============================
    // ESTADO
    // =============================

    const estado =
        document.getElementById(
            "estadoMembresia"
        );

    estado.innerText =
        miembro.estado || "-";

    estado.className =
        "estado-badge";

    if (
        miembro.estado === "Activo"
    ) {

        estado.classList.add(
            "estado-activo"
        );

        actualizarEstado(
            "✅ ACCESO AUTORIZADO"
        );

    } else {

        estado.classList.add(
            "estado-vencido"
        );

        actualizarEstado(
            "❌ MEMBRESÍA VENCIDA"
        );
    }
}

// =============================
// OCULTAR MIEMBRO
// =============================

function ocultarMiembro() {

    document
        .getElementById(
            "miembroCard"
        )
        .classList.add(
            "d-none"
        );
}

// =============================
// ACTUALIZAR ESTADO
// =============================

function actualizarEstado(
    texto
) {

    document.getElementById(
        "statusBox"
    ).innerText =
        texto;
}