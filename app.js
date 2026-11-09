import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 2
});

// Productos de demostración: se muestran automáticamente mientras no configures Supabase.
// image_url puede apuntar a Storage de Supabase o a cualquier URL pública de imagen.
const demoProducts = [
  { id: "p1", name: "Tarjeta de Video NVIDIA GeForce RTX 5070 12GB GDDR7", category: "Tarjetas gráficas", price: 21749, image_url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", badge: "Más vendido", best_seller: true },
  { id: "p2", name: "Procesador AMD Ryzen 7 7800X3D", category: "Procesadores", price: 8499, image_url: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=600&q=80", badge: "Más vendido", best_seller: true },
  { id: "p3", name: "Memoria RAM G.Skill Trident Z RGB 32GB (2x16GB) 6000MHz", category: "Memorias RAM", price: 2999, image_url: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80", badge: "Más vendido", best_seller: true },
  { id: "p4", name: "Fuente de Poder Cooler Master MWE Gold 750W Modular", category: "Fuentes de poder", price: 1999, image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80", badge: "Más vendido", best_seller: true },
  { id: "p5", name: "Teclado Mecánico Logitech G Pro X TKL Lightspeed", category: "Periféricos", price: 3599, image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80", badge: "Más vendido", best_seller: true },
  { id: "p6", name: "RTX 9070 XT", category: "Tarjetas gráficas", price: 18999, image_url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80" },
  { id: "p7", name: "RTX 4060", category: "Tarjetas gráficas", price: 10499, image_url: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80" },
  { id: "p8", name: "Intel Core Ultra 7 265K", category: "Procesadores", price: 9999, image_url: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=600&q=80" },
  { id: "p9", name: "Ryzen 7 9800X3D", category: "Procesadores", price: 11999, image_url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80" },
  { id: "p10", name: "DDR5 64GB (2x32GB)", category: "Memorias RAM", price: 4999, image_url: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80" },
  { id: "p11", name: "DDR5 32GB", category: "Memorias RAM", price: 2999, image_url: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80" },
  { id: "p12", name: "DDR5 16GB", category: "Memorias RAM", price: 1499, image_url: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80" },
  { id: "p13", name: "750W Gold", category: "Fuentes de poder", price: 1999, image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80" },
  { id: "p14", name: "850W Gold", category: "Fuentes de poder", price: 2499, image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80" },
  { id: "p15", name: "1000W Gold", category: "Fuentes de poder", price: 3299, image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80" },
  { id: "p16", name: "Logitech G502", category: "Periféricos", price: 1599, image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80" },
  { id: "p17", name: "HyperX Cloud III", category: "Periféricos", price: 2499, image_url: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=600&q=80" },
  { id: "p18", name: "Razer DeathAdder", category: "Periféricos", price: 1599, image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80" }
];

let products = [];
const cart = new Map();
const bestContainer = document.querySelector("#best-products");
const statusMessage = document.querySelector("#status-message");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function productImage(product) {
  const url = product.image_url || "https://placehold.co/500x350?text=Tecnoli";
  return `<img class="product-image" src="${escapeHTML(url)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://placehold.co/500x350?text=Producto'">`;
}

function badgeClass(badge) {
  const value = String(badge || "").toLowerCase();
  if (value.includes("nuevo")) return "cyan";
  if (value.includes("oferta")) return "orange";
  if (value.includes("premium")) return "navy";
  return "yellow";
}

function renderBestSeller(product) {
  const badge = product.badge
    ? `<span class="badge ${badgeClass(product.badge)}">${escapeHTML(product.badge)}</span>` : "";
  return `
    <article class="product-card best-card">
      ${badge}
      ${productImage(product)}
      <h3 class="product-name">${escapeHTML(product.name)}</h3>
      <p class="product-price">${money.format(Number(product.price) || 0)} MXN</p>
      <button class="add-button" data-add="${escapeHTML(product.id)}" type="button">🛒 &nbsp; Agregar</button>
    </article>`;
}

function renderMiniProduct(product) {
  return `
    <article class="product-card mini-card">
      ${productImage(product)}
      <h3 class="product-name">${escapeHTML(product.name)}</h3>
      <p class="product-price">${money.format(Number(product.price) || 0)} MXN</p>
      <button class="add-button mini-add" data-add="${escapeHTML(product.id)}" type="button">Agregar</button>
    </article>`;
}

function renderProducts(list) {
  const best = list.filter(p => p.best_seller || p.badge).slice(0, 5);
  const fallbackBest = best.length ? best : list.slice(0, 5);
  bestContainer.innerHTML = fallbackBest.length
    ? fallbackBest.map(renderBestSeller).join("")
    : `<p class="empty-cart">No se encontraron productos.</p>`;

  document.querySelectorAll(".mini-grid").forEach(grid => {
    const category = grid.dataset.category;
    const categoryProducts = list.filter(p => p.category === category).slice(0, 3);
    grid.innerHTML = categoryProducts.length
      ? categoryProducts.map(renderMiniProduct).join("")
      : `<p class="empty-cart">Sin productos</p>`;
  });
}

async function loadProducts() {
  statusMessage.textContent = "Cargando catálogo…";
  if (isSupabaseConfigured) {
    // Consulta solicitada: trae el catálogo desde la tabla products.
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) {
      console.error("Error consultando Supabase:", error);
      products = demoProducts;
      statusMessage.textContent = "No fue posible cargar Supabase. Se muestran productos de demostración.";
    } else {
      products = data || [];
      statusMessage.textContent = "Catálogo conectado a Supabase.";
    }
  } else {
    products = demoProducts;
    statusMessage.textContent = "Vista de demostración. Configura las credenciales en supabaseClient.js para conectar tu catálogo.";
  }
  renderProducts(products);
}

function addToCart(productId) {
  const product = products.find(p => String(p.id) === String(productId));
  if (!product) return;
  const current = cart.get(productId);
  cart.set(productId, { product, quantity: (current?.quantity || 0) + 1 });
  updateCartUI();
}

function updateCartUI() {
  const entries = [...cart.values()];
  const quantity = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  document.querySelector("#cart-count").textContent = quantity;
  document.querySelector("#cart-total").textContent = money.format(total);
  document.querySelector("#dialog-total").textContent = money.format(total);
  document.querySelector("#cart-items").innerHTML = entries.length
    ? entries.map(({ product, quantity: qty }) => `
      <div class="cart-line">
        <span>${escapeHTML(product.name)}<small>Cantidad: ${qty}</small></span>
        <strong>${money.format(Number(product.price) * qty)}</strong>
      </div>`).join("")
    : `<p class="empty-cart">Tu carrito está vacío.</p>`;
}

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);
});

document.querySelector("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  const query = document.querySelector("#search-input").value.trim().toLocaleLowerCase("es-MX");
  const filtered = query
    ? products.filter(p => `${p.name} ${p.category}`.toLocaleLowerCase("es-MX").includes(query))
    : products;
  renderProducts(filtered);
  statusMessage.textContent = query
    ? `${filtered.length} resultado(s) para "${query}".`
    : "Mostrando todo el catálogo.";
});

document.querySelector("#cart-button").addEventListener("click", () => {
  updateCartUI();
  document.querySelector("#cart-dialog").showModal();
});
document.querySelector("#close-cart").addEventListener("click", () => {
  document.querySelector("#cart-dialog").close();
});
document.querySelector("#year").textContent = new Date().getFullYear();

loadProducts();
