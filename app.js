// app.js - Versión Gestión Unificada Corregida (DGCIDCIENCIA)
const LS_KEY = "dg_proyectos_v2";

// DOM Elements
const projectList = document.getElementById("projectList");
const searchInput = document.getElementById("searchInput");
const filterResponsible = document.getElementById("filterResponsible");
const filterStatus = document.getElementById("filterStatus");
const btnAddProject = document.getElementById("btnAddProject");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const projectForm = document.getElementById("projectForm");
const btnExportPDF = document.getElementById("btnExportPDF");
const btnExportXLS = document.getElementById("btnExportXLS");
const btnImportJSON = document.getElementById("btnImportJSON");
const printArea = document.getElementById("printArea");

// Form fields
const projId = document.getElementById("projId");
const projNombredelproyecto = document.getElementById("projNombredelproyecto");
const projSector = document.getElementById("projSector");
const projPais = document.getElementById("projPais");
const projContinente = document.getElementById("projContinente");
const projFechadeinicio = document.getElementById("projFechadeinicio");
const projFechadetermino = document.getElementById("projFechadetermino");
const projStatus = document.getElementById("projStatus");
const projObjetivo = document.getElementById("projObjetivo");
const projNotas = document.getElementById("projNotas");

let proyectos = [];
let normatecaDocs = [];
const PAISES_CON_SUBTIPO = ["Japón", "Chile", "Estados Unidos", "Noruega"];
const CAMPO_SUBTIPO = "Tipo de proyecto";

/* ============================================================
   🔵 1. CARGA DE DATOS
   ============================================================*/
