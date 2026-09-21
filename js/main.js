
(() => {
'use strict';

/* ------------------------------------------------------------------
   0. Utilidades
   ------------------------------------------------------------------ */
const S = CONFIG.secciones, N = S.length, P = CONFIG.perfil, C = CONFIG.contacto;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const NS = 'http://www.w3.org/2000/svg';

/** Crea un elemento HTML: h('div', {class:'x', onclick:fn}, hijo1, [hijo2, hijo3]) */
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return e;
}
function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  return e;
}

const ICONS = {
  chevL:  '<path d="M15 5l-7 7 7 7"/>',
  chevR:  '<path d="M9 5l7 7-7 7"/>',
  chevD:  '<path d="M5 9l7 7 7-7"/>',
  mail:   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  code:   '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
  link:   '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 11v6M8 8v.01M12 17v-6M12 13c0-1.6 1-2 2.2-2S17 11.6 17 13v4"/>',
  down:   '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  copy:   '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
  restart:'<path d="M20 12a8 8 0 11-3-6.2M20 4v5h-5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8M10 17h4"/>',
  check:  '<path d="M5 12l4 4 10-10"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  open:   '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>'
};
function icon(name) {
  const s = svgEl('svg', { viewBox: '0 0 24 24', class: 'ico', 'aria-hidden': 'true' });
  s.innerHTML = ICONS[name];
  return s;
}

