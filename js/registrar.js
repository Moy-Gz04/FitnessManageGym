console.log("JS registro cargado");

let credentialBiometrica = null;
let nfcUID = null;

// =============================
// VALIDACIONES
// =============================

function esEmailValido(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function esTelefonoValido(telefono) {

    return /^[0-9]{7,15}$/.test(telefono);

}

// =============================
// MODALES
// =============================

function mostrarExito() {

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "modalExitoRegistro"
            )
        );

    modal.show();

    document.getElementById(
        "btnOkExito"
    ).onclick = () => {

        window.location.href =
            "miembros.html";

    };

}

function mostrarError(html) {

    document.getElementById(
        "mensajeErrorRegistro"
    ).innerHTML = html;

    new bootstrap.Modal(
        document.getElementById(
            "modalErrorRegistro"
        )
    ).show();

}

// =============================
// LIMPIAR ERRORES
// =============================

function limpiarErrores() {

    document
        .querySelectorAll(".form-control")
        .forEach((input) => {

            input.classList.remove(
                "input-error"
            );

        });

}

// =============================
// REGISTRAR HUELLA
// =============================

async function registrarHuella() {

    if (!window.PublicKeyCredential) {

        mostrarError(
            "• WebAuthn no soportado"
        );

        return;
    }

    try {

        const challenge =
            new Uint8Array(32);

        window.crypto.getRandomValues(
            challenge
        );

        const userId =
            new Uint8Array(16);

        window.crypto.getRandomValues(
            userId
        );

        const publicKey = {

            challenge,

            rp: {
                name: "Gym System"
            },

            user: {

                id: userId,

                name:
                    "usuario@gym.com",

                displayName:
                    "Miembro Gym"

            },

            pubKeyCredParams: [
                {
                    type: "public-key",
                    alg: -7
                }
            ],

            authenticatorSelection: {

                authenticatorAttachment:
                    "platform",

                userVerification:
                    "required"

            },

            timeout: 60000,

            attestation: "direct"

        };

        const credential =
            await navigator.credentials.create({

                publicKey

            });

        credentialBiometrica =
            credential;

        document.getElementById(
            "estadoHuella"
        ).innerText =
            "Huella registrada";

        document.getElementById(
            "estadoHuella"
        ).style.color =
            "#00ff99";

        console.log(
            "CREDENCIAL:",
            credential
        );

    } catch (err) {

        console.error(err);

        mostrarError(
            "• Error al capturar huella"
        );

    }

}

// =============================
// NFC POR LECTOR USB
// =============================

function iniciarLectorNFC() {

    const input =
        document.getElementById(
            "nfcInput"
        );

    if (!input) {

        console.error(
            "No existe nfcInput"
        );

        return;
    }

    // foco inicial
    setTimeout(() => {

        input.focus();

    }, 500);

    // mantener foco
    document.addEventListener(
        "click",
        (e) => {

            const tag =
                e.target.tagName;

            const escribiendo =
                tag === "INPUT" ||
                tag === "TEXTAREA";

            if (!escribiendo) {

                input.focus();

            }

        }
    );

    // DEBUG
    document.addEventListener(
        "keydown",
        (e) => {

            console.log(
                "TECLA:",
                e.key
            );

        }
    );

    // detectar lectura NFC
    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                input._timer
            );

            input._timer =
                setTimeout(() => {

                    const uid =
                        input.value.trim();

                    if (!uid) {
                        return;
                    }

                    nfcUID = uid;

                    console.log(
                        "NFC UID:",
                        nfcUID
                    );

                    document.getElementById(
                        "estadoNFC"
                    ).innerText =
                        "NFC asignado";

                    document.getElementById(
                        "estadoNFC"
                    ).style.color =
                        "#00ff99";

                    input.value = "";

                    input.focus();

                }, 100);

        }
    );

}

// =============================
// REGISTRAR MIEMBRO
// =============================

