/* =========================================================
   app.js
   Proyecto 2.1 — Gestión de Proyectos de Cooperación
   HTML + JS + JSON (GitHub Pages friendly)
========================================================= */

const DATA_URL = "proyectos.json";

let dataOriginal = [];
let dataFiltrada = [];

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  configurarBuscador();
});

/* ===============================
   CARGA DE DATOS
================================ */
async function cargarDatos() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error("Error al cargar JSON");

    const data = await res.json();
    dataOriginal = data;
    dataFiltrada = data;

    renderizar(dataFiltrada);
  } catch (err) {
    console.error(err);
    mostrarError("No se pudieron cargar los proyectos.");
  }
}

/* ===============================
   RENDER GENERAL
================================ */
function renderizar(regiones) {
  const contenedor = document.getElementById("contenedor-regiones");
  const totalSpan = document.getElementById("total-proyectos");

  contenedor.innerHTML = "";
  let totalGlobal = 0;

  regiones.forEach(region => {
    totalGlobal += region.proyectos.length;
    contenedor.appendChild(crearContinente(region));
  });

  totalSpan.textContent = `${totalGlobal} Totales`;
}

/* ===============================
   CONTINENTE
================================ */
function crearContinente(region) {
  const proyectosPorPais = agruparPorPais(region.proyectos);

  const details = document.createElement("details");
  details.className =
    "bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden";

  details.innerHTML = `
    <summary class="flex items-center justify-between p-4 cursor-pointer">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">public</span>
        <span class="font-bold">${region.region}</span>
      </div>
      <span class="text-xs text-slate-500">
        ${region.proyectos.length} proyectos
      </span>
    </summary>
  `;

  const contenedorPaises = document.createElement("div");
  contenedorPaises.className = "flex flex-col gap-3 px-4 pb-4";

  Object.entries(proyectosPorPais).forEach(([pais, proyectos]) => {
    contenedorPaises.appendChild(crearPais(pais, proyectos));
  });

  details.appendChild(contenedorPaises);
  return details;
}

/* ===============================
   PAÍS
================================ */
function crearPais(pais, proyectos) {
  const details = document.createElement("details");
  details.className = "ml-2 rounded-xl border bg-slate-50 dark:bg-slate-900";

  details.innerHTML = `
    <summary class="flex justify-between items-center p-3 cursor-pointer">
      <span class="font-semibold text-sm">${pais}</span>
      <span class="text-xs text-slate-500">
        ${proyectos.length}
      </span>
    </summary>
  `;

  const contenedorProyectos = document.createElement("div");
  contenedorProyectos.className = "flex flex-col gap-2 px-3 pb-3";

  proyectos.forEach(p => {
    contenedorProyectos.appendChild(crearProyecto(p));
  });

  details.appendChild(contenedorProyectos);
  return details;
}

/* ===============================
   PROYECTO
================================ */
function crearProyecto(p) {
  const details = document.createElement("details");
  details.className =
    "ml-2 rounded-lg border bg-white dark:bg-slate-800 p-3";

  details.innerHTML = `
    <summary class="cursor-pointer flex justify-between items-center mb-2">
      <span class="font-medium text-sm">${p.titulo}</span>
      <span class="text-[11px] font-semibold ${claseEstado(p.estado)}">
  ${p.estado}
</span>

    </summary>

    <!-- CONTENIDO -->
    <div class="flex gap-3">
      
      <!-- IMAGEN -->
      <img
        src="${p.imagen || "https://via.placeholder.com/80"}"
        alt="${p.titulo}"
        class="size-16 rounded-lg object-cover flex-shrink-0"
      />

      <!-- INFO -->
      <div class="flex-1 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <p><strong>Sector:</strong> ${p.sector}</p>
        <p><strong>Fecha:</strong> ${p.fecha}</p>
        <p><strong>Objetivo:</strong> ${p.objetivo}</p>
        <p><strong>Notas:</strong> ${p.notas}</p>

        <p class="mt-1"><strong>Avance:</strong> ${p.progreso}%</p>

        <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all"
            style="width: ${p.progreso}%"
          ></div>
        </div>
      </div>
    </div>
  `;

  return details;
}

/* ===============================
   UTILIDADES
================================ */
function agruparPorPais(proyectos) {
  return proyectos.reduce((acc, p) => {
    if (!acc[p.pais]) acc[p.pais] = [];
    acc[p.pais].push(p);
    return acc;
  }, {});
}

function claseEstado(estado) {
  switch (estado) {
    case "Finalizado":
      return "text-red-500";
    case "Planeación":
      return "text-blue-500";
    case "En ejecución":
      return "text-green-500";
    default:
      return "text-slate-500";
  }
}


/* ===============================
   BUSCADOR
================================ */
function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input) return;

  input.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase().trim();
    filtrar(texto);
  });
}

function filtrar(texto) {
  if (!texto) {
    dataFiltrada = dataOriginal;
    renderizar(dataFiltrada);
    return;
  }

  dataFiltrada = dataOriginal
    .map(region => {
      const proyectos = region.proyectos.filter(p =>
        p.titulo.toLowerCase().includes(texto) ||
        p.pais.toLowerCase().includes(texto) ||
        (p.id && p.id.toLowerCase().includes(texto))
      );
      return { ...region, proyectos };
    })
    .filter(region => region.proyectos.length > 0);

  renderizar(dataFiltrada);
}

/* ===============================
   ERRORES
================================ */
function mostrarError(msg) {
  document.getElementById("contenedor-regiones").innerHTML = `
    <div class="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
      ${msg}
    </div>
  `;
}




