let miembros = [];
let miembroSeleccionado = null;
let tipoPago = null;

// =============================
// 🔹 CARGAR MIEMBROS
// =============================
async function cargarMiembros() {
    try {
        const res = await fetch("http://localhost:3000/miembros");

        if (!res.ok) throw new Error("Error al cargar miembros");

        miembros = await res.json();

        console.log("MIEMBROS:", miembros);

    } catch (error) {
        console.error("Error:", error);
    }
}

cargarMiembros();


// =============================
// 🔍 BUSCADOR
// =============================
document.getElementById("buscarMiembro").addEventListener("input", (e) => {

    const texto = e.target.value.toLowerCase();
    const lista = document.getElementById("listaMiembros");

    lista.innerHTML = "";

    if (texto.length < 2) return;

    const filtrados = miembros.filter(m =>
        (m.nombres + " " + m.apellidos).toLowerCase().includes(texto)
    );

    filtrados.forEach(m => {

        lista.innerHTML += `
            <div class="p-2 border mb-1 item-miembro" data-id="${m.id}" style="cursor:pointer;">
                ${m.nombres} ${m.apellidos}
            </div>
        `;
    });

});


// =============================
// 🎯 SELECCIONAR MIEMBRO
// =============================
document.getElementById("listaMiembros").addEventListener("click", (e) => {

    if (!e.target.classList.contains("item-miembro")) return;

    const id = e.target.dataset.id;

    const m = miembros.find(x => x.id == id);

    if (!m) return;

    miembroSeleccionado = m;

    console.log("MIEMBRO SELECCIONADO:", m);

    document.getElementById("cardUsuario").classList.remove("d-none");

    document.getElementById("nombreCompleto").textContent =
        m.nombres + " " + m.apellidos;

    document.getElementById("idUsuario").textContent = m.id;

    // limpiar lista
    document.getElementById("listaMiembros").innerHTML = "";
    document.getElementById("buscarMiembro").value = m.nombres;
});


// =============================
// 💰 SELECCIONAR TIPO DE PAGO
// =============================
document.querySelectorAll(".btn-pago").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".btn-pago")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        tipoPago = btn.dataset.tipo;

        console.log("TIPO SELECCIONADO:", tipoPago);

        validarFormulario();
    });

});


// =============================
// ✅ VALIDAR SI SE PUEDE CONFIRMAR
// =============================
function validarFormulario() {

    const btn = document.getElementById("btnConfirmar");

    if (miembroSeleccionado && tipoPago) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}


// =============================
// 🚀 CONFIRMAR PAGO
// =============================
document.getElementById("btnConfirmar").addEventListener("click", async () => {

    if (!miembroSeleccionado || !tipoPago) {
        alert("Selecciona miembro y tipo de pago");
        return;
    }

    console.log("ENVIANDO:", {
        miembro_id: miembroSeleccionado.id,
        tipo: tipoPago
    });

    try {

        const res = await fetch("http://localhost:3000/pagos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                miembro_id: miembroSeleccionado.id,
                tipo: tipoPago
            })
        });

        const data = await res.json().catch(() => ({}));

        console.log("RESPUESTA:", data);

        if (!res.ok) {
            throw new Error(data.error || "Error en servidor");
        }

        alert(`Pago registrado\nMonto: $${data.monto || ""}\nDías: ${data.dias || ""}`);

        // 🔄 RESET UI
        miembroSeleccionado = null;
        tipoPago = null;

        document.getElementById("cardUsuario").classList.add("d-none");
        document.getElementById("buscarMiembro").value = "";
        document.getElementById("listaMiembros").innerHTML = "";

        document.querySelectorAll(".btn-pago")
            .forEach(b => b.classList.remove("active"));

        validarFormulario();

    } catch (error) {
        console.error("ERROR:", error);
        alert("Error al registrar pago");
    }

});