async function loadFromJsonUrl() {
  try {
    const url = "https://raw.githubusercontent.com/DanonninoPlus/DGCIDCIENCIA/main/proyectos.json";
    const res = await fetch(url);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { return []; }
}

async function loadnormatecaFromJsonUrl() {
  try {
    const url = "https://raw.githubusercontent.com/DanonninoPlus/DGCIDCIENCIA/main/normateca.json";
    const res = await fetch(url);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { return []; }
}

function loadFromStorage() {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveToStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(proyectos));
  populateResponsibles();
}

async function init() {
  const proyectosGithub = await loadFromJsonUrl();
  if (proyectosGithub.length > 0) {
    proyectos = proyectosGithub;
    saveToStorage();
  } else {
    proyectos = loadFromStorage();
  }
  normatecaDocs = await loadnormatecaFromJsonUrl();
  renderList();
  populateResponsibles();
  attachEvents();
}
init();

/* ============================================================
   🔵 2. HELPERS
   ============================================================*/
function cryptoRandomId() { return Math.random().toString(36).slice(2, 9); }
function escapeHtml(text) {
  if (!text) return "";
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/* ============================================================
   🔵 3. RENDER PROYECTOS
   ============================================================*/
function renderList() {
  const q = searchInput.value.trim().toLowerCase();
  const sectorFilter = filterResponsible.value;
  const statusFilter = filterStatus.value;

  let filtered = proyectos.filter(p => {
    const matchQ = !q || (p.Nombredelproyecto + " " + p.status + " " + p.Pais + " " + p.Continente).toLowerCase().includes(q);
    const matchSector = !sectorFilter || (p.Sector && p.Sector.toUpperCase().includes(sectorFilter.toUpperCase()));
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchQ && matchSector && matchStatus;
  });

  const counterEl = document.getElementById("projectCounter");
  if (counterEl) counterEl.innerHTML = `${filtered.length} Proyectos encontrados`;

  if (filtered.length === 0) {
    projectList.innerHTML = `<div class="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">No se encontraron proyectos</div>`;
    return;
  }

  const grupos = {};
  const conteoContinente = {};
  const conteoPais = {};

  filtered.forEach(p => {
    const c = (p.Continente || "Sin Continente").trim();
    const pais = (p.Pais || "Sin País").trim();
    conteoContinente[c] = (conteoContinente[c] || 0) + 1;
    const clavePais = `${c}|${pais}`;
    conteoPais[clavePais] = (conteoPais[clavePais] || 0) + 1;

    if (!grupos[c]) grupos[c] = {};
    if (PAISES_CON_SUBTIPO.includes(pais)) {
      const subtipo = p[CAMPO_SUBTIPO] || "General";
      if (!grupos[c][pais]) grupos[c][pais] = {};
      if (!grupos[c][pais][subtipo]) grupos[c][pais][subtipo] = [];
      grupos[c][pais][subtipo].push(p);
    } else {
      if (!grupos[c][pais]) grupos[c][pais] = [];
      grupos[c][pais].push(p);
    }
  });

  projectList.innerHTML = "";
  Object.keys(grupos).sort().forEach(continente => {
    const contDiv = document.createElement("div");
    contDiv.className = "mb-4";
    contDiv.innerHTML = `
      <button class="w-full flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 acordeon-btn transition-all active:scale-[0.98]">
        <div class="flex items-center gap-3">
            <span class="text-xl">🌍</span>
            <span class="font-bold text-slate-800 uppercase tracking-tight">${continente} <span class="ml-1 text-indigo-500">(${conteoContinente[continente]})</span></span>
        </div>
        <i class="fas fa-chevron-down text-slate-300 transition-transform duration-300"></i>
      </button>
      <div class="panel hidden mt-2 space-y-3 pl-2 border-l-2 border-indigo-100 ml-4 py-2"></div>`;
    
    const contContent = contDiv.querySelector(".panel");
    Object.keys(grupos[continente]).sort().forEach(pais => {
      const paisDiv = document.createElement("div");
      paisDiv.className = "mb-2";
      paisDiv.innerHTML = `
        <button class="w-full flex items-center gap-2 px-3 py-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 rounded-lg acordeon-btn transition-colors">
          <i class="fas fa-map-marker-alt text-[10px]"></i> ${pais.toUpperCase()} <span class="ml-1 text-emerald-600">(${conteoPais[`${continente}|${pais}`] || 0})</span>
        </button>
        <div class="panel hidden mt-2 space-y-2 pl-3"></div>`;
      
      const paisContent = paisDiv.querySelector(".panel");
      const dataPais = grupos[continente][pais];

      const renderCard = (p) => {
        const statusColors = { 'Planeación': 'bg-indigo-100 text-indigo-700', 'Ejecución': 'bg-emerald-100 text-emerald-700', 'Finalizado': 'bg-slate-100 text-slate-700' };
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-2";
        card.innerHTML = `
          <button class="w-full text-left px-4 py-4 acordeon-btn">
            <div class="flex justify-between items-start gap-3">
                <div class="flex-1">
                    <div class="text-[9px] font-bold uppercase text-slate-400 mb-1">${p.Sector || 'Sin Sector'}</div>
                    <div class="font-bold text-slate-800 text-sm leading-tight">${escapeHtml(p.Nombredelproyecto)}</div>
                </div>
                <span class="px-2 py-1 rounded text-[8px] font-black uppercase ${statusColors[p.status] || 'bg-slate-50 text-slate-500'}">${p.status}</span>
            </div>
          </button>
          <div class="panel hidden px-4 pb-4 border-t bg-slate-50/50 pt-3">
            <div class="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                <div class="bg-white p-2 rounded border border-slate-100"><b>Inicio:</b> ${p.Fechadeinicio || '-'}</div>
                <div class="bg-white p-2 rounded border border-slate-100"><b>Término:</b> ${p.Fechadetermino || '-'}</div>
            </div>
            <p class="text-[11px] text-slate-600 mb-3"><b>Objetivo:</b> ${escapeHtml(p.Objetivo)}</p>
            <div class="flex gap-2">
              <button onclick="openEditModal('${p.id}')" class="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">Editar</button>
              <button onclick="deleteProject('${p.id}')" class="flex-1 py-2 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase">Borrar</button>
            </div>
          </div>`;
        return card;
      };

      if (PAISES_CON_SUBTIPO.includes(pais) && !Array.isArray(dataPais)) {
        Object.keys(dataPais).forEach(sub => {
          const subDiv = document.createElement("div");
          subDiv.innerHTML = `<div class="text-[10px] font-bold text-emerald-600 px-2 mb-1 uppercase tracking-widest">${sub}</div>`;
          const subCont = document.createElement("div");
          dataPais[sub].forEach(p => subCont.appendChild(renderCard(p)));
          subDiv.appendChild(subCont);
          paisContent.appendChild(subDiv);
        });
      } else {
        dataPais.forEach(p => paisContent.appendChild(renderCard(p)));
      }
      contContent.appendChild(paisDiv);
    });
    projectList.appendChild(contDiv);
  });
  attachAccordionEvents();
}

/* ============================================================
   🔵 4. GESTIÓN: FORMACIÓN E INVESTIGACIÓN
   ============================================================*/
function renderCapacitaciones() {
    const contenedor = document.getElementById("capacitacionesList");
    contenedor.innerHTML = "";
    const cursos = [
        { pais: "España", titulo: "Gestión Pública", inst: "INAP", inicio: "Sept", termino: "Nov", dte: "DTE-01", limite: "15 Jul", notas: "Ficha técnica disponible" },
        { pais: "Japón", titulo: "Ciencia y Tecnología", inst: "JICA", inicio: "Oct", termino: "Dic", dte: "DTE-02", limite: "30 Ago", notas: "Convocatoria abierta" }
    ];
    renderGestionAcordeon(cursos, contenedor, 'indigo');
}

function renderPermisos() {
    const contenedor = document.getElementById("permisosList");
    contenedor.innerHTML = "";
    const permisos = [
        { pais: "México", titulo: "Biodiversidad Marina", ejecucion: "2024", instituciones: "UNAM, IPN", dte: "INV-01" },
        { pais: "Noruega", titulo: "Energías Limpias", ejecucion: "2025", instituciones: "Sintef, NTNU", dte: "INV-02" }
    ];
    
    const grupos = {};
    permisos.forEach(p => { if(!grupos[p.pais]) grupos[p.pais] = []; grupos[p.pais].push(p); });

    Object.keys(grupos).forEach(pais => {
        const pDiv = document.createElement("div");
        pDiv.className = "mb-3";
        pDiv.innerHTML = `
            <button class="w-full flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 acordeon-btn">
                <span class="text-xs font-black text-emerald-700 uppercase tracking-widest italic underline">📍 ${pais}</span>
                <i class="fas fa-chevron-down text-slate-300 transition-transform duration-300"></i>
            </button>
            <div class="panel hidden mt-3 space-y-3 pl-2 border-l-2 border-emerald-100 ml-4"></div>`;
        const panel = pDiv.querySelector(".panel");
        grupos[pais].forEach(p => {
            const card = document.createElement("div");
            card.className = "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-3";
            card.innerHTML = `
                <button class="w-full bg-emerald-700 px-5 py-4 text-left flex justify-between items-center acordeon-btn">
                    <h3 class="text-[11px] font-bold text-white uppercase leading-tight flex-1">${p.titulo}</h3>
                    <i class="fas fa-plus text-emerald-200 text-[10px] ml-3 transition-transform duration-300"></i>
                </button>
                <div class="panel hidden p-5 space-y-4 bg-emerald-50/20 text-xs">
                    <div><b class="text-[9px] uppercase text-slate-400 block">Ejecución:</b> ${p.ejecucion}</div>
                    <div><b class="text-[9px] uppercase text-slate-400 block">Instituciones:</b> ${p.instituciones}</div>
                    <div class="text-right text-[9px] text-slate-300 font-bold">DTE: ${p.dte}</div>
                </div>`;
            panel.appendChild(card);
        });
        contenedor.appendChild(pDiv);
    });
    attachAccordionEvents();
}

function renderGestionAcordeon(datos, contenedor, color) {
    const grupos = {};
    datos.forEach(d => { if(!grupos[d.pais]) grupos[d.pais] = []; grupos[d.pais].push(d); });
    Object.keys(grupos).forEach(pais => {
        const div = document.createElement("div");
        div.className = "mb-3";
        div.innerHTML = `
            <button class="w-full flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 acordeon-btn">
                <span class="text-xs font-black text-indigo-600 uppercase tracking-widest italic underline">📍 ${pais}</span>
                <i class="fas fa-chevron-down text-slate-300 transition-transform duration-300"></i>
            </button>
            <div class="panel hidden mt-3 space-y-3 pl-2 border-l-2 border-indigo-100 ml-4"></div>`;
        const panel = div.querySelector(".panel");
        grupos[pais].forEach(c => {
            const card = document.createElement("div");
            card.className = "bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3";
            card.innerHTML = `
                <button class="w-full bg-indigo-600 px-5 py-4 text-left flex justify-between items-center acordeon-btn">
                    <h3 class="text-[11px] font-bold text-white uppercase leading-tight flex-1">${c.titulo}</h3>
                    <i class="fas fa-plus text-indigo-200 text-[10px] ml-3 transition-transform duration-300"></i>
                </button>
                <div class="panel hidden p-5 space-y-3 bg-slate-50/50 text-xs">
                    <div><b class="text-[9px] uppercase text-slate-400 block">Instituto:</b> ${c.inst}</div>
                    <div class="grid grid-cols-2 gap-2 font-bold italic"><div>Inicio: ${c.inicio}</div><div>Término: ${c.termino}</div></div>
                    <div class="bg-amber-50 p-3 rounded border border-amber-100 text-amber-900 font-black">LÍMITE: ${c.limite}</div>
                    <div class="text-[10px] text-slate-500 italic">Notas: ${c.notas}</div>
                    <div class="text-right text-[9px] text-slate-300 font-bold">DTE: ${c.dte}</div>
                </div>`;
            panel.appendChild(card);
        });
        contenedor.appendChild(div);
    });
    attachAccordionEvents();
}

/* ============================================================
   🔵 5. NORMATECA & EVENTOS
   ============================================================*/
function renderNormateca() {
    const contenedor = document.getElementById("normatecaList");
    contenedor.innerHTML = "";
    if (normatecaDocs.length === 0) {
        contenedor.innerHTML = `<div class="p-8 text-center text-slate-400 italic text-sm font-medium uppercase">No hay documentos en biblioteca</div>`;
        return;
    }
    normatecaDocs.forEach(doc => {
        const card = document.createElement("div");
        card.className = "bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center gap-4 transition-all active:scale-[0.98]";
        card.innerHTML = `<div class="flex-1 text-xs"><b class="text-indigo-600 uppercase tracking-widest text-[9px] block mb-1">${doc.tipo}</b><h3 class="font-bold text-slate-800 mb-1">${doc.titulo}</h3><p class="text-slate-500 leading-tight">${doc.descripcion || "---"}</p></div><a href="${doc.archivo}" target="_blank" class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0"><i class="fas fa-download"></i></a>`;
        contenedor.appendChild(card);
    });
}

function attachAccordionEvents() {
    document.querySelectorAll(".acordeon-btn").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const panel = btn.nextElementSibling;
            if (!panel || !panel.classList.contains("panel")) return;
            
            const icon = btn.querySelector(".fa-chevron-down, .fa-plus, .fa-minus");
            panel.classList.toggle("hidden");
            
            if (icon) {
                if (icon.classList.contains("fa-chevron-down")) icon.classList.toggle("rotate-180");
                if (icon.classList.contains("fa-plus")) { icon.classList.replace("fa-plus", "fa-minus"); }
                else if (icon.classList.contains("fa-minus")) { icon.classList.replace("fa-minus", "fa-plus"); }
            }
        };
    });
}

