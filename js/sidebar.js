const sidebarContainer = document.getElementById("sidebar-container");

async function cargarSidebar() {
    try {
        // Configuración global
        const configRes = await fetch("http://localhost:3000/configuracion");
        const config = await configRes.json();

        // Detectar página actual
        const currentPage = window.location.pathname.split("/").pop();

        sidebarContainer.innerHTML = `
            <div class="sidebar">

                <div class="logo-container">
                    <img 
                        id="gymLogo"
                        src="${config.logo_url || 'https://via.placeholder.com/160'}" 
                        alt="Logo Gym"
                    >

                    <h3 id="gymNombre">
                        ${config.nombre_gym || "GYMASIO"}
                    </h3>
                </div>

                <nav class="menu">

    <a href="index.html" class="menu-item ${currentPage === "index.html" ? "active" : ""}">
        📊 Dashboard
    </a>

    <a href="registrar.html" class="menu-item ${currentPage === "registrar.html" ? "active" : ""}">
        👤 Registrar Miembro
    </a>

    <a href="miembros.html" class="menu-item ${currentPage === "miembros.html" ? "active" : ""}">
        🧾 Miembros
    </a>

    <a href="pagos.html" class="menu-item ${currentPage === "pagos.html" ? "active" : ""}">
        💳 Pagos
    </a>

    <a href="configuracion.html" class="menu-item ${currentPage === "configuracion.html" ? "active" : ""}">
        🎨 Configuración
    </a>

</nav>

            </div>
        `;

    } catch (error) {
        console.error("Error cargando sidebar:", error);
    }
}

cargarSidebar();