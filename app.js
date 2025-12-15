// ==============================
// PROYECTO 2.0 – app.js
// Render dinámico desde JSON
// ==============================

const contenedorRegiones = document.getElementById("contenedor-regiones");
const totalProyectosSpan = document.getElementById("total-proyectos");
const buscador = document.getElementById("buscador");

let datosGlobales = [];
let proyectosPlanos = [];

// ==============================
// CARGA DE DATOS
// ==============================
async function cargarDatos() {
  try {
    const response = await fetch("proyectos.json");
    if (!response.ok) throw new Error("No se pudo cargar el JSON");

    datosGlobales = await response.json();
    prepararProyectosPlanos(datosGlobales);
    renderizar(datosGlobales);
  } catch (error) {
    console.error("Error cargando datos:", error);
    contenedorRegiones.innerHTML = `
      <div class="text-sm text-red-500">
        Error al cargar los proyectos.
      </div>
    `;
  }
}

// ==============================
// APLANAR PROYECTOS (para búsqueda)
// ==============================
function prepararProyectosPlanos(data) {
  proyectosPlanos = [];

  data.forEach(region => {
    region.proyectos.forEach(p => {
      proyectosPlanos.push({
        ...p,
        region: region.region
      });
    });
  });

  totalProyectosSpan.textContent = `${proyectosPlanos.length} Totales`;
}

// ==============================
// RENDER PRINCIPAL
// ==============================
function renderizar(data) {
  contenedorRegiones.innerHTML = "";

  data.forEach(region => {
    const regionHTML = document.createElement("details");
    regionHTML.className =
      "bg-white dark:bg-slate-800 rounded-xl border shadow-sm overflow-hidden";

    regionHTML.innerHTML = `
      <summary class="flex justify-between items-center px-4 py-3 cursor-pointer">
        <span class="font-bold">${region.region}</span>
        <span class="text-xs text-slate-500">${region.proyectos.length} proyectos</span>
      </summary>

      <div class="flex flex-col gap-3 px-4 pb-4">
        ${region.proyectos.map(proyecto => tarjetaProyecto(proyecto)).join("")}
      </div>
    `;

    contenedorRegiones.appendChild(regionHTML);
  });
}

// ==============================
// TARJETA DE PROYECTO
// ==============================
function tarjetaProyecto(p) {
  return `
    <div class="flex gap-3 items-center bg-background-light dark:bg-slate-900 rounded-xl p-3 border">
      
      <img src="${p.imagen || "https://via.placeholder.com/80"}"
           alt="${p.titulo}"
           class="size-16 rounded-lg object-cover border"/>

      <div class="flex-1">
        <h4 class="font-bold text-sm">${p.titulo}</h4>
        <p class="text-xs text-slate-500">${p.pais} · ${p.categoria}</p>

        <div class="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-primary"
               style="width:${p.progreso || 0}%"></div>
        </div>
      </div>

      <span class="text-xs font-bold text-primary">${p.estado}</span>
    </div>
  `;
}

// ==============================
// BUSCADOR
// ==============================
buscador.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  if (!texto) {
    renderizar(datosGlobales);
    return;
  }

  const filtrados = proyectosPlanos.filter(p =>
    p.titulo.toLowerCase().includes(texto) ||
    p.pais.toLowerCase().includes(texto) ||
    p.id.toLowerCase().includes(texto)
  );

  reconstruirDesdeBusqueda(filtrados);
});

// ==============================
// RECONSTRUIR POR REGIÓN
// ==============================
function reconstruirDesdeBusqueda(lista) {
  const mapa = {};

  lista.forEach(p => {
    if (!mapa[p.region]) mapa[p.region] = [];
    mapa[p.region].push(p);
  });

  const nuevoFormato = Object.keys(mapa).map(region => ({
    region,
    proyectos: mapa[region]
  }));

  renderizar(nuevoFormato);
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", cargarDatos);
