/* ===========================================================
   Chathura Gunawardhana – Biology Tutor | Main Script
   ✏️  EDIT YOUR DETAILS & SOCIAL LINKS HERE (only place needed)
   =========================================================== */
const CONFIG = {
  name: "Chathura Gunawardhana",
  title: "Biology Tutor",
  email: "chathuragunawardhana39@gmail.com",
  phone: "0729427404",            // shown on the site
  whatsapp: "94729427404",        // international format, no + or spaces
  location: "Matara, Sri Lanka",
  // 👇 Replace these sample links with your official links later
  social: {
    facebook: "https://www.facebook.com/chathura.gunawardhana0309",
    tiktok:   "https://www.tiktok.com/@your.account",
    youtube:  "https://youtube.com/@chathuragunawardhana-biology?si=2n4jj2egFJ4SRMqI"
  }
};
window.CONFIG = CONFIG;

const ICONS = {
  facebook:'<svg viewBox="0 0 24 24"><path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.4-.2-2.6-.2-2.7 0-4.4 1.6-4.4 4.6v2.3H7v3.3h2.9V22h3.6z"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24"><path d="M16.6 3c.3 2.3 1.7 3.8 4 4v3.3c-1.4.1-2.7-.3-4-1.1v6.1c0 3.9-3.2 6-6.2 5.6-2.6-.4-4.6-2.6-4.4-5.4.2-3 2.9-5 5.9-4.5v3.4c-1.5-.5-2.9.4-3 1.8-.1 1.4 1 2.4 2.2 2.3 1.2-.1 1.9-1 1.9-2.3V3h3.6z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24"><path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>'
};

const PAGES = [
  ["index.html","Home"],["about.html","About"],["classes.html","Classes"],
  ["videos.html","Video Library"],["contact.html","Contact"]
];

function socialLinks(){
  return Object.entries(CONFIG.social).map(([k,url]) =>
    `<a class="social" href="${url}" target="_blank" rel="noopener" aria-label="${k}" title="${k}">${ICONS[k]}</a>`).join("");
}

