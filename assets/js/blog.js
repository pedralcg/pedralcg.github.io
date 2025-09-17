async function loadBlogPosts() {
  const res = await fetch("assets/data/blog.json");
  const posts = await res.json();

  // Ordenar por fecha descendente
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Obtener todas las categorías únicas
  const categories = [...new Set(posts.flatMap(p => p.categories || []))];

  // Renderizar filtros
  renderFilters(categories);

  // Renderizar posts iniciales
  renderPosts(posts);

  // --- Buscador ---
  const searchInput = document.getElementById("blog-search");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = posts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      (p.categories || []).some(c => c.toLowerCase().includes(term))
    );
    renderPosts(filtered);
  });

  // --- Filtros por categoría ---
  document.querySelectorAll(".blog-filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".blog-filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      if (cat === "all") {
        renderPosts(posts);
      } else {
        const filtered = posts.filter(p => (p.categories || []).includes(cat));
        renderPosts(filtered);
      }
    });
  });
}

function renderFilters(categories) {
  const container = document.getElementById("blog-filters");
  container.innerHTML = `
    <button data-category="all" class="active">Todos</button>
    ${categories.map(c => `<button data-category="${c}">${c}</button>`).join("")}
  `;
}

function renderPosts(posts) {
  const container = document.getElementById("blog-container");
  container.innerHTML = "";

  posts.forEach(post => {
    const statusBadge =
      post.status === "published"
        ? `<span class="badge badge-published">Publicado</span>`
        : `<span class="badge badge-draft">Próximamente</span>`;

    const categories = post.categories
      ? `<ul class="post-categories">
          ${post.categories.map(cat => `<li>${cat}</li>`).join("")}
         </ul>`
      : "";

    const date = post.date
      ? new Date(post.date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      : "";

    const card = `
      <article class="blog-post-card">
        <h2>
          ${post.link && post.status === "published"
            ? `<a href="${post.link}">${post.title}</a>`
            : `${post.title}`}
        </h2>
        ${statusBadge}
        <p class="post-date">${date}</p>
        <p>${post.description}</p>
        ${categories}
      </article>
    `;

    container.insertAdjacentHTML("beforeend", card);
  });
}

document.addEventListener("DOMContentLoaded", loadBlogPosts);
