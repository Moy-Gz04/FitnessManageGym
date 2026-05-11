(function () {
  const API_URL = "http://localhost:3000";

  /* ==========================
     CARGA INMEDIATA LOCAL
  ========================== */
  const localConfig = localStorage.getItem("gym_config");

  if (localConfig) {
    try {
      const config = JSON.parse(localConfig);
      aplicarTema(config);
    } catch (error) {
      console.error("Error leyendo configuración local:", error);
    }
  }

  /* ==========================
     SINCRONIZAR CON BACKEND
  ========================== */
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch(`${API_URL}/configuracion`);
      const config = await res.json();

      if (config) {
        localStorage.setItem("gym_config", JSON.stringify(config));
        aplicarTema(config);
      }

    } catch (error) {
      console.error("Error cargando configuración global:", error);
    }
  });

  /* ==========================
     APLICAR TEMA GLOBAL
  ========================== */
  function aplicarTema(config) {
    if (!config) return;

    const root = document.documentElement;

    /* COLORES PRINCIPALES */
    root.style.setProperty("--color-primario", config.color_primario || "#0d6efd");
    root.style.setProperty("--color-secundario", config.color_secundario || "#6c757d");
    root.style.setProperty("--color-acento", config.color_acento || config.color_primario || "#20c997");

    /* FONDOS */
    root.style.setProperty("--color-fondo", config.color_fondo || "#f8f9fa");
    root.style.setProperty("--color-superficie", config.color_superficie || "#ffffff");
    root.style.setProperty("--color-sidebar", config.color_sidebar || "#1e293b");

    /* TEXTO */
    const texto = config.color_texto || obtenerColorContraste(config.color_fondo);
root.style.setProperty("--color-texto", texto);
    root.style.setProperty("--color-texto-secundario", config.color_texto_secundario || "#6c757d");
    const textoSidebar = obtenerColorContraste(config.color_sidebar);
root.style.setProperty("--color-texto-sidebar", textoSidebar);

    /* BOTONES Y ESTADOS */
    root.style.setProperty("--color-boton", config.color_boton_primario || "#0d6efd");
    root.style.setProperty("--color-exito", config.color_exito || "#198754");
    root.style.setProperty("--color-error", config.color_error || "#dc3545");
    root.style.setProperty("--color-alerta", config.color_alerta || "#ffc107");
    root.style.setProperty("--color-info", config.color_info || "#0dcaf0");

    /* ==========================
       FONDO PERSONALIZADO
    ========================== */
    if (config.fondo_url) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('${config.fondo_url}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
    } else {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = config.color_fondo || "#f8f9fa";
    }

    /* ==========================
       MODO OSCURO
    ========================== */
    if (config.modo_oscuro) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    /* ==========================
       LOGO GLOBAL DINÁMICO
    ========================== */
    const logo = document.getElementById("gymLogo");
    if (logo && config.logo_url) {
      logo.src = config.logo_url;
    }

    /* ==========================
       NOMBRE GLOBAL DINÁMICO
    ========================== */
    const gymNombre = document.getElementById("gymNombre");
    if (gymNombre) {
      gymNombre.textContent = config.nombre_gym || "GYMASIO";
    }
  }
})();

function obtenerColorContraste(hex) {
  if (!hex) return "#000";

  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminancia > 0.5 ? "#000000" : "#ffffff";
}