function attachEvents() {
    searchInput.addEventListener("input", renderList);
    filterResponsible.addEventListener("change", renderList);
    filterStatus.addEventListener("change", renderList);
    btnAddProject.addEventListener("click", openModalForNew);
    projectForm.addEventListener("submit", saveProject);
    btnExportPDF.addEventListener("click", () => alert("Generando PDF institucional..."));
    btnExportXLS.addEventListener("click", exportXLS);
    btnImportJSON.addEventListener("click", importJSON);

    const tabs = {
        'tabProyectos': { section: 'projectList', filters: 'filterSection', counter: true },
        'tabnormateca': { section: 'normatecaSection', filters: null, counter: false },
        'tabGestion': { section: 'gestionSection', filters: null, counter: false },
        'tabReportes': { section: 'reportsSection', filters: null, counter: false }
    };

    Object.keys(tabs).forEach(tabId => {
        const btn = document.getElementById(tabId);
        if (!btn) return;
        
        btn.addEventListener("click", () => {
            Object.keys(tabs).forEach(id => {
                const b = document.getElementById(id);
                if(b) b.classList.remove("active-tab", "text-indigo-600");
                if(b) b.classList.add("text-slate-400");
                const sec = document.getElementById(tabs[id].section);
                if(sec) sec.classList.add("hidden");
            });

            const current = tabs[tabId];
            btn.classList.add("active-tab", "text-indigo-600");
            btn.classList.remove("text-slate-400");
            document.getElementById(current.section).classList.remove("hidden");
            
            document.getElementById("filterSection").classList.toggle("hidden", !current.filters);
            document.getElementById("counterContainer").classList.toggle("hidden", !current.counter);
            
            if (tabId === 'tabnormateca') renderNormateca();
            if (tabId === 'tabGestion') toggleGestion('formacion');
        });
    });

    document.getElementById("btnSwitchFormacion").onclick = () => toggleGestion('formacion');
    document.getElementById("btnSwitchInvestigacion").onclick = () => toggleGestion('investigacion');
}

