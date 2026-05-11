const API_URL = "http://localhost:3000";

let temas = [];

// ==============================
// CARGAR TEMAS DISPONIBLES
// ==============================
async function cargarTemas() {
  try {
    const res = await fetch(`${API_URL}/temas`);
    temas = await res.json();

    const temaSelect = document.getElementById("temaSelect");
    temaSelect.innerHTML = "";

    temas.forEach(tema => {
      const option = document.createElement("option");
      option.value = tema.id;
      option.textContent = tema.nombre;
      temaSelect.appendChild(option);
    });

    temaSelect.addEventListener("change", () => {
  previewTema();

  const temaId = parseInt(temaSelect.value);
  const tema = temas.find(t => t.id === temaId);

  if (tema) {
    document.getElementById("preview").style.borderColor =
      tema.color_primario;
  }
});

  } catch (error) {
    console.error("Error cargando temas:", error);
  }
}

// ==============================
// CARGAR CONFIGURACIÓN ACTUAL
// ==============================
async function cargarConfiguracion() {
  try {
    const res = await fetch(`${API_URL}/configuracion`);
    const config = await res.json();

    document.getElementById("nombreGym").value = config.nombre_gym || "";
    document.getElementById("logoUrl").value = config.logo_url || "";
    document.getElementById("fondoUrl").value = config.fondo_url || "";
    document.getElementById("temaSelect").value = config.tema_id;
    document.getElementById("modoOscuro").checked = config.modo_oscuro;

    aplicarTema(config);
    previewTema();

    // Fondo actual
    if (config.fondo_url) {
      document.body.style.backgroundImage = `url('${config.fondo_url}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }

    // Modo oscuro
    if (config.modo_oscuro) {
      document.body.classList.add("dark-mode");
    }

  } catch (error) {
    console.error("Error cargando configuración:", error);
  }

  // 🔥 FORZAR ACTUALIZACIÓN VISUAL
previewTema();

// 🔥 FORZAR EVENTO CHANGE
document.getElementById("temaSelect").dispatchEvent(new Event("change"));
}

// ==============================
// PREVIEW DEL TEMA
// ==============================
function previewTema() {
  const temaId = parseInt(document.getElementById("temaSelect").value);
  const tema = temas.find(t => t.id === temaId);

  if (tema) {
    aplicarTema(tema);
    document.getElementById("temaActual").textContent =
  `Tema actual: ${tema.nombre}`;

    // Quitar selección previa
    document.querySelectorAll(".tema-card").forEach(card => {
      card.classList.remove("active");
    });

    // Activar seleccionada
    const activeCard = document.querySelector(
      `.tema-card[data-id="${temaId}"]`
    );

    if (activeCard) {
      activeCard.classList.add("active");
    }

    // Mejorar borde preview
    document.getElementById("preview").style.borderColor =
      tema.color_primario;
  }
}

// ==============================
// APLICAR ESTILOS
// ==============================
function aplicarTema(config) {
  document.documentElement.style.setProperty("--color-primario", config.color_primario);
  document.documentElement.style.setProperty("--color-secundario", config.color_secundario);
  document.documentElement.style.setProperty("--color-acento", config.color_acento || config.color_primario);
  document.documentElement.style.setProperty("--color-fondo", config.color_fondo);
  document.documentElement.style.setProperty("--color-superficie", config.color_superficie);
  document.documentElement.style.setProperty("--color-texto", config.color_texto);
  document.documentElement.style.setProperty("--color-texto-secundario", config.color_texto_secundario || config.color_secundario);
  document.documentElement.style.setProperty("--color-sidebar", config.color_sidebar || config.color_primario);
  document.documentElement.style.setProperty("--color-header", config.color_header || config.color_superficie);
  document.documentElement.style.setProperty("--color-boton", config.color_boton_primario);
  document.documentElement.style.setProperty("--color-exito", config.color_exito || "#198754");
  document.documentElement.style.setProperty("--color-error", config.color_error || "#dc3545");
  document.documentElement.style.setProperty("--color-alerta", config.color_alerta || "#ffc107");
  document.documentElement.style.setProperty("--color-info", config.color_info || "#0dcaf0");
}

// ==============================
// GUARDAR CONFIGURACIÓN
// ==============================
async function guardarConfiguracion() {
  try {
    let logoUrl = document.getElementById("logoUrl").value;
    let fondoUrl = document.getElementById("fondoUrl").value;

    const logoFile = document.getElementById("logoFile").files[0];
    const fondoFile = document.getElementById("fondoFile").files[0];

    // ==========================
    // SUBIR ARCHIVOS SI EXISTEN
    // ==========================
    if (logoFile || fondoFile) {
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (fondoFile) {
        formData.append("fondo", fondoFile);
      }

      const uploadRes = await fetch(`${API_URL}/upload-config`, {
        method: "POST",
        body: formData
      });

      const uploadResult = await uploadRes.json();

      if (!uploadResult.ok) {
        throw new Error(uploadResult.error || "Error subiendo imágenes");
      }

      // Construir URLs completas
      if (uploadResult.logo_url) {
        logoUrl = `${API_URL}${uploadResult.logo_url}`;
      }

      if (uploadResult.fondo_url) {
        fondoUrl = `${API_URL}${uploadResult.fondo_url}`;
      }
    }

    // ==========================
    // GUARDAR CONFIG GENERAL
    // ==========================
    const data = {
      nombre_gym: document.getElementById("nombreGym").value,
      logo_url: logoUrl,
      fondo_url: fondoUrl,
      tema_id: parseInt(document.getElementById("temaSelect").value),
      modo_oscuro: document.getElementById("modoOscuro").checked
    };

    const res = await fetch(`${API_URL}/configuracion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.ok || result.mensaje) {
      mostrarToast("Configuración guardada correctamente");

      // Tema inmediato
      const temaSeleccionado = temas.find(t => t.id === data.tema_id);

      if (temaSeleccionado) {
        aplicarTema(temaSeleccionado);
      }

      // Preview nombre
      document.getElementById("previewNombre").textContent =
        data.nombre_gym || "GYMASIO";

      // Preview logo
      const previewLogo = document.getElementById("previewLogo");

      if (logoUrl) {
        previewLogo.src = logoUrl;
        previewLogo.style.display = "block";
      }

      // Fondo inmediato
      if (fondoUrl) {
        document.body.style.backgroundImage = `url('${fondoUrl}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
      } else {
        document.body.style.backgroundImage = "none";
      }

      // Modo oscuro
      if (data.modo_oscuro) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }

    } else {
      mostrarToast("No se pudo guardar configuración", "error");
    }

  } catch (error) {
    console.error("Error guardando configuración:", error);
    mostrarToast(error.message || "Error al guardar configuración", "error");
  }
}



// ==============================
// RESTAURAR CONFIGURACIÓN
// ==============================
async function restaurarConfiguracion() {

    const confirmar = confirm(
  "¿Seguro que deseas restaurar la configuración predeterminada? Esto eliminará logo, fondo y tema personalizado."
);

if (!confirmar) return;
  try {
    const configDefault = {
      nombre_gym: "GYMASIO",
      logo_url: "",
      fondo_url: "",
      tema_id: 1,
      modo_oscuro: false
    };

    const res = await fetch(`${API_URL}/configuracion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(configDefault)
    });

    const result = await res.json();

    if (result.ok || result.mensaje) {
      mostrarToast("Configuración restaurada correctamente");

      // Reset inputs
      document.getElementById("nombreGym").value = configDefault.nombre_gym;
      document.getElementById("logoUrl").value = "";
      document.getElementById("fondoUrl").value = "";
      document.getElementById("temaSelect").value = "1";
      document.getElementById("modoOscuro").checked = false;

      // Limpiar files
      document.getElementById("logoFile").value = "";
      document.getElementById("fondoFile").value = "";

      // Aplicar tema default
      const temaDefault = temas.find(t => t.id === 1);

      if (temaDefault) {
        aplicarTema(temaDefault);
      }

      // Reset preview
      document.getElementById("previewNombre").textContent = "GYMASIO";
      document.getElementById("temaActual").textContent =
  "Tema actual: Ocean Blue";

      const previewLogo = document.getElementById("previewLogo");
      previewLogo.src = "";
      previewLogo.style.display = "none";

      // Limpiar fondo
      document.body.style.backgroundImage = "none";

      // Modo oscuro off
      document.body.classList.remove("dark-mode");

    } else {
      mostrarToast("No se pudo restaurar configuración", "error");
    }

  } catch (error) {
    console.error("Error restaurando configuración:", error);
    mostrarToast("Error restaurando configuración", "error");
  }

  if (typeof cargarSidebar === "function") {
  cargarSidebar();
}
}

