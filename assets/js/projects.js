// === Cargar y renderizar proyectos ===
async function loadProjects() {
  const res = await fetch("assets/data/projects.json");
  const projects = await res.json();

  // Render inicial
  renderProjects(projects);

  // Generar filtros de tecnologías
  generateTechFilters(projects);

  // === Buscador ===
  const searchInput = document.getElementById("project-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyFilters(projects);
    });
  }

  // === Evento filtros de tecnologías ===
  const techFilterContainer = document.getElementById("tech-filters");
  if (techFilterContainer) {
    techFilterContainer.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        e.target.classList.toggle("active"); // activar/desactivar filtro
        applyFilters(projects);
      }
    });
  }
}

// === Renderizar proyectos ===
function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  container.innerHTML = "";

  if (!projects.length) {
    container.innerHTML = "<p>No se encontraron proyectos.</p>";
    return;
  }

  projects.forEach(proj => {
    const techList = proj.technologies
      ? `<ul class="project-tech">
           ${proj.technologies.map(t => `<li>${t}</li>`).join("")}
         </ul>`
      : "";

    // Normalizar el estado para crear una clase CSS
    const statusClass = (proj.status || '').toLowerCase().replace(/ /g, '-').replace('á', 'a').replace('ó', 'o');

    // Construir la información del estado
    let statusInfo = '';
    if (proj.status) {
        statusInfo = `<p class="project-status status-${statusClass}">Estado: <em>${proj.status}</em></p>`;
        if (proj.status_description) {
            statusInfo = `<p class="project-status status-${statusClass}">Estado: <em>${proj.status}</em> <br> <span class="status-description">${proj.status_description}</span></p>`;
        }
    }

    const card = `
      <a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="project-card-link">
        <div class="project-card">
          <div class="project-thumb-container">
            <img src="${proj.thumbnail}" alt="Miniatura de ${proj.title}" class="project-thumb">
          </div>
          <div class="project-info">
            <h2>${proj.title}</h2>
            ${statusInfo}
            <p>${proj.description}</p>
            ${techList}
          </div>
        </div>
      </a>
    `;

    container.insertAdjacentHTML("beforeend", card);
  });
}

// === Generar botones de tecnologías ===
function generateTechFilters(projects) {
  const techFilterContainer = document.getElementById("tech-filters");
  if (!techFilterContainer) return;

  const allTechs = new Set();
  projects.forEach(p => (p.technologies || []).forEach(t => allTechs.add(t)));

  techFilterContainer.innerHTML = [...allTechs]
    .map(t => `<button class="tech-filter">${t}</button>`)
    .join("");
}

// === Aplicar filtros combinados ===
function applyFilters(projects) {
  const searchInput = document.getElementById("project-search");
  const term = searchInput ? searchInput.value.toLowerCase() : "";

  const activeFilters = [...document.querySelectorAll("#tech-filters .active")]
    .map(btn => btn.textContent.toLowerCase());

  const filtered = projects.filter(p => {
    const matchText =
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(term));

    const matchTech =
      activeFilters.length === 0 ||
      (p.technologies || []).some(t =>
        activeFilters.includes(t.toLowerCase())
      );

    return matchText && matchTech;
  });

  renderProjects(filtered);
}

document.addEventListener("DOMContentLoaded", loadProjects);