function toggleGestion(tipo) {
    const isForm = tipo === 'formacion';
    const btnForm = document.getElementById("btnSwitchFormacion");
    const btnInv = document.getElementById("btnSwitchInvestigacion");

    btnForm.className = isForm ? "flex-1 py-3 text-[10px] font-black rounded-xl bg-white shadow-sm text-indigo-600 transition-all uppercase tracking-widest" : "flex-1 py-3 text-[10px] font-black rounded-xl text-slate-500 transition-all uppercase tracking-widest";
    btnInv.className = !isForm ? "flex-1 py-3 text-[10px] font-black rounded-xl bg-white shadow-sm text-emerald-700 transition-all uppercase tracking-widest" : "flex-1 py-3 text-[10px] font-black rounded-xl text-slate-500 transition-all uppercase tracking-widest";
    
    document.getElementById("formacionContainer").classList.toggle("hidden", !isForm);
    document.getElementById("investigacionContainer").classList.toggle("hidden", isForm);
    
    if (isForm) renderCapacitaciones(); else renderPermisos();
}

/* ============================================================
   🔵 6. MODAL & OTROS
   ============================================================*/
function openModalForNew() { modalTitle.textContent = "NUEVO PROYECTO"; projectForm.reset(); projId.value = ""; showModal(); }
function openEditModal(id) {
    const p = proyectos.find(x => x.id === id); if (!p) return;
    modalTitle.textContent = "EDITAR PROYECTO";
    projId.value = p.id; projNombredelproyecto.value = p.Nombredelproyecto;
    projSector.value = p.Sector; projPais.value = p.Pais; projContinente.value = p.Continente;
    projFechadeinicio.value = p.Fechadeinicio; projFechadetermino.value = p.Fechadetermino;
    projStatus.value = p.status; projObjetivo.value = p.Objetivo; projNotas.value = p.notas;
    showModal();
}
function deleteProject(id) {
    if (confirm("¿Estás seguro de eliminar este proyecto permanentemente?")) {
        proyectos = proyectos.filter(p => p.id !== id);
        saveToStorage();
        renderList();
    }
}
function showModal() { modal.classList.remove("hidden"); modal.style.display = "flex"; }
function closeModal() { modal.classList.add("hidden"); modal.style.display = "none"; }