// ==============================
// EVENTOS
// ==============================
document.getElementById("guardarBtn").addEventListener("click", guardarConfiguracion);
document.getElementById("resetBtn").addEventListener("click", restaurarConfiguracion);

// ==============================
// PREVIEW NOMBRE EN TIEMPO REAL
// ==============================
document.getElementById("nombreGym").addEventListener("input", (e) => {
  const previewNombre = document.getElementById("previewNombre");

  previewNombre.textContent = e.target.value || "GYMASIO";
});

// ==============================
// PREVIEW LOGO LOCAL
// ==============================
document.getElementById("logoFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const previewLogo = document.getElementById("previewLogo");

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    previewLogo.src = event.target.result;
    previewLogo.style.display = "block";
  };

  reader.readAsDataURL(file);
});

// ==============================
// PREVIEW LOGO POR URL
// ==============================
document.getElementById("logoUrl").addEventListener("input", (e) => {
  const previewLogo = document.getElementById("previewLogo");

  if (e.target.value.trim()) {
    previewLogo.src = e.target.value.trim();
    previewLogo.style.display = "block";
  }
});

// ==============================
// PREVIEW FONDO LOCAL
// ==============================
document.getElementById("fondoFile").addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    document.body.style.backgroundImage = `url('${event.target.result}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  };

  reader.readAsDataURL(file);
});

// ==============================
// PREVIEW FONDO POR URL
// ==============================
document.getElementById("fondoUrl").addEventListener("input", (e) => {
  const url = e.target.value.trim();

  if (url) {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  } else {
    document.body.style.backgroundImage = "none";
  }
});

// ==============================
// INICIO
// ==============================
(async function init() {
  await cargarTemas();
  await cargarConfiguracion();
})();

// ==============================
// TOAST VISUAL
// ==============================
function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = mensaje;

  // Tipo visual
  if (tipo === "error") {
    toast.style.background = "var(--color-error)";
  } else {
    toast.style.background = "var(--color-exito)";
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}