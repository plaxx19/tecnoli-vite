// app.js
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/* ------------------------------------------------------------------ */
/* Datos de respaldo (se usan mientras no configures Supabase)         */
/* ------------------------------------------------------------------ */
const FALLBACK_PRODUCTS = [
  { id: 1,  name: 'Tarjeta de Video NVIDIA GeForce RTX 5070 12GB GDDR7', category: 'tarjetas-graficas', price: 21749, badge: 'Más vendido' },
  { id: 2,  name: 'Procesador AMD Ryzen 7 7800X3D', category: 'procesadores', price: 8499, badge: 'Más vendido' },
  { id: 3,  name: 'Memoria RAM G.Skill Trident Z RGB 32GB (2x16GB) 6000MHz', category: 'memorias-ram', price: 2999, badge: 'Más vendido' },
  { id: 4,  name: 'Fuente de Poder Cooler Master MWE Gold 750W Modular', category: 'fuentes-de-poder', price: 1999, badge: 'Más vendido' },
  { id: 5,  name: 'Teclado Mecánico Logitech G Pro X TKL Lightspeed', category: 'perifericos', price: 3599, badge: 'Más vendido' },
  { id: 6,  name: 'RTX 4060', category: 'tarjetas-graficas', price: 10499 },
  { id: 7,  name: 'RX 9070 XT', category: 'tarjetas-graficas', price: 18999 },
  { id: 8,  name: 'Ryzen 7 9800X3D', category: 'procesadores', price: 11999 },
  { id: 9,  name: 'Intel Core Ultra 7 265K', category: 'procesadores', price: 8499 },
  { id: 10, name: 'DDR5 64GB', category: 'memorias-ram', price: 4999 },
  { id: 11, name: 'DDR5 32GB', category: 'memorias-ram', price: 2999 },
  { id: 12, name: 'DDR5 16GB', category: 'memorias-ram', price: 1499 },
  { id: 13, name: '750W Gold', category: 'fuentes-de-poder', price: 1999 },
  { id: 14, name: '850W Gold', category: 'fuentes-de-poder', price: 2499 },
  { id: 15, name: '1000W Gold', category: 'fuentes-de-poder', price: 3299 },
  { id: 16, name: 'Logitech G502', category: 'perifericos', price: 1599 },
  { id: 17, name: 'HyperX Cloud III', category: 'perifericos', price: 2499 },
  { id: 18, name: 'Razer DeathAdder', category: 'perifericos', price: 1599 },
];

const HERO_SLIDES = [
  { title: 'Todo para tu setup gamer', subtitle: 'Encuentra tus componentes ideales', text: 'Rendimiento, calidad y el mejor precio en TecnoLi.' },
  { title: 'Más FPS, menos espera', subtitle: 'Tarjetas gráficas de nueva generación', text: 'Arma tu equipo con las últimas RTX y Radeon.' },
  { title: 'Potencia para crear y jugar', subtitle: 'Procesadores y memoria RAM', text: 'Ryzen, Intel Core Ultra y DDR5 listos para enviar.' },
];

const BADGE_COLORS = ['#1D6FE8', '#0FB5BA', '#F5B50A', '#F97316', '#1E3A5F'];
const CATEGORY_LIMIT = 3;
const BEST_LIMIT = 5;

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
const formatPrice = (n) => money.format(Number(n));
const formatCard = (n) => `${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(Number(n))} MXN`;
const formatMini = (n) => `$${new Intl.NumberFormat('es-MX').format(Number(n))} MXN`;

// Imagen de reemplazo cuando image_url viene vacío o falla
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" rx="8" fill="#F1F4F9"/><rect x="30" y="28" width="60" height="34" rx="5" fill="none" stroke="#9AA6B8" stroke-width="3"/><circle cx="48" cy="45" r="7" fill="none" stroke="#9AA6B8" stroke-width="3"/></svg>`
);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;           // textContent evita inyección de HTML
    else if (k.startsWith('data-') || k === 'style') node.setAttribute(k, v);
    else node[k] = v;
  }
  [].concat(children).forEach((c) => c && node.append(c));
  return node;
}

function productImage(product, className) {
  const img = el('img', { class: className, alt: product.name, loading: 'lazy', src: product.image_url || PLACEHOLDER });
  img.addEventListener('error', () => { img.src = PLACEHOLDER; }, { once: true });
  return img;
}

/* ------------------------------------------------------------------ */
/* Componentes (reciben una fila de la tabla `products`)               */
/* ------------------------------------------------------------------ */
export function createProductCard(product, index = 0) {
  const card = el('article', { class: 'card', 'data-id': product.id });
  if (product.badge) {
    card.append(el('span', { class: 'card__badge', text: product.badge, style: `--badge:${BADGE_COLORS[index % BADGE_COLORS.length]}` }));
  }
  const media = el('div', { class: 'card__media' }, productImage(product));
  const name = el('h3', { class: 'card__name', text: product.name });
  const price = el('p', { class: 'card__price', text: formatCard(product.price) });
  const btn = el('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-add': product.id, 'aria-label': `Agregar ${product.name} al carrito` });
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Agregar';
  card.append(media, name, price, btn);
  return card;
}

