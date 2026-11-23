/* ===========================================================
   CONFIGURAÇÃO: número do WhatsApp com DDI + DDD (só números)
   =========================================================== */
const WHATSAPP = "5531996916719";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const brl = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");

// Links de WhatsApp
$$(".js-wa").forEach((a) => {
  a.href = waLink(a.dataset.msg || "Olá! Vim pelo site da Reflexo.");
  a.target = "_blank";
  a.rel = "noopener";
});

// Ano no rodapé
$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Cabeçalho muda ao rolar
const header = $("#header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menu no celular
const toggle = $("#navToggle");
const nav = $("#nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});

// Animação ao aparecer na tela
const revealObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); revealObs.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
$$(".reveal").forEach((el) => revealObs.observe(el));

// Contadores animados
const countObs = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
  const t0 = performance.now(), dur = 1600;
  const step = (t) => {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(end * eased).toLocaleString("pt-BR") + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  countObs.unobserve(el);
}), { threshold: 0.5 });
$$("[data-count]").forEach((el) => countObs.observe(el));

// Comparador antes/depois (mouse, toque e teclado)
function initBA(el) {
  const set = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    el.style.setProperty("--pos", pct + "%");
    el.setAttribute("aria-valuenow", Math.round(pct));
  };
  const fromEvent = (e) => {
    const r = el.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  let dragging = false;
  el.addEventListener("pointerdown", (e) => { dragging = true; el.setPointerCapture(e.pointerId); fromEvent(e); });
  el.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  el.addEventListener("pointerup", () => (dragging = false));
  el.addEventListener("pointercancel", () => (dragging = false));
  el.addEventListener("keydown", (e) => {
    const now = +el.getAttribute("aria-valuenow");
    if (e.key === "ArrowLeft") { set(now - 5); e.preventDefault(); }
    if (e.key === "ArrowRight") { set(now + 5); e.preventDefault(); }
  });
}
$$("[data-ba]").forEach(initBA);

// Demonstração automática no comparador do topo
const heroBA = $(".ba--hero");
if (heroBA && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let t0 = null, done = false;
  const anim = (t) => {
    if (done) return;
    if (!t0) t0 = t;
    const p = (t - t0) / 2400;
    heroBA.style.setProperty("--pos", 50 + Math.sin(p * Math.PI * 2) * 28 + "%");
    if (p < 1) requestAnimationFrame(anim); else heroBA.style.setProperty("--pos", "50%");
  };
  setTimeout(() => requestAnimationFrame(anim), 900);
  heroBA.addEventListener("pointerdown", () => (done = true));
}

