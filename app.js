// ==============================
// PROYECTO 2.0 – app.js
// Render dinámico desde JSON
// ==============================


const contenedor = document.getElementById("contenedor-regiones");
const totalProyectos = document.getElementById("total-proyectos");

async function cargarDatos() {
  try {
    const res = await fetch("proyectos.json");
    if (!res.ok) throw new Error("No se pudo cargar el JSON");
    const data = await res.json();
    renderizar(data);
  } catch (err) {
    contenedor.innerHTML = `
      <div class="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
        No se pudieron cargar los proyectos.
      </div>`;
    console.error(err);
  }
}

function renderizar(data) {
  contenedor.innerHTML = "";
  let contador = 0;

  // Agrupar por continente → país
  const estructura = {};

  data.forEach(item => {
    if (!estructura[item.continente]) {
      estructura[item.continente] = {};
    }
    if (!estructura[item.continente][item.pais]) {
      estructura[item.continente][item.pais] = [];
    }
    estructura[item.continente][item.pais].push(...item.proyectos);
  });

  Object.entries(estructura).forEach(([continente, paises]) => {
    const bloqueContinente = document.createElement("div");
    bloqueContinente.className = "bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4";

    bloqueContinente.innerHTML = `
      <h4 class="font-bold text-lg mb-3">${continente}</h4>
    `;

    Object.entries(paises).forEach(([pais, proyectos]) => {
      const bloquePais = document.createElement("div");
      bloquePais.className = "mb-4";

      bloquePais.innerHTML = `
        <h5 class="font-semibold text-sm mb-2 text-primary">${pais}</h5>
      `;

      proyectos.forEach(proy => {
        contador++;

        const card = document.createElement("details");
        card.className =
          "mb-2 rounded-lg border bg-background-light dark:bg-slate-900 p-3";

        card.innerHTML = `
          <summary class="cursor-pointer font-medium text-sm flex justify-between">
            <span>${proy.nombre}</span>
            <span class="text-xs text-slate-500">${proy.estado}</span>
          </summary>

          <div class="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p><strong>Sector:</strong> ${proy.sector}</p>
            <p><strong>Fecha:</strong> ${proy.fecha}</p>
            <p><strong>Objetivo:</strong> ${proy.objetivo}</p>
            <p><strong>Notas:</strong> ${proy.notas}</p>
          </div>
        `;

        bloquePais.appendChild(card);
      });

      bloqueContinente.appendChild(bloquePais);
    });

    contenedor.appendChild(bloqueContinente);
  });

  totalProyectos.textContent = `${contador} Totales`;
}

document.addEventListener("DOMContentLoaded", cargarDatos);