function saveProject(ev) {
    ev.preventDefault();
    const id = projId.value;
    const data = { id: id || cryptoRandomId(), Nombredelproyecto: projNombredelproyecto.value.trim(), Sector: projSector.value.trim(), Pais: projPais.value.trim(), Continente: projContinente.value.trim().toUpperCase(), Fechadeinicio: projFechadeinicio.value.trim(), Fechadetermino: projFechadetermino.value.trim(), status: projStatus.value.trim(), Objetivo: projObjetivo.value.trim(), notas: projNotas.value.trim(), createdAt: id ? proyectos.find(p => p.id === id).createdAt : new Date().toISOString() };
    if (id) proyectos = proyectos.map(p => p.id === id ? data : p); else proyectos.unshift(data);
    saveToStorage(); closeModal(); renderList();
}

function exportXLS() { const worksheet = XLSX.utils.json_to_sheet(proyectos); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos"); XLSX.writeFile(workbook, "Proyectos_DGCID.xlsx"); }
function importJSON() { 
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if(Array.isArray(data)) { proyectos = data; saveToStorage(); renderList(); alert("Sincronización exitosa"); }
            } catch(e) { alert("Error al leer archivo JSON"); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function populateResponsibles() {
    const allSectors = [];
    proyectos.forEach(p => { if (p.Sector) { const sectores = p.Sector.split(',').map(s => s.trim()).filter(s => s.length > 0); allSectors.push(...sectores); } });
    const uniqueSectores = Array.from(new Set(allSectors)).sort();
    filterResponsible.innerHTML = `<option value="">Sector</option>`;
    uniqueSectores.forEach(s => { const opt = document.createElement("option"); opt.value = s; opt.textContent = s; filterResponsible.appendChild(opt); });
}
