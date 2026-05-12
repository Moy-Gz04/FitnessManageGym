async function login() {

    const usuario =
        document.getElementById("usuario").value;

    const password =
        document.getElementById("password").value;

    const mensaje =
        document.getElementById("mensaje");

    try {

        const res = await fetch(
            "http://localhost:3000/login",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    usuario,
                    password
                })

            }
        );

        const data =
            await res.json();

        console.log(data);

        // ERROR
        if (!res.ok) {

            mensaje.innerHTML =
                data.error;

            return;

        }

        // GUARDAR TOKEN
        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
        );

        console.log(
            "TOKEN GUARDADO:",
            localStorage.getItem("token")
        );

        // REDIRECCION
        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(error);

        mensaje.innerHTML =
            "Error conexión servidor";

    }

}