// Carrossel de depoimentos
$$("[data-carousel]").forEach((wrap) => {
  const track = $(".testi__track", wrap), items = $$(".testi__item", wrap), dots = $(".testi__dots", wrap);
  let i = 0, timer;
  const perView = () => (innerWidth <= 620 ? 1 : innerWidth <= 980 ? 2 : 3);
  const pages = () => items.length - perView() + 1;
  const render = () => {
    i = Math.max(0, Math.min(i, pages() - 1));
    track.style.transform = `translateX(-${(100 / perView()) * i}%)`;
    dots.innerHTML = "";
    for (let k = 0; k < pages(); k++) {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Depoimento ${k + 1}`);
      if (k === i) b.classList.add("is-active");
      b.onclick = () => { i = k; render(); restart(); };
      dots.appendChild(b);
    }
  };
  const next = () => { i = (i + 1) % pages(); render(); };
  const restart = () => { clearInterval(timer); timer = setInterval(next, 5000); };
  $("[data-next]", wrap).onclick = () => { next(); restart(); };
  $("[data-prev]", wrap).onclick = () => { i = (i - 1 + pages()) % pages(); render(); restart(); };
  let x0 = null;
  track.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : (i = (i - 1 + pages()) % pages(), render()); restart(); }
    x0 = null;
  });
  addEventListener("resize", render);
  render(); restart();
});

// Abas de serviços
const tabs = $$(".tab");
if (tabs.length) {
  const show = (id) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
    });
    $$(".panel").forEach((p) => {
      const on = p.id === "p-" + id;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
  };
  tabs.forEach((t) => t.addEventListener("click", () => { show(t.dataset.tab); history.replaceState(null, "", "#" + t.dataset.tab); }));
  const fromHash = location.hash.slice(1);
  if (fromHash && $("#p-" + fromHash)) show(fromHash);
}

// Galeria: filtro e ampliação
const chips = $$(".chip");
chips.forEach((c) => c.addEventListener("click", () => {
  chips.forEach((x) => x.classList.toggle("is-active", x === c));
  $$(".gitem").forEach((g) => g.classList.toggle("is-hidden", c.dataset.filter !== "todos" && g.dataset.cat !== c.dataset.filter));
}));
const lb = $("#lightbox");
if (lb) {
  const stage = $(".lightbox__stage", lb);
  let list = [], idx = 0;
  const open = (name) => {
    list = $$(".gitem:not(.is-hidden) [data-zoom]").map((b) => b.dataset.zoom);
    idx = list.indexOf(name);
    paint();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("[data-close]", lb).focus();
  };
  const paint = () => {
    const n = list[idx];
    stage.innerHTML = `<div class="ba" data-ba tabindex="0" role="slider" aria-label="Comparar antes e depois" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
      <img src="img/${n}-depois.svg" alt="Depois" class="ba__img" draggable="false">
      <div class="ba__before"><img src="img/${n}-antes.svg" alt="Antes" class="ba__img" draggable="false"></div>
      <span class="ba__tag ba__tag--l">Antes</span><span class="ba__tag ba__tag--r">Depois</span>
      <div class="ba__handle"><span>⟷</span></div></div>`;
    initBA($(".ba", stage));
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
  const move = (d) => { idx = (idx + d + list.length) % list.length; paint(); };
  $$("[data-zoom]").forEach((b) => b.addEventListener("click", () => open(b.dataset.zoom)));
  $("[data-close]", lb).onclick = close;
  $("[data-lb-prev]", lb).onclick = () => move(-1);
  $("[data-lb-next]", lb).onclick = () => move(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft" && !e.target.matches("[data-ba]")) move(-1);
    if (e.key === "ArrowRight" && !e.target.matches("[data-ba]")) move(1);
  });
}

// Calculadora de orçamento + agendamento
const form = $("#quoteForm");
if (form) {
  const pre = new URLSearchParams(location.search).get("servico");
  if (pre) { const c = form.querySelector(`input[name=svc][value="${pre}"]`); if (c) c.checked = true; }

  const date = form.elements.data;
  const d = new Date(); d.setDate(d.getDate() + 1);
  date.min = d.toISOString().slice(0, 10);

  let shown = 0;
  const animateTo = (el, to) => {
    const from = shown, t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 450, 1);
      el.textContent = brl(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    shown = to;
  };

  const calc = () => {
    const size = form.querySelector("input[name=size]:checked");
    const mult = +size.dataset.mult;
    const picked = $$("input[name=svc]:checked", form);
    const list = $("#sumList");
    list.innerHTML = picked.length
      ? picked.map((c) => `<li><span>${c.dataset.label}</span><b>${brl(c.dataset.price * mult)}</b></li>`).join("")
      : '<li class="muted">Escolha pelo menos um serviço.</li>';
    let total = picked.reduce((s, c) => s + c.dataset.price * mult, 0);
    const disc = picked.length >= 2 ? total * 0.1 : 0;
    $("#sumDiscRow").hidden = !disc;
    $("#sumDisc").textContent = "- " + brl(disc);
    $("#sumSize").textContent = size.dataset.label;
    total -= disc;
    animateTo($("#sumTotal"), total);
    return { size: size.dataset.label, picked, total, disc };
  };
  // Barra com o total no celular
  const mbar = document.createElement("div");
  mbar.className = "mbar";
  mbar.innerHTML = '<span><small>Total estimado</small><b id="mTotal">R$ 0</b></span><a href="#sumTotal">Ver resumo</a>';
  document.body.appendChild(mbar);
  const hasPick = () => $$("input[name=svc]:checked", form).length > 0;
  new IntersectionObserver(([e]) => mbar.classList.toggle("is-on", !e.isIntersecting && hasPick())).observe($(".summary"));

  form.addEventListener("change", () => {
    const q = calc();
    $("#mTotal").textContent = brl(q.total);
    const r = $(".summary").getBoundingClientRect();
    mbar.classList.toggle("is-on", hasPick() && (r.top > innerHeight || r.bottom < 0));
  });
  $("#mTotal").textContent = brl(calc().total);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#formError");
    const q = calc();
    const f = form.elements;
    [f.nome, f.modelo, f.data].forEach((i) => i.classList.toggle("is-invalid", !i.value.trim()));
    if (!q.picked.length) { err.textContent = "Escolha pelo menos um serviço."; return; }
    if (!f.nome.value.trim() || !f.modelo.value.trim() || !f.data.value) { err.textContent = "Preencha nome, modelo do carro e data."; return; }
    if (new Date(f.data.value + "T12:00").getDay() === 0) { err.textContent = "Não abrimos aos domingos. Escolha outra data."; f.data.classList.add("is-invalid"); return; }
    err.textContent = "";
    const dataBR = f.data.value.split("-").reverse().join("/");
    const msg = [
      `Olá! Sou ${f.nome.value.trim()} e quero agendar pela Reflexo.`,
      ``,
      `Carro: ${f.modelo.value.trim()} (${q.size})`,
      `Serviços: ${q.picked.map((c) => c.dataset.label).join(", ")}`,
      `Total estimado: ${brl(q.total)}${q.disc ? " (com 10% de desconto combo)" : ""}`,
      `Data preferida: ${dataBR}, ${f.periodo.value.toLowerCase()}`,
      f.busca.checked ? `Quero o serviço de leva e traz.` : ``,
    ].filter(Boolean).join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  });
}
