document.addEventListener("DOMContentLoaded", () => {

    console.log("registrar.js cargado");

    const form = document.getElementById("formMiembro");

    if (!form) {
        console.error("Formulario no encontrado");
        return;
    }

    // 🔥 función segura
    const getValue = (id) => {
        const el = document.getElementById(id);

        if (!el) {
            console.error("No existe el elemento:", id);
            return "";
        }

        return el.value.trim();
    };

    // (opcional) huella simulada
    let huellaCapturada = false;

    const btnHuella = document.getElementById("btnHuella");
    const estadoHuella = document.getElementById("estadoHuella");

    btnHuella?.addEventListener("click", () => {
        huellaCapturada = true;
        estadoHuella.textContent = "Huella registrada";
    });

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const miembro = {
            nombres: getValue("nombres"),
            apellidoPaterno: getValue("apellidoPaterno"),
            apellidoMaterno: getValue("apellidoMaterno"),
            telefono: getValue("telefono"),
            correo: getValue("correo"),
            fechaNacimiento: document.getElementById("fechaNacimiento").value,
            huella: huellaCapturada
        };

        console.log("Datos enviados:", miembro);

        // 🔴 validación básica (para que no mandes basura)
        if (!miembro.nombres || !miembro.apellidoPaterno || !miembro.fechaNacimiento) {
            alert("Faltan datos obligatorios");
            return;
        }

        try {

            const res = await fetch("http://127.0.0.1:3000/api/miembros", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(miembro)
            });

            const data = await res.json().catch(() => null);

            console.log("Respuesta servidor:", res.status, data);

            if (res.ok) {

                alert("Miembro registrado correctamente");
                form.reset();

                // reset huella
                huellaCapturada = false;
                if (estadoHuella) {
                    estadoHuella.textContent = "No registrada";
                }

            } else {

                alert("Error: " + (data?.error || "Error desconocido"));

            }

        } catch (err) {

            console.error("Error fetch:", err);
            alert("No se pudo conectar con el servidor");

        }

    });

});