async function registrarMiembro(e) {

    console.log(
        "CLICK FUNCIONANDO"
    );

    const boton =
        e?.target ||
        document.getElementById(
            "btnRegistrar"
        );

    limpiarErrores();

    const nombres =
        document.getElementById(
            "nombres"
        ).value.trim();

    const apellidoP =
        document.getElementById(
            "apellidoPaterno"
        ).value.trim();

    const apellidoM =
        document.getElementById(
            "apellidoMaterno"
        ).value.trim();

    const email =
        document.getElementById(
            "correo"
        ).value.trim();

    const telefono =
        document.getElementById(
            "telefono"
        ).value.trim();

    const fechaNacimiento =
        document.getElementById(
            "fechaNacimiento"
        ).value;

    let errores = [];

    // =============================
    // VALIDACIONES
    // =============================

    if (!nombres) {

        errores.push(
            "El nombre es obligatorio"
        );

        document.getElementById(
            "nombres"
        ).classList.add(
            "input-error"
        );

    }

    if (!apellidoP) {

        errores.push(
            "El apellido paterno es obligatorio"
        );

        document.getElementById(
            "apellidoPaterno"
        ).classList.add(
            "input-error"
        );

    }

    if (!apellidoM) {

        errores.push(
            "El apellido materno es obligatorio"
        );

        document.getElementById(
            "apellidoMaterno"
        ).classList.add(
            "input-error"
        );

    }

    if (!fechaNacimiento) {

        errores.push(
            "La fecha de nacimiento es obligatoria"
        );

        document.getElementById(
            "fechaNacimiento"
        ).classList.add(
            "input-error"
        );

    }

    if (
        email &&
        !esEmailValido(email)
    ) {

        errores.push(
            "Correo electrónico inválido"
        );

        document.getElementById(
            "correo"
        ).classList.add(
            "input-error"
        );

    }

    if (
        telefono &&
        !esTelefonoValido(
            telefono
        )
    ) {

        errores.push(
            "El teléfono debe contener solo números (7-15 dígitos)"
        );

        document.getElementById(
            "telefono"
        ).classList.add(
            "input-error"
        );

    }

    // =============================
    // MOSTRAR ERRORES
    // =============================

    if (errores.length > 0) {

        const htmlErrores =
            errores
                .map((e) => `<div>• ${e}</div>`)
                .join("");

        mostrarError(
            htmlErrores
        );

        return;
    }

    // =============================
    // DATA
    // =============================

    const datos = {

        nombres,

        apellidos:
            apellidoP +
            " " +
            apellidoM,

        email:
            email || null,

        telefono:
            telefono || null,

        fecha_nacimiento:
            fechaNacimiento,

        huella_id:
            credentialBiometrica
                ? credentialBiometrica.id
                : null,

        nfc_uid:
            nfcUID

    };

    console.log(
        "ENVIANDO:",
        datos
    );

    // =============================
    // UI
    // =============================

    boton.disabled = true;

    boton.innerText =
        "Registrando...";

    try {

        const res =
            await fetch(
                "http://localhost:3000/miembros",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            datos
                        )

                }
            );

        console.log(
            "RESPUESTA:",
            res
        );

        // =============================
        // ERROR BACKEND
        // =============================

        if (!res.ok) {

            if (res.status === 409) {

                const data =
                    await res.json();

                throw new Error(
                    data.error
                );

            }

            const errorData =
                await res.json();

            throw new Error(
                errorData.error ||
                "Error en el servidor"
            );

        }

        mostrarExito();

    } catch (err) {

        console.error(
            "ERROR:",
            err
        );

        mostrarError(
            `<div>• ${err.message}</div>`
        );

    } finally {

        boton.disabled = false;

        boton.innerText =
            "Registrar miembro";

    }

}

// =============================
// EVENTOS
// =============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btn =
            document.getElementById(
                "btnRegistrar"
            );

        if (!btn) {

            console.error(
                "No existe el botón"
            );

            return;
        }

        btn.addEventListener(
            "click",
            registrarMiembro
        );

        const btnHuella =
            document.getElementById(
                "btnHuella"
            );

        if (btnHuella) {

            btnHuella.addEventListener(
                "click",
                registrarHuella
            );

        }

        // NFC SIEMPRE
        iniciarLectorNFC();

    }
);