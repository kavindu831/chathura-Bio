/* ===========================================================
   Video library: upload (stored in this browser via IndexedDB),
   add YouTube links, search, filter, play, delete.
   =========================================================== */
(function(){
  const DB_NAME = "bioTutorVideos", STORE = "videos";
  const $ = s => document.querySelector(s);
  let db, all = [], filter = "All", query = "";

  function openDB(){
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, {keyPath:"id", autoIncrement:true});
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  const tx = (mode, fn) => new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error);
  });
  const loadAll = async () => { all = (await tx("readonly", s => s.getAll())) || []; all.sort((a,b) => b.date - a.date); };

  function ytId(url){
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null;
  }
  function fmtSize(b){ return b > 1e9 ? (b/1e9).toFixed(2)+" GB" : (b/1e6).toFixed(1)+" MB"; }
  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  function makeThumb(file){
    return new Promise(res => {
      const v = document.createElement("video"), url = URL.createObjectURL(file);
      v.muted = true; v.preload = "metadata"; v.src = url;
      const done = t => { URL.revokeObjectURL(url); res(t); };
      v.onloadeddata = () => { v.currentTime = Math.min(2, (v.duration||2)/2); };
      v.onseeked = () => {
        try{
          const c = document.createElement("canvas"); c.width = 480; c.height = 270;
          c.getContext("2d").drawImage(v, 0, 0, 480, 270); done(c.toDataURL("image/jpeg", .7));
        }catch(e){ done(null); }
      };
      v.onerror = () => done(null);
      setTimeout(() => done(null), 8000);
    });
  }

  /* ---------- Rendering ---------- */
  function cardHTML(v, i){
    const thumb = v.thumb ? `style="background-image:url('${v.thumb}')"` :
      (v.type === "youtube" ? `style="background-image:url('https://img.youtube.com/vi/${v.ytId}/hqdefault.jpg')"` : "");
    return `<article class="vcard" style="animation-delay:${i*0.06}s">
      <div class="vthumb" ${thumb} data-play="${v.id}"><span class="vcat">${esc(v.category)}</span><span class="play">▶</span></div>
      <div class="vbody"><h3>${esc(v.title)}</h3><p>${esc(v.desc || "No description")}</p>
        <div class="vmeta"><span>${new Date(v.date).toLocaleDateString()} · ${v.type === "youtube" ? "YouTube" : fmtSize(v.size)}</span>
        <button class="btn btn-danger btn-sm" data-del="${v.id}">Delete</button></div></div></article>`;
  }
  function placeholderHTML(){
    return `<div class="empty"><div class="big">🎬</div><h3>No videos yet</h3>
      <p style="margin:8px 0 18px">Click <b>Upload Video</b> to add your first class recording.</p></div>`;
  }

  function render(){
    const grid = $("#vgrid"); if(!grid) return;
    const list = all.filter(v => (filter === "All" || v.category === filter) &&
      (v.title + " " + (v.desc||"")).toLowerCase().includes(query));
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : placeholderHTML();
    const cats = ["All", ...new Set(all.map(v => v.category))];
    const chips = $("#chips");
    if(chips) chips.innerHTML = cats.map(c => `<button class="chip ${c===filter?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
    const cnt = $("#vcount"); if(cnt) cnt.textContent = all.length;
  }
  function renderLatest(){
    const box = $("#latest-videos"); if(!box) return;
    box.innerHTML = all.length ? all.slice(0,3).map(cardHTML).join("") :
      `<div class="empty"><div class="big">🎬</div><h3>Class recordings coming soon</h3>
       <p style="margin:8px 0 18px">Upload your first lesson from the Video Library page.</p>
       <a class="btn btn-primary" href="videos.html">Go to Video Library</a></div>`;
  }

  /* ---------- Player ---------- */
  let currentURL = null;
  function play(id){
    const v = all.find(x => x.id == id); if(!v) return;
    const box = $("#player-box");
    if(v.type === "youtube") box.innerHTML = `<iframe src="https://www.youtube.com/embed/${v.ytId}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    else { currentURL = URL.createObjectURL(v.blob); box.innerHTML = `<video src="${currentURL}" controls autoplay></video>`; }
    $("#player-title").textContent = v.title; $("#player-desc").textContent = v.desc || "";
    $("#player-modal").classList.add("open");
  }
  function closePlayer(){
    $("#player-modal").classList.remove("open"); $("#player-box").innerHTML = "";
    if(currentURL){ URL.revokeObjectURL(currentURL); currentURL = null; }
  }

  /* ---------- Upload ---------- */
  let chosen = null;
  function setFile(f){
    if(!f) return;
    if(!f.type.startsWith("video/")){ toast("Please choose a video file 🎥"); return; }
    chosen = f; $("#drop-text").innerHTML = `<b>${esc(f.name)}</b><br><small>${fmtSize(f.size)}</small>`;
    if(!$("#u-title").value) $("#u-title").value = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  }
  async function saveUpload(e){
    e.preventDefault();
    const mode = document.querySelector("#upload-tabs .tab-btn.active").dataset.tab;
    const rec = { title: $("#u-title").value.trim(), category: $("#u-cat").value, desc: $("#u-desc").value.trim(), date: Date.now() };
    const bar = $("#bar"), fill = $("#bar i"), btn = $("#u-submit");
    if(!rec.title){ toast("Please enter a title"); return; }
    if(mode === "tab-file"){
      if(!chosen){ toast("Please choose a video file first"); return; }
      btn.disabled = true; bar.style.display = "block"; fill.style.width = "15%";
      rec.type = "file"; rec.blob = chosen; rec.size = chosen.size; rec.thumb = await makeThumb(chosen); fill.style.width = "60%";
    } else {
      const id = ytId($("#u-yt").value.trim());
      if(!id){ toast("Please paste a valid YouTube link"); return; }
      rec.type = "youtube"; rec.ytId = id; btn.disabled = true;
    }
    try{
      await tx("readwrite", s => s.add(rec)); fill.style.width = "100%";
      await loadAll(); render(); renderLatest();
      setTimeout(() => { closeUpload(); toast("Video added successfully ✅"); }, 350);
    }catch(err){
      toast("Could not save – the file may be too large for this browser storage."); console.error(err);
    }
    btn.disabled = false;
  }
  function closeUpload(){
    $("#upload-modal").classList.remove("open"); $("#upload-form").reset(); chosen = null;
    $("#drop-text").innerHTML = "<b>Drag & drop</b> your video here<br><small>or click to browse (MP4, MOV, WEBM…)</small>";
    $("#bar").style.display = "none"; $("#bar i").style.width = "0";
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    try{ db = await openDB(); await loadAll(); }catch(e){ console.warn("Storage unavailable", e); all = []; }
    render(); renderLatest();

    document.addEventListener("click", async e => {
      const p = e.target.closest("[data-play]"), d = e.target.closest("[data-del]"), c = e.target.closest("[data-cat]");
      if(p) play(p.dataset.play);
      if(c){ filter = c.dataset.cat; render(); }
      if(d && confirm("Delete this video from your library?")){
        await tx("readwrite", s => s.delete(+d.dataset.del)); await loadAll(); render(); renderLatest(); toast("Video deleted");
      }
    });

    const s = $("#search"); if(s) s.addEventListener("input", () => { query = s.value.toLowerCase(); render(); });
    const openBtn = $("#open-upload"); if(!openBtn) return;
    openBtn.onclick = () => $("#upload-modal").classList.add("open");
    $("#upload-close").onclick = closeUpload; $("#player-close").onclick = closePlayer;
    [$("#upload-modal"), $("#player-modal")].forEach(m => m.addEventListener("mousedown", e => {
      if(e.target === m){ m === $("#player-modal") ? closePlayer() : closeUpload(); } }));
    addEventListener("keydown", e => { if(e.key === "Escape"){ closePlayer(); closeUpload(); } });

    const drop = $("#drop"), input = $("#file-input");
    drop.onclick = () => input.click();
    input.onchange = () => setFile(input.files[0]);
    ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));
    $("#upload-form").addEventListener("submit", saveUpload);
  });
})();
