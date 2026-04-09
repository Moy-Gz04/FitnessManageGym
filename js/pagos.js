document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("buscarMiembro");
    const card = document.getElementById("cardUsuario");
    const panel = document.getElementById("panelPago");
    const btnConfirmar = document.getElementById("btnConfirmar");

    let tipoSeleccionado = null;

    // 🔥 USUARIOS SIMULADOS
    const miembros = [
        { id: "001", nombre: "Juan Pérez" },
        { id: "002", nombre: "Carlos López" },
        { id: "003", nombre: "María Hernández" },
        { id: "004", nombre: "Luis García" }
    ];

    // 🔍 BUSCADOR
    input.addEventListener("input", () => {

        const texto = input.value.toLowerCase();

        const encontrado = miembros.find(m =>
            m.nombre.toLowerCase().includes(texto)
        );

        if (encontrado) {

            document.getElementById("nombreCompleto").innerText = encontrado.nombre;
            document.getElementById("idUsuario").innerText = encontrado.id;

            card.classList.remove("d-none");
            panel.classList.remove("d-none");

            activarEventosPago(); // 👈 IMPORTANTE

        } else {

            card.classList.add("d-none");
            panel.classList.add("d-none");

            resetPago();

        }

    });

    // 🎯 ACTIVAR BOTONES DE PAGO
    function activarEventosPago() {

        const botonesPago = document.querySelectorAll(".btn-pago");

        botonesPago.forEach(btn => {

            btn.onclick = () => {

                // Quitar selección previa
                botonesPago.forEach(b => b.classList.remove("active"));

                // Activar el actual
                btn.classList.add("active");

                tipoSeleccionado = btn.dataset.tipo;

                // Activar botón confirmar
                btnConfirmar.disabled = false;
                btnConfirmar.classList.add("enabled");

            };

        });

    }

    // 🔄 RESET SI CAMBIA EL USUARIO
    function resetPago() {

        tipoSeleccionado = null;

        const botonesPago = document.querySelectorAll(".btn-pago");
        botonesPago.forEach(b => b.classList.remove("active"));

        btnConfirmar.disabled = true;
        btnConfirmar.classList.remove("enabled");

    }

    // ✅ CONFIRMAR PAGO
    btnConfirmar.addEventListener("click", () => {

        if (!tipoSeleccionado) return;

        alert("Pago registrado: " + tipoSeleccionado);

    });

});