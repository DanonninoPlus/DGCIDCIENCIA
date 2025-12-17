// ==============================
// PROYECTO 2.0 – app.js
// Render dinámico desde JSON
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  renderRegiones(dataMock);
});

/* ===============================
   🔹 DATOS TEMPORALES (mock)
   Luego esto vendrá de JSON
================================ */

const dataMock = [
  {
    region: "Sudamérica",
    proyectos: [
      {
        titulo: "Iniciativa Agua Limpia",
        pais: "Perú",
        categoria: "Infraestructura",
        estado: "Activo",
        progreso: 75,
        imagen: "https://via.placeholder.com/80"
      },
      {
        titulo: "Educación Digital Rural",
        pais: "Bolivia",
        categoria: "Educación",
        estado: "Planeación",
        progreso: 40,
        imagen: "https://via.placeholder.com/80"
      }
    ]
  },
  {
    region: "África Subsahariana",
    proyectos: [
      {
        titulo: "Salud Comunitaria",
        pais: "Kenia",
        categoria: "Salud",
        estado: "Activo",
        progreso: 60,
        imagen: "https://via.placeholder.com/80"
      }
    ]
  }
];

/* ===============================
   🔹 RENDER GENERAL
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
   🔹 TEMPLATE PROYECTO (CARD)
================================ */

function crearProyecto(p) {
  return `
    <div class="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
      
      <img
        src="${p.imagen}"
        alt="${p.titulo}"
        class="size-16 rounded-lg object-cover"
      />

      <div class="flex-1 flex flex-col gap-1">
        <h4 class="font-bold text-sm">${p.titulo}</h4>
        <span class="text-xs text-slate-500">${p.pais} · ${p.categoria}</span>

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



