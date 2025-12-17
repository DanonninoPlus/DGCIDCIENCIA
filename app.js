/* =========================================================
   app.js
   Proyecto 2.0 — Gestión de Proyectos de Cooperación
   Arquitectura: HTML + JS + JSON (GitHub Pages friendly)
========================================================= */

/* ===============================
   🔹 CONFIGURACIÓN
================================ */

// ⚠️ Cambia esta URL por la RAW de tu JSON cuando lo tengas
const DATA_URL = "proyectos.json";

/* ===============================
   🔹 ESTADO GLOBAL
================================ */

let dataOriginal = [];   // datos completos
let dataFiltrada = [];   // datos filtrados (buscador, etc.)

/* ===============================
   🔹 INIT
================================ */

document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  configurarBuscador();
});

/* ===============================
   🔹 CARGA DE DATOS
================================ */

async function cargarDatos() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Error al cargar el JSON");

    const data = await response.json();

    dataOriginal = data;
    dataFiltrada = data;

    renderRegiones(dataFiltrada);
  } catch (error) {
    console.error("Error:", error);
    mostrarError("No se pudieron cargar los proyectos.");
  }
}

/* ===============================
   🔹 RENDER PRINCIPAL
================================ */

function renderRegiones(regiones) {
  const contenedor = document.getElementById("contenedor-regiones");
  const totalSpan = document.getElementById("total-proyectos");

  contenedor.innerHTML = "";
  let totalProyectos = 0;

  regiones.forEach(region => {
    totalProyectos += region.proyectos.length;
    contenedor.insertAdjacentHTML("beforeend", crearRegion(region));
  });

  totalSpan.textContent = `${totalProyectos} Totales`;
}

/* ===============================
   🔹 TEMPLATE REGIÓN
================================ */

function crearRegion(region) {
  return `
    <details class="group bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
      <summary class="flex items-center justify-between p-4 cursor-pointer">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">public</span>
          <span class="font-bold">${region.region}</span>
        </div>
        <span class="text-xs text-slate-500">
          ${region.proyectos.length} proyectos
        </span>
      </summary>

      <div class="flex flex-col gap-3 px-4 pb-4">
        ${region.proyectos.map(crearProyecto).join("")}
      </div>
    </details>
  `;
}

/* ===============================
   🔹 TEMPLATE PROYECTO
================================ */

function crearProyecto(p) {
  return `
    <div class="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
      
      <img
        src="${p.imagen || "https://via.placeholder.com/80"}"
        alt="${p.titulo}"
        class="size-16 rounded-lg object-cover"
      />

      <div class="flex-1 flex flex-col gap-1">
        <h4 class="font-bold text-sm">${p.titulo}</h4>
        <span class="text-xs text-slate-500">
          ${p.pais} · ${p.categoria}
        </span>

        <div class="flex items-center gap-2 mt-1">
          <div class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary"
              style="width: ${p.progreso}%"
            ></div>
          </div>
          <span class="text-xs font-medium">${p.progreso}%</span>
        </div>

        <span class="text-[11px] mt-1 text-slate-500">
          Estado: <strong>${p.estado}</strong>
        </span>
      </div>
    </div>
  `;
}

/* ===============================
   🔹 BUSCADOR
================================ */

function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input) return;

  input.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase().trim();
    filtrarProyectos(texto);
  });
}

function filtrarProyectos(texto) {
  if (!texto) {
    dataFiltrada = dataOriginal;
    renderRegiones(dataFiltrada);
    return;
  }

  dataFiltrada = dataOriginal
    .map(region => {
      const proyectosFiltrados = region.proyectos.filter(p =>
        p.titulo.toLowerCase().includes(texto) ||
        p.pais.toLowerCase().includes(texto) ||
        (p.id && p.id.toLowerCase().includes(texto))
      );

      return {
        ...region,
        proyectos: proyectosFiltrados
      };
    })
    .filter(region => region.proyectos.length > 0);

  renderRegiones(dataFiltrada);
}

/* ===============================
   🔹 MANEJO DE ERRORES
================================ */

function mostrarError(mensaje) {
  const contenedor = document.getElementById("contenedor-regiones");
  contenedor.innerHTML = `
    <div class="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
      ${mensaje}
    </div>
  `;
}
