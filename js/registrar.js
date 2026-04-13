function registrarMiembro() {

    console.log("CLICK FUNCIONANDO");

    const datos = {
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidoPaterno").value + " " +
                   document.getElementById("apellidoMaterno").value,
        email: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value,
        huella_id: null
    };

    console.log("DATOS:", datos);

    fetch("http://localhost:3000/miembros", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
    .then(res => {
        console.log("STATUS:", res.status);
        if (!res.ok) throw new Error("Error servidor");
        return res.json().catch(() => ({}));
    })
    .then(data => {
        console.log("RESPUESTA:", data);
        alert("Miembro registrado correctamente");
        window.location.href = "miembros.html";
    })
    .catch(err => {
        console.error("ERROR:", err);
        alert("Error al registrar");
    });
}