const parseTime = t => { const m = /^(\d+):(\d{2})\.(\d{3})$/.exec(t); return m ? (+m[1] * 60 + +m[2]) * 1000 + +m[3] : 0; };
const fmtTime = ms => {
  ms = Math.max(0, Math.round(ms));
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 60000))}:${p(Math.floor(ms % 60000 / 1000))}.${p(ms % 1000, 3)}`;
};

/** Anima un número o un cronómetro desde 0 hasta su valor final */
function tween(node, target, format, dur = 900) {
  cancelAnimationFrame(node._raf);
  if (reduce) { node.textContent = format(target); return; }
  const t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    node.textContent = format(target * e);
    if (p < 1) node._raf = requestAnimationFrame(step);
  };
  node._raf = requestAnimationFrame(step);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2400);
}

/* ------------------------------------------------------------------
   1. Datos básicos en la página
   ------------------------------------------------------------------ */
const bindMap = { dorsal: P.dorsal, nombreCompleto: `${P.nombre} ${P.apellidos}` };
$$('[data-bind]').forEach(n => { n.textContent = bindMap[n.dataset.bind] ?? ''; });
const baseTitle = `${P.nombre} ${P.apellidos} · Carta de presentación`;
document.title = baseTitle;

/* ------------------------------------------------------------------
   2. Pantalla de salida: luces y START
   ------------------------------------------------------------------ */
const startEl = $('#start'), gantry = $('#gantry'), statusEl = $('#status'), goBtn = $('#go'), hint = $('#hint');
const wipeEl = $('#wipe'), appEl = $('#app');

for (let i = 0; i < 5; i++) gantry.append(h('div', { class: 'pod' }, h('i', { class: 'lamp' }), h('i', { class: 'lamp' })));
const pods = [...gantry.children];
let timers = [], ready = false, launching = false;
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const setPods = cls => pods.forEach(p => [...p.children].forEach(l => { l.classList.remove('red', 'green'); if (cls) l.classList.add(cls); }));
function setStatus(text, go) { statusEl.textContent = text; statusEl.classList.toggle('is-go', !!go); }

function runLights() {
  timers.forEach(clearTimeout); timers = [];
  ready = false; setPods(null);
  goBtn.disabled = true; goBtn.classList.remove('is-ready');
  setStatus('Vuelta de formación');
  hint.textContent = 'Espera a que las luces se pongan en verde';
  const k = reduce ? 0.25 : 1, t0 = 700 * k, gap = 500 * k;
  pods.forEach((p, i) => later(() => {
    [...p.children].forEach(l => l.classList.add('red'));
    setStatus(i < 4 ? 'Motores en marcha' : 'Preparados');
  }, t0 + gap * i));
  const out = t0 + gap * 5 + 700 * k;
  later(() => { setPods(null); setStatus('Luces fuera'); }, out);
  later(() => { setPods('green'); setStatus('¡Vía libre!', true); }, out + 450 * k);
  later(() => {
    ready = true; goBtn.disabled = false; goBtn.classList.add('is-ready');
    hint.textContent = 'Pulsa START para entrar';
    goBtn.focus({ preventScroll: true });
  }, out + 900 * k);
}

function spawnStreaks() {
  const box = $('#streaks'); box.replaceChildren();
  for (let i = 0; i < 36; i++) {
    const s = h('i');
    s.style.setProperty('--a', (Math.random() * 360).toFixed(1) + 'deg');
    s.style.setProperty('--d', (Math.random() * 0.35).toFixed(2) + 's');
    s.style.setProperty('--l', (60 + Math.random() * 140).toFixed(0) + 'px');
    box.append(s);
  }
}

function launch() {
  if (!ready || launching) return;
  launching = true;
  if (reduce) { startEl.hidden = true; showApp(); launching = false; return; }
  startEl.classList.add('is-launch');
  spawnStreaks();
  later(() => wipeEl.classList.add('is-run'), 450);      // la bandera cubre la pantalla…
  later(() => { startEl.hidden = true; showApp(); }, 450 + 650);   // …y en ese momento cambiamos de pantalla
  later(() => { wipeEl.classList.remove('is-run'); launching = false; }, 450 + 1300);
}
goBtn.addEventListener('click', launch);

function showApp() {
  appEl.classList.add('is-on');
  if (!reduce) { appEl.classList.add('is-intro'); setTimeout(() => appEl.classList.remove('is-intro'), 2200); }
  const i = indexFromHash();
  go(i >= 0 ? i : 0, { first: true });
}

function restart() {
  if (launching) return;
  launching = true;
  const swap = () => {
    appEl.classList.remove('is-on');
    startEl.hidden = false; startEl.classList.remove('is-launch');
    current = -1;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    document.title = baseTitle;
    runLights();
  };
  if (reduce) { swap(); launching = false; return; }
  wipeEl.classList.add('is-run');
  setTimeout(swap, 650);
  setTimeout(() => { wipeEl.classList.remove('is-run'); launching = false; }, 1300);
}

/* ------------------------------------------------------------------
   3. Torre de clasificación (menú)
   ------------------------------------------------------------------ */
const rowsUl = $('#rows'), rows = [], rowTimes = [];
S.forEach((s, i) => {
  const time = h('span', { class: 'row__time' }, s.tiempo);
  const btn = h('button', { class: 'row', type: 'button', style: `--i:${i}`, onclick: () => { go(i); closeDrawer(); } },
    h('span', { class: 'row__pos' }, 'P' + (i + 1)),
    h('span', { class: 'row__name' }, s.nombre),
    time);
  rows.push(btn); rowTimes.push(time);
  rowsUl.append(h('li', null, btn));
});

/* Circuito con el progreso */
const CIRCUIT_PTS = [[40,118],[110,120],[170,118],[205,100],[212,72],[185,58],[160,70],[140,52],[150,30],[120,20],[85,32],[70,55],[45,58],[22,80]];
function closedSpline(pts) {
  const n = pts.length; let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + ' Z';
}
const circuit = { len: 0, prog: null, car: null, cps: [], f: 0 };
(function buildCircuit() {
  const d = closedSpline(CIRCUIT_PTS);
  const svg = svgEl('svg', { viewBox: '0 0 240 150', role: 'img', 'aria-label': 'Progreso por el circuito' });
  circuit.prog = svgEl('path', { d, class: 'c-prog' });
  svg.append(svgEl('path', { d, class: 'c-track' }), svgEl('path', { d, class: 'c-line' }), circuit.prog,
    svgEl('line', { x1: 40, y1: 111, x2: 40, y2: 125, class: 'c-sf' }));
  circuit.car = svgEl('circle', { r: 5, class: 'c-car', cx: 40, cy: 118 });
  const holder = svgEl('g'); svg.append(holder);
  $('#circuit').append(svg);
  try {
    circuit.len = circuit.prog.getTotalLength();
    circuit.prog.style.strokeDasharray = circuit.len;
    circuit.prog.style.strokeDashoffset = circuit.len;
    S.forEach((_, k) => {
      const pt = circuit.prog.getPointAtLength(circuit.len * (k / (N - 1)));
      const cp = svgEl('circle', { cx: pt.x, cy: pt.y, r: 4.5, class: 'c-cp' });
      circuit.cps.push(cp); holder.append(cp);
    });
  } catch (e) { circuit.len = 0; }
  svg.append(circuit.car);
})();
function placeCar(f) {
  if (!circuit.len) return;
  const pt = circuit.prog.getPointAtLength(circuit.len * f);
  circuit.car.setAttribute('cx', pt.x); circuit.car.setAttribute('cy', pt.y);
}
function moveCar(i) {
  if (!circuit.len) return;
  const to = i / (N - 1), from = circuit.f, t0 = performance.now(), dur = reduce ? 1 : 900;
  circuit.prog.style.strokeDashoffset = circuit.len * (1 - to);
  circuit.cps.forEach((cp, k) => cp.classList.toggle('is-done', k <= i));
  cancelAnimationFrame(circuit.raf);
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    circuit.f = from + (to - from) * e; placeCar(circuit.f);
    if (p < 1) circuit.raf = requestAnimationFrame(step);
  };
  circuit.raf = requestAnimationFrame(step);
}

/* Menú móvil (cajón) */
const towerEl = $('#tower'), menuBtn = $('#menuBtn'), scrim = $('#scrim');
function openDrawer()  { towerEl.classList.add('is-open'); scrim.classList.add('is-on'); menuBtn.setAttribute('aria-expanded', 'true'); }
function closeDrawer() { towerEl.classList.remove('is-open'); scrim.classList.remove('is-on'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => towerEl.classList.contains('is-open') ? closeDrawer() : openDrawer());
scrim.addEventListener('click', closeDrawer);

/* ------------------------------------------------------------------
   4. Cabecera común de cada vuelta
   ------------------------------------------------------------------ */
function head(i) {
  const s = S[i];
  return h('header', { class: 'lap__head' },
    h('span', { class: 'pos' }, 'P' + (i + 1)),
    h('div', null,
      h('h2', { class: 'lap__title', id: 't-' + s.clave, tabindex: '-1' }, s.nombre),
      h('p', { class: 'lap__radio' }, s.radio)),
    h('div', { class: 'lap__time' }, h('small', null, 'Tiempo de vuelta'), h('b', null, s.tiempo)));
}

/* ------------------------------------------------------------------
   5. Contenido de cada vuelta
   ------------------------------------------------------------------ */

/* ---- P1 · Sobre mí ---- */
function photoBlock() {
  if (P.foto) return h('img', { src: P.foto, alt: `Foto de ${P.nombre} ${P.apellidos}` });
  const ph = h('div', { class: 'ph', role: 'img', 'aria-label': 'Espacio reservado para tu foto' });
  ph.innerHTML = '<svg viewBox="0 0 200 230" aria-hidden="true"><circle cx="100" cy="76" r="44"/><path d="M14 230c0-58 38-92 86-92s86 34 86 92z"/></svg>' +
                 '<span>Tu foto aquí<small>Indica la ruta en CONFIG.perfil.foto</small></span>';
  return ph;
}
function buildSobreMi() {
  return h('div', { class: 'about' },
    h('figure', { class: 'card' },
      h('div', { class: 'card__photo' }, h('span', { class: 'card__num', 'aria-hidden': 'true' }, P.dorsal), photoBlock()),
      h('figcaption', { class: 'card__plate' }, h('small', null, P.nombre), h('strong', null, P.apellidos), h('span', null, P.titular))),
    h('div', { class: 'about__body' },
      h('div', { class: 'intro' }, P.presentacion.map(t => h('p', null, t))),
      h('div', { class: 'now' }, h('i', { class: 'live', 'aria-hidden': 'true' }),
        h('div', null, h('span', null, 'Estudiando ahora'), h('b', null, P.estudiando.titulo), h('span', null, P.estudiando.detalle))),
      h('dl', { class: 'ficha' }, P.ficha.map(f => h('div', null, h('dt', null, f.etiqueta), h('dd', null, f.valor)))),
      h('div', { class: 'about__cols' },
        h('div', { class: 'block' }, h('h3', null, 'Intereses'), h('div', { class: 'chips' }, P.intereses.map(t => h('span', { class: 'chip' }, t)))),
        h('div', { class: 'block' }, h('h3', null, 'Objetivos profesionales'),
          h('ul', { class: 'goals' }, P.objetivos.map(o => h('li', null, icon('check'), h('b', null, o.titulo), h('span', null, o.texto))))))));
}

/* ---- P2 · Habilidades ---- */
function buildGauge(avg) {
  const cx = 120, cy = 118, r = 92;
  const pt = (v, rad) => { const a = Math.PI * (1 - v / 100); return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)]; };
  const arc = `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`;
  const svg = svgEl('svg', { viewBox: '0 0 240 138', class: 'gauge__svg', 'aria-hidden': 'true' });
  svg.style.setProperty('--avg', avg);
  svg.append(svgEl('path', { d: arc, pathLength: 100, class: 'g-track' }), svgEl('path', { d: arc, pathLength: 100, class: 'g-red' }), svgEl('path', { d: arc, pathLength: 100, class: 'g-fill' }));
  for (let v = 0; v <= 100; v += 5) {
    const major = v % 20 === 0, a = pt(v, r - (major ? 19 : 15)), b = pt(v, r - 9);
    svg.append(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'g-tick' + (major ? ' maj' : '') }));
    if (major) { const l = pt(v, r - 31), t = svgEl('text', { x: l[0], y: l[1], class: 'g-lbl' }); t.textContent = v; svg.append(t); }
  }
  const needle = svgEl('g', { class: 'needle', style: `--ang:${-90 + avg * 1.8}deg` });
  needle.append(svgEl('line', { x1: cx, y1: cy + 12, x2: cx, y2: 42, stroke: '#e10600', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
    svgEl('circle', { cx, cy, r: 8, fill: '#1b1e23', stroke: '#e10600', 'stroke-width': 3 }));
  svg.append(needle);
  return svg;
}
function buildHabilidades() {
  const sk = CONFIG.habilidades;
  const avg = Math.round(sk.reduce((a, b) => a + b.nivel, 0) / sk.length);
  const best = sk.reduce((a, b) => b.nivel > a.nivel ? b : a);
  const val = h('strong', { 'data-count': avg }, '0');
  const gauge = h('div', { class: 'gauge' },
    buildGauge(avg),
    h('div', { class: 'gauge__read' }, val, h('span', null, '%')),
    h('p', { class: 'lbl' }, 'Potencia global'),
    h('div', { class: 'gauge__best' }, h('span', { class: 'fl' }, icon('clock'), 'Vuelta rápida'), h('span', null, `${best.nombre} · ${best.nivel} %`)));
  const bars = h('div', { class: 'bars' }, sk.map((s, r) => {
    const on = Math.round(s.nivel / 5);
    return h('div', { class: 'skill', style: `--r:${r}` },
      h('div', { class: 'skill__top' }, h('b', null, s.nombre), h('small', null, s.grupo),
        s.aprendiendo && h('span', { class: 'tag-learn' }, 'Aprendiendo'),
        h('span', { class: 'lvl' }, s.nivel + ' %')),
      h('div', { class: 'bar', role: 'img', 'aria-label': `${s.nombre}: ${s.nivel} por ciento` },
        Array.from({ length: 20 }, (_, k) => h('i', { class: 'seg' + (k < on ? ' on' : ''), style: `--k:${k}` }))));
  }));
  const wrap = h('div', { class: 'skills' }, gauge, bars);
  wrap._enter = () => tween(val, avg, v => String(Math.round(v)), 1700);
  return wrap;
}

/* ---- P3 · Formación ---- */
function buildFormacion() {
  return h('ol', { class: 'timeline' }, CONFIG.formacion.map(e => {
    const enCurso = e.estado === 'en-curso';
    return h('li', { class: 'etapa etapa--' + e.estado },
      h('div', { class: 'etapa__periodo' }, e.periodo),
      h('div', null,
        h('div', { class: 'etapa__top' }, h('h3', null, e.titulo),
          h('span', { class: 'estado estado--' + e.estado }, enCurso ? h('i') : icon('check'), enCurso ? 'En curso' : 'Finalizado')),
        h('p', { class: 'etapa__centro' }, e.centro),
        h('p', { class: 'etapa__detalle' }, e.detalle),
        e.dato && h('span', { class: 'etapa__dato' }, e.dato)));
  }));
}

/* ---- P4 · Experiencia y proyectos ---- */
function buildExperiencia() {
  return h('div', { class: 'hitos' }, CONFIG.experiencia.map((x, n) => {
    const id = 'hito-' + n;
    const card = h('article', { class: 'hito' + (x.destacado ? ' hito--fl' : '') });
    const toggle = h('button', { class: 'hito__toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': id },
      h('span', null, 'Ver detalles'), icon('chevD'));
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.firstChild.textContent = open ? 'Ocultar detalles' : 'Ver detalles';
    });
    card.append(
      h('div', { class: 'hito__meta' }, h('span', { class: 'hito__tipo' }, x.tipo), h('span', null, x.fecha),
        x.destacado && h('span', { class: 'fl' }, icon('clock'), 'Vuelta rápida')),
      h('h3', null, x.titulo),
      h('p', { class: 'hito__lugar' }, x.lugar),
      h('div', { class: 'hito__metric' }, icon('trophy'), h('strong', null, x.metrica.valor), h('span', null, x.metrica.etiqueta)),
      h('p', null, x.resumen),
      h('div', { class: 'hito__more', id },
        h('div', null, h('ul', null, x.detalles.map(d => h('li', null, d))),
          h('div', { class: 'chips' }, x.tecnologias.map(t => h('span', { class: 'chip' }, t))))),
      toggle);
    return card;
  }));
}

/* ---- P5 · Contacto ---- */
async function copyEmail() {
  try { await navigator.clipboard.writeText(C.email); toast('Correo copiado'); }
  catch (e) {
    const ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = C.email; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {}
    ta.remove(); toast(ok ? 'Correo copiado' : `Copia el correo: ${C.email}`);
  }
}
function buildContacto() {
  const d = C.despedida;
  const linkAct = (href, label) => h('a', { class: 'radio__act', href, target: '_blank', rel: 'noopener noreferrer' }, label, icon('open'));
  const row = (ic, label, value, ...acts) => h('div', { class: 'radio__row' },
    h('span', { class: 'radio__ico' }, icon(ic)), h('div', null, h('small', null, label), h('b', null, value)), acts);
  const cvBtn = (cls) => h('button', { class: cls, type: 'button', onclick: downloadCV }, icon('down'), 'Descargar currículum');
  return h('div', { class: 'finish' },
    h('div', { class: 'flag' },
      h('div', { class: 'flag__check', 'aria-hidden': 'true' }),
      h('div', { class: 'flag__body' },
        h('h3', null, d.titulo), h('p', null, d.texto),
        h('div', { class: 'flag__actions' },
          h('a', { class: 'btn btn--go', href: 'mailto:' + C.email }, icon('mail'), 'Escríbeme'),
          cvBtn('btn'),
          h('button', { class: 'btn', type: 'button', onclick: restart }, icon('restart'), 'Reiniciar carrera')))),
    h('div', { class: 'radio' },
      h('h3', { class: 'radio__title' }, 'Radio de equipo'),
      row('mail', 'Correo electrónico', C.email,
        h('button', { class: 'radio__act', type: 'button', onclick: copyEmail }, icon('copy'), 'Copiar')),
      row('code', 'GitHub', C.github.texto, linkAct(C.github.url, 'Abrir')),
      row('link', 'LinkedIn', C.linkedin.texto, linkAct(C.linkedin.url, 'Abrir')),
      row('down', 'Currículum en PDF', C.cv.archivo ? C.cv.nombreDescarga : 'CV de ejemplo (se genera al pulsar)',
        h('button', { class: 'radio__act', type: 'button', onclick: downloadCV }, icon('down'), 'Descargar'))));
}

/* ---- Currículum: tu PDF o uno de ejemplo generado con tus datos ---- */
function downloadCV() {
  const a = h('a', { download: C.cv.nombreDescarga || 'CV.pdf' });
  if (C.cv.archivo) { a.href = C.cv.archivo; }
  else { a.href = URL.createObjectURL(buildSamplePdf()); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  document.body.append(a); a.click(); a.remove();
  toast('Descargando currículum…');
}
function buildSamplePdf() {
  const lat = s => String(s).replace(/[–—−]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/•/g, '-').replace(/…/g, '...').replace(/[^\x20-\xFF]/g, '?');
  const esc = s => lat(s).replace(/[\\()]/g, '\\$&');
  const wrap = (text, max = 92) => { const out = []; let line = ''; for (const w of lat(text).split(/\s+/)) { if ((line + ' ' + w).trim().length > max) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };
  const L = [];
  const add = (t, s = 10, b = false, dy) => L.push({ t, s, b, dy: dy ?? Math.round(s * 1.4) });
  add(`${P.nombre} ${P.apellidos}`, 24, true, 30);
  add(P.titular, 12, false, 18);
  add(`${C.email}  ·  ${C.github.texto}  ·  ${C.linkedin.texto}`, 9, false, 24);
  add('Perfil', 13, true, 22); P.presentacion.forEach(p => wrap(p).forEach(l => add(l, 10, false, 13)));
  add('Formación', 13, true, 24);
  CONFIG.formacion.forEach(f => { add(`${f.periodo}  -  ${f.titulo}`, 10, true, 16); add(`${f.centro}${f.dato ? '  ·  ' + f.dato : ''}`, 9, false, 12); });
  add('Experiencia y proyectos', 13, true, 24);
  CONFIG.experiencia.forEach(x => { add(`${x.fecha}  -  ${x.titulo} (${x.tipo})`, 10, true, 16); wrap(`${x.resumen} Resultado: ${x.metrica.valor} ${x.metrica.etiqueta}.`).forEach(l => add(l, 9, false, 12)); });
  add('Habilidades', 13, true, 24);
  wrap(CONFIG.habilidades.map(s => `${s.nombre} (${s.nivel} %)`).join('  ·  ')).forEach(l => add(l, 10, false, 13));
  add('Documento de ejemplo generado automáticamente. Sustitúyelo por tu CV en PDF (CONFIG.contacto.cv.archivo).', 8, false, 34);

  let y = 782, content = '0.882 0.024 0 rg 0 808 595 34 re f\n0.06 0.06 0.07 rg\n';
  for (const l of L) { y -= l.dy; if (y < 40) break; content += `BT /F${l.b ? 2 : 1} ${l.s} Tf 56 ${y} Td (${esc(l.t)}) Tj ET\n`; }
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`
  ];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
         `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([Uint8Array.from(pdf, c => c.charCodeAt(0))], { type: 'application/pdf' });
}
window.__buildSamplePdf = buildSamplePdf; // (solo para pruebas)

/* ------------------------------------------------------------------
   6. Montaje de las vueltas y navegación real
   ------------------------------------------------------------------ */
const BUILDERS = { 'sobre-mi': buildSobreMi, habilidades: buildHabilidades, formacion: buildFormacion, experiencia: buildExperiencia, contacto: buildContacto };
const lapsEl = $('#laps');
const sections = S.map((s, i) => {
  const body = BUILDERS[s.clave](i);
  const sec = h('section', { class: 'lap', 'aria-labelledby': 't-' + s.clave, 'data-key': s.clave }, h('div', { class: 'lap__in' }, head(i), body));
  sec._enter = body._enter;
  sec.inert = true;
  lapsEl.append(sec);
  return sec;
});

const prevBtn = $('#prev'), nextBtn = $('#next'), lapLabel = $('#lapLabel'), lapCount = $('#lapCount');
const dotsEl = $('#dots'); S.forEach(() => dotsEl.append(h('i')));
const tbPos = $('#tbPos'), tbName = $('#tbName'), tbTime = $('#tbTime');
let current = -1;
const leaveTimers = [];

const indexFromHash = () => S.findIndex(s => '#' + s.clave === location.hash);

function go(i, opts = {}) {
  i = Math.max(0, Math.min(N - 1, i));
  if (i === current) return;
  const prev = current; current = i;

  sections.forEach((sec, k) => {
    sec.classList.toggle('is-active', k === i);
    sec.classList.toggle('is-before', k < i);
    sec.inert = k !== i;
    sec.setAttribute('aria-hidden', k === i ? 'false' : 'true');
  });
  const sec = sections[i];
  sec.scrollTop = 0;
  clearTimeout(leaveTimers[i]);
  sec.classList.add('is-live');
  if (sec._enter) sec._enter();
  if (prev >= 0) { leaveTimers[prev] = setTimeout(() => { if (current !== prev) sections[prev].classList.remove('is-live'); }, 800); }

  rows.forEach((r, k) => { r.classList.toggle('is-active', k === i); k === i ? r.setAttribute('aria-current', 'page') : r.removeAttribute('aria-current'); });
  tween(rowTimes[i], parseTime(S[i].tiempo), fmtTime, 1000);
  lapCount.textContent = `Vuelta ${i + 1}/${N}`;
  tbPos.textContent = 'P' + (i + 1); tbName.textContent = S[i].nombre; tbTime.textContent = S[i].tiempo;
  document.title = `${S[i].nombre} · ${baseTitle}`;
  moveCar(i);
  updatePager();

  const hash = '#' + S[i].clave;
  if (!opts.fromHash && location.hash !== hash) {
    try { opts.first ? history.replaceState(null, '', hash) : (location.hash = S[i].clave); } catch (e) {}
  }
  if (!opts.first) setTimeout(() => $('h2', sec).focus({ preventScroll: true }), 120);
}

function updatePager() {
  const i = current;
  prevBtn.style.visibility = i > 0 ? 'visible' : 'hidden';
  $('.lbl', prevBtn).textContent = i > 0 ? `P${i} ${S[i - 1].nombre}` : '';
  $('.ico-slot', prevBtn).replaceChildren(icon('chevL'));
  const last = i === N - 1;
  $('.lbl', nextBtn).textContent = last ? 'Reiniciar carrera' : `P${i + 2} ${S[i + 1].nombre}`;
  $('.ico-slot', nextBtn).replaceChildren(icon(last ? 'restart' : 'chevR'));
  lapLabel.textContent = `Vuelta ${i + 1} de ${N}`;
  [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k <= i));
  prevBtn.setAttribute('aria-label', i > 0 ? `Vuelta anterior: ${S[i - 1].nombre}` : '');
  nextBtn.setAttribute('aria-label', last ? 'Reiniciar carrera' : `Siguiente vuelta: ${S[i + 1].nombre}`);
}
prevBtn.addEventListener('click', () => go(current - 1));
nextBtn.addEventListener('click', () => current < N - 1 ? go(current + 1) : restart());

/* Botón atrás/adelante del navegador y enlaces con #clave */
addEventListener('hashchange', () => {
  if (!appEl.classList.contains('is-on')) return;
  const i = indexFromHash(); if (i >= 0) go(i, { fromHash: true });
});

/* Teclado */
addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (!startEl.hidden) { if ((e.key === 'Enter' || e.key === ' ') && ready && document.activeElement !== goBtn) { e.preventDefault(); launch(); } return; }
  if (!appEl.classList.contains('is-on') || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
  if (e.key === 'Escape') closeDrawer();
  else if (e.key === 'ArrowRight') go(current + 1);
  else if (e.key === 'ArrowLeft') go(current - 1);
  else if (/^[1-9]$/.test(e.key) && +e.key <= N) go(+e.key - 1);
});

/* Deslizar en el móvil */
let tx = 0, ty = 0;
lapsEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
lapsEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 80 && Math.abs(dy) < 45) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });

/* ------------------------------------------------------------------
   7. ¡Luces!
   ------------------------------------------------------------------ */
updatePager.call(null);
runLights();
})();
