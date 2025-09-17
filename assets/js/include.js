// assets/js/include.js

async function loadComponent(id, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function normalizePath(p) {
  // elimina múltiples slashes y trailing slash (salvo "/" raíz)
  if (!p) return "/";
  const np = p.replace(/\/+$/, "");
  return np === "" ? "/" : np;
}

function markActiveNavLink() {
  const currentPath = normalizePath(window.location.pathname);
  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

  // Buscar enlaces en el header (insertado en #header) o en header ya presente
  const navLinks = document.querySelectorAll("#header nav a, header nav a");
  if (!navLinks.length) {
    // No hay enlaces — nada que marcar
    return;
  }

  navLinks.forEach(link => {
    try {
      const href = link.getAttribute("href");
      // construye URL absoluta para manejar href relativos
      const linkUrl = new URL(href, window.location.href);
      const linkPath = normalizePath(linkUrl.pathname);
      const linkFile = (linkUrl.pathname.split("/").pop() || "index.html").toLowerCase();

      // Condiciones de coincidencia:
      // 1) path exacto (sin trailing slash)
      // 2) archivo igual (ej. projects.html)
      // 3) si el link apunta a la raíz ("/") y la página actual es index
      const isActive =
        linkPath === currentPath ||
        linkFile === currentFile ||
        (linkPath === "/" && currentPath === "/");

      if (isActive) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    } catch (err) {
      // href inválido (p.ej. javascript:;), lo ignoramos
    }
  });
}

async function initIncludes() {
  // usa rutas relativas para evitar problemas al subir a /<repo>/
  await Promise.all([
    loadComponent("header", "/components/header.html"),
    loadComponent("footer", "/components/footer.html"),
  ]);

  // una vez insertados los componentes, marca el enlace activo
  markActiveNavLink();
}

// inicializamos al cargar el DOM
document.addEventListener("DOMContentLoaded", initIncludes);
