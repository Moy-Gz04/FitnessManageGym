fetch("http://localhost:3000/miembros")
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById("listaMiembros");

    contenedor.innerHTML = "";

    data.forEach(m => {
      contenedor.innerHTML += `
        <div>
          <h3>${m.nombre} ${m.apellidos}</h3>
          <p>Email: ${m.email}</p>
          <p>Teléfono: ${m.telefono}</p>
        </div>
      `;
    });
  });