function buildChrome(){
  const here = (location.pathname.split("/").pop() || "index.html");
  const header = document.getElementById("site-header");
  if(header){
    header.innerHTML = `
    <div id="progress"></div>
    <nav class="nav"><div class="container">
      <a href="index.html" class="logo"><span class="logo-mark">🧬</span>
        <span>${CONFIG.name.split(" ")[0]} <span class="grad-text">Bio</span><small>${CONFIG.title.toUpperCase()}</small></span></a>
      <div class="menu" id="menu">
        ${PAGES.map(([h,t]) => `<a href="${h}" class="${h===here?'active':''}">${t}</a>`).join("")}
      </div>
      <button class="burger" id="burger" aria-label="Menu">☰</button>
    </div></nav>`;
  }
  const footer = document.getElementById("site-footer");
  if(footer){
    footer.innerHTML = `
    <footer><div class="container">
      <div class="foot-grid">
        <div><a href="index.html" class="logo" style="margin-bottom:14px"><span class="logo-mark">🧬</span><span>${CONFIG.name}</span></a>
          <p style="color:var(--muted);max-width:340px;margin-bottom:18px">Making Biology simple, visual and exciting for every student. Learn anywhere with recorded classes.</p>
          <div class="socials">${socialLinks()}</div></div>
        <div><h4>Quick Links</h4><ul>${PAGES.map(([h,t])=>`<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
        <div><h4>Contact</h4><ul>
          <li>📧 <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
          <li>📞 <a href="tel:${CONFIG.phone}">${CONFIG.phone}</a></li>
          <li>📍 ${CONFIG.location}</li></ul></div>
      </div>
      <div class="copy">© ${new Date().getFullYear()} ${CONFIG.name}. All rights reserved.</div>
    </div></footer>
    <a class="wa-float" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">💬 <span>WhatsApp me</span></a>
    <button id="toTop" aria-label="Back to top">↑</button>
    <div id="glow"></div><div class="toast" id="toast"></div>`;
  }
  // fill any [data-cfg] placeholders on pages
  document.querySelectorAll("[data-cfg]").forEach(el => { el.textContent = CONFIG[el.dataset.cfg]; });
  document.querySelectorAll("[data-social]").forEach(el => { el.href = CONFIG.social[el.dataset.social]; });
  const so = document.getElementById("social-slot"); if(so) so.innerHTML = socialLinks();
}

function toast(msg){
  const t = document.getElementById("toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("show"), 3200);
}
window.toast = toast;

function initNav(){
  const nav = document.querySelector(".nav"), prog = document.getElementById("progress"), top = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if(nav) nav.classList.toggle("scrolled", y > 30);
    if(prog) prog.style.width = (h>0 ? y/h*100 : 0) + "%";
    if(top) top.classList.toggle("show", y > 500);
  };
  addEventListener("scroll", onScroll, {passive:true}); onScroll();
  const burger = document.getElementById("burger"), menu = document.getElementById("menu");
  if(burger) burger.onclick = () => { menu.classList.toggle("open"); burger.textContent = menu.classList.contains("open") ? "✕" : "☰"; };
  if(top) top.onclick = () => scrollTo({top:0, behavior:"smooth"});
  const glow = document.getElementById("glow");
  if(glow && matchMedia("(pointer:fine)").matches)
    addEventListener("mousemove", e => { glow.style.left = e.clientX+"px"; glow.style.top = e.clientY+"px"; });
  else if(glow) glow.style.display = "none";
}

function initReveal(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add("in");
      if(e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    }
  }), {threshold:.15});
  document.querySelectorAll(".reveal,[data-count]").forEach((el,i) => {
    if(el.classList.contains("reveal") && el.parentElement.classList.contains("grid")) el.style.transitionDelay = (i%4)*0.1+"s";
    io.observe(el);
  });
}

function countUp(el){
  const target = +el.dataset.count, suffix = el.dataset.suffix || "", dur = 1600, t0 = performance.now();
  (function tick(t){
    const p = Math.min((t-t0)/dur, 1), eased = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(target*eased).toLocaleString() + suffix;
    if(p < 1) requestAnimationFrame(tick);
  })(t0);
}

function initTyped(){
  const el = document.getElementById("typed"); if(!el) return;
  const words = (el.dataset.words || "").split("|");
  let w = 0, c = 0, del = false;
  (function loop(){
    const word = words[w];
    el.textContent = word.slice(0, c);
    if(!del && c === word.length){ del = true; return setTimeout(loop, 1400); }
    if(del && c === 0){ del = false; w = (w+1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(loop, del ? 45 : 95);
  })();
}

function initTabs(){
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const btns = group.querySelectorAll(".tab-btn"), panels = group.querySelectorAll(".tab-panel");
    const open = id => {
      btns.forEach(b => b.classList.toggle("active", b.dataset.tab === id));
      panels.forEach(p => p.classList.toggle("active", p.id === id));
    };
    btns.forEach(b => b.addEventListener("click", () => open(b.dataset.tab)));
    open(btns[0].dataset.tab);
  });
}

function initTilt(){
  if(!matchMedia("(pointer:fine)").matches) return;
  document.querySelectorAll(".tilt").forEach(c => {
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
      c.style.transform = `perspective(800px) rotateX(${-y*8}deg) rotateY(${x*8}deg) translateY(-4px)`;
    });
    c.addEventListener("mouseleave", () => c.style.transform = "");
  });
}

function initDNA(){
  const dna = document.getElementById("dna"); if(!dna) return;
  const n = 15;
  for(let i=0;i<n;i++){
    const r = document.createElement("div");
    r.className = "rung"; r.style.top = (i*(430/n))+"px"; r.style.setProperty("--d", (-i*0.2)+"s");
    r.innerHTML = '<i></i><span class="a"></span><span class="b"></span>';
    dna.appendChild(r);
  }
}

/* Floating cells / molecules canvas */
function initCanvas(){
  const cv = document.getElementById("bg-canvas"); if(!cv) return;
  const ctx = cv.getContext("2d"); let W, H, pts = [], mouse = {x:-999,y:-999};
  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
    pts = Array.from({length: Math.min(70, Math.floor(W/18))}, () => ({
      x:Math.random()*W, y:Math.random()*H, r:Math.random()*5+2,
      vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45, c:Math.random()>.5?"52,211,153":"34,211,238"})); };
  resize(); addEventListener("resize", resize);
  cv.parentElement.addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; });
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach((p,i) => {
      const dx = p.x-mouse.x, dy = p.y-mouse.y, d = Math.hypot(dx,dy);
      if(d < 120){ p.x += dx/d*1.5; p.y += dy/d*1.5; }
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx *= -1; if(p.y<0||p.y>H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle = `rgba(${p.c},.55)`; ctx.fill();
      ctx.strokeStyle = `rgba(${p.c},.25)`; ctx.lineWidth = 1; ctx.stroke();
      for(let j=i+1;j<pts.length;j++){
        const q = pts[j], dd = Math.hypot(p.x-q.x, p.y-q.y);
        if(dd < 110){ ctx.strokeStyle = `rgba(52,211,153,${.18*(1-dd/110)})`; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
      }
    });
    requestAnimationFrame(draw);
  })();
}

/* Contact form -> opens email app (works without a server) */
function initContactForm(){
  const f = document.getElementById("contact-form"); if(!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(f);
    const body = `Name: ${d.get("name")}\nPhone: ${d.get("phone")}\nGrade: ${d.get("grade")}\n\n${d.get("message")}`;
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Class enquiry – "+d.get("name"))}&body=${encodeURIComponent(body)}`;
    toast("Opening your email app… ✉️");
  });
  const wa = document.getElementById("wa-send");
  if(wa) wa.addEventListener("click", () => {
    const d = new FormData(f);
    const msg = `Hello sir, I'm ${d.get("name")||""} (${d.get("grade")||"grade?"}). ${d.get("message")||"I would like to join your Biology class."}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildChrome(); initNav(); initReveal(); initTyped(); initTabs(); initTilt(); initDNA(); initCanvas(); initContactForm();
});
