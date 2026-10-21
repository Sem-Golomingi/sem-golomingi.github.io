// ===== Interactions existantes (menu mobile + année) =====
const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
menu?.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Préférences utilisateur =====
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ===== Barre de progression + lien actif =====
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.prepend(progress);

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav nav a");
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const st = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";

    let currentId = "";
    sections.forEach(s => { if (st >= s.offsetTop - 140) currentId = s.id; });
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + currentId));

    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Tilt 3D au survol =====
function addTilt(el, maxDeg, baseDeg = 0) {
  if (!el || reducedMotion || !finePointer) return;
  el.classList.add("tilt");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const idle = baseDeg ? `rotateZ(${baseDeg}deg)` : "";

  function frame() {
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    const settled = Math.abs(tx - cx) < 0.02 && Math.abs(ty - cy) < 0.02;
    if (settled) {
      cx = tx; cy = ty;
      el.style.transform = (cx === 0 && cy === 0)
        ? idle
        : `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg) rotateZ(${baseDeg}deg)`;
      raf = null;
      return;
    }
    el.style.transform = `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg) rotateZ(${baseDeg}deg)`;
    raf = requestAnimationFrame(frame);
  }

  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ty = (px - 0.5) * maxDeg * 2;
    tx = (py - 0.5) * -maxDeg * 2;
    el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    if (!raf) raf = requestAnimationFrame(frame);
  });
  el.addEventListener("pointerleave", () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  });
}

document.querySelectorAll(".card").forEach(el => addTilt(el, 8));
document.querySelectorAll(".project").forEach(el => addTilt(el, 7));
document.querySelectorAll(".credential").forEach(el => addTilt(el, 6));
addTilt(document.querySelector(".hero-card"), 10, 2);

// ===== Révélation au défilement =====
function revealGroup(selector, klass, step) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add(klass);
    if (step) el.style.setProperty("--d", (i * step) + "ms");
  });
}

if (!reducedMotion) {
  revealGroup(".hero-card, .card, .project, .credential", "reveal-fade", 90);
  revealGroup(".hero-copy, .split > div, .split > .text, .timeline-item, .highlight > div, .highlight > .btn, .contact h2, .contact > p:not(.eyebrow), .contact-links", "reveal", 110);

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .reveal-fade").forEach(el => io.observe(el));
}

// ===== Formes flottantes + parallaxe (hero) =====
const hero = document.querySelector(".hero");
if (hero && !reducedMotion) {
  const blobs = [
    { size: 340, left: "4%",  top: "10%", color: "rgba(23,107,135,.15)",  speed: 26 },
    { size: 260, left: "76%", top: "6%",  color: "rgba(214,168,79,.20)",  speed: 40 },
    { size: 230, left: "58%", top: "66%", color: "rgba(23,107,135,.11)",  speed: 20 }
  ];
  blobs.forEach(b => {
    const el = document.createElement("div");
    el.className = "hero-blob";
    el.style.width = b.size + "px";
    el.style.height = b.size + "px";
    el.style.left = b.left;
    el.style.top = b.top;
    el.style.background = b.color;
    el.dataset.speed = b.speed;
    hero.appendChild(el);
  });

  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    hero.querySelectorAll(".hero-blob").forEach(el => {
      const s = +el.dataset.speed;
      el.style.transform = `translate3d(${(-dx * s).toFixed(1)}px, ${(-dy * s).toFixed(1)}px, 0)`;
    });
  });
  hero.addEventListener("pointerleave", () => {
    hero.querySelectorAll(".hero-blob").forEach(el => {
      el.classList.add("settle");
      el.style.transform = "";
      setTimeout(() => el.classList.remove("settle"), 650);
    });
  });
}