export function createMiniCard(product) {
  const card = el('article', { class: 'mini', 'data-id': product.id, tabIndex: 0, role: 'button', 'aria-label': `Agregar ${product.name} al carrito`, 'data-add': product.id });
  card.append(
    el('div', { class: 'mini__media' }, productImage(product)),
    el('h3', { class: 'mini__name', text: product.name }),
    el('p', { class: 'mini__price', text: formatMini(product.price) }),
  );
  return card;
}

/* ------------------------------------------------------------------ */
/* Supabase                                                            */
/* ------------------------------------------------------------------ */
export async function fetchProducts() {
  if (!isSupabaseConfigured) {
    console.info('[TecnoLi] Supabase sin configurar: usando datos de ejemplo. Edita supabaseClient.js.');
    return FALLBACK_PRODUCTS;
  }
  const { data, error } = await supabase.from('products').select('*'); // <-- consulta principal
  if (error) throw error;
  return data ?? [];
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
function renderBestSellers(products) {
  const box = $('#best-sellers');
  const best = products
    .filter((p) => p.badge === 'Más vendido')
    .sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0))
    .slice(0, BEST_LIMIT);
  box.replaceChildren();
  if (!best.length) return box.append(el('p', { class: 'empty', text: 'Aún no hay productos destacados.' }));
  best.forEach((p, i) => box.append(createProductCard(p, i)));
}

function renderCategories(products) {
  $$('.cat').forEach((section) => {
    const grid = $('.grid-mini', section);
    const items = products
      .filter((p) => p.category === section.dataset.category && p.badge !== 'Más vendido')
      .slice(0, CATEGORY_LIMIT);
    grid.replaceChildren();
    if (!items.length) return grid.append(el('p', { class: 'empty', text: 'Sin productos por ahora.' }));
    items.forEach((p) => grid.append(createMiniCard(p)));
  });
}

function renderSkeletons() {
  $('#best-sellers').replaceChildren(...Array.from({ length: BEST_LIMIT }, () => el('div', { class: 'skeleton' })));
}

function renderError(message) {
  $('#best-sellers').replaceChildren(el('p', { class: 'empty', text: message }));
}

/* ------------------------------------------------------------------ */
/* Carrito (en memoria; luego puedes guardarlo en Supabase)            */
/* ------------------------------------------------------------------ */
const cart = new Map();      // id -> { product, qty }
let catalog = [];

function updateCartUI() {
  let count = 0, total = 0;
  cart.forEach(({ product, qty }) => { count += qty; total += qty * Number(product.price); });
  $('#cart-count').textContent = count;
  $('#cart-total').textContent = formatPrice(total).replace('MXN', '').trim();
}

let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 1800);
}

function addToCart(id) {
  const product = catalog.find((p) => String(p.id) === String(id));
  if (!product) return;
  const line = cart.get(product.id) ?? { product, qty: 0 };
  line.qty += 1;
  cart.set(product.id, line);
  updateCartUI();
  showToast('Agregado al carrito');
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-add]');
  if (target) addToCart(target.dataset.add);
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.mini[data-add]')) {
    e.preventDefault();
    addToCart(e.target.dataset.add);
  }
});

/* ------------------------------------------------------------------ */
/* Buscador (filtra en cliente; para catálogos grandes usa .ilike())   */
/* ------------------------------------------------------------------ */
$('#search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#search-input').value.trim().toLowerCase();
  const list = q ? catalog.filter((p) => p.name.toLowerCase().includes(q)) : catalog;
  renderBestSellers(list);
  renderCategories(list);
  if (q && !list.length) showToast('Sin resultados');
});
// Alternativa en servidor:
// supabase.from('products').select('*').ilike('name', `%${q}%`)

/* ------------------------------------------------------------------ */
/* Carrusel del hero                                                   */
/* ------------------------------------------------------------------ */
function initHero() {
  const dots = $('#hero-dots');
  let current = 0, timer;

  const show = (i) => {
    current = i;
    const s = HERO_SLIDES[i];
    $('#hero-title').textContent = s.title;
    $('#hero-subtitle').textContent = s.subtitle;
    $('#hero-text').textContent = s.text;
    $$('button', dots).forEach((b, n) => b.setAttribute('aria-selected', String(n === i)));
  };

  HERO_SLIDES.forEach((_, i) => {
    const b = el('button', { type: 'button', role: 'tab', 'aria-label': `Promoción ${i + 1}` });
    b.addEventListener('click', () => { show(i); restart(); });
    dots.append(b);
  });

  const restart = () => {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => show((current + 1) % HERO_SLIDES.length), 6000);
    }
  };
  show(0);
  restart();
}

/* ------------------------------------------------------------------ */
/* Inicio                                                              */
/* ------------------------------------------------------------------ */
async function init() {
  $('#year').textContent = new Date().getFullYear();
  initHero();
  updateCartUI();
  renderSkeletons();
  try {
    catalog = await fetchProducts();
    renderBestSellers(catalog);
    renderCategories(catalog);
  } catch (err) {
    console.error(err);
    renderError('No pudimos cargar los productos. Revisa tu conexión y las credenciales de Supabase.');
  }
}

init();