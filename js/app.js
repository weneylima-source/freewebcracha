/* FreeWebCrachá — estado, formulário, pré-visualização e eventos */
"use strict";

const LS_KEY = "freewebcracha-config-v2";
const LS_KEY_ANTIGA = "gerador-crachas-v1";
let S = clone(PADRAO);

/* ===================== UTILITÁRIOS ===================== */
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function $(s,r=document){ return r.querySelector(s); }
function $$(s,r=document){ return [...r.querySelectorAll(s)]; }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("on"),2600); }
function download(blob, nome){
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=nome; document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},1500);
}
function slug(s){ return String(s||"cracha").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"cracha"; }
function fmtNum(n){ return (Math.round(n*100)/100).toString().replace(".",","); }

/* ===================== CONFIGURAÇÃO (com compatibilidade de versões anteriores) ===================== */
function migrar(o){
  o = o || {};
  if(o.furoTipo === undefined && o.furo !== undefined) o.furoTipo = o.furo ? "centro" : "nenhum";
  if(o.layout === undefined && o.estilo) o.layout = {faixa:"classico", gradiente:"degrade", curva:"curva", limpo:"minimalista"}[o.estilo] || "classico";
  const ex = Object.assign({}, PADRAO.exibir, o.exibir || {});
  if(o.mostrarFoto === false) ex.foto = false;
  if(o.mostrarCat === false) ex.categoria = false;
  if(o.mostrarCodigo === false) ex.codigo = false;
  ["furo","estilo","mostrarFoto","mostrarCat","mostrarCodigo"].forEach(k=>delete o[k]);
  if(o.layout === "listras") o.layout = "capsula";
  if(o.paleta === undefined) o.paleta = "";
  const s = Object.assign(clone(PADRAO), o);
  s.exibir = ex;
  s.cantos = Object.assign({}, PADRAO.cantos, o.cantos || {});
  if(!Array.isArray(s.fontesImp)) s.fontesImp = [];
  if(!LAYOUTS.some(l=>l.id===s.layout)) s.layout = "classico";
  if(!FONTES.some(f=>f.nome===s.fonte) && !s.fontesImp.some(f=>f.nome===s.fonte)) s.fonte = "Roboto";
  return s;
}
function salvarLocal(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }
  catch(e){ try{ const s = clone(S); s.patroc=[]; s.foto=""; localStorage.setItem(LS_KEY, JSON.stringify(s)); }catch(_){} }
}
function carregarLocal(){
  try{
    const t = localStorage.getItem(LS_KEY) || localStorage.getItem(LS_KEY_ANTIGA);
    if(t) S = migrar(JSON.parse(t));
  }catch(e){}
}

/* dados de um crachá: formulário + (no lote) a linha da planilha */
function dadosRegistro(i){
  const d = Object.assign({}, S);
  d.exibir = Object.assign({}, S.exibir);
  if(LOTE.length && i != null && LOTE[i]){
    const r = LOTE[i];
    for(const k of ["nome","destaque","cargo","empresa","categoria","codigo","validade","regOrgao","regNumero"]) if(r[k] !== undefined && r[k] !== "") d[k] = r[k];
    if(!r.destaque) d.destaque = "";   // o destaque do formulário não vale para as outras pessoas
    if(r.categoria){
      const key = Object.keys(CATEGORIAS).find(c=>c.toLowerCase()===r.categoria.trim().toLowerCase());
      if(key) d.corCat = CATEGORIAS[key];
    }
    if(r.validade && /^\d{2}\/\d{2}\/\d{4}$/.test(r.validade)){ const p=r.validade.split("/"); d.validade=p[2]+"-"+p[1]+"-"+p[0]; }
  }
  d._qr = qrConteudo(d);
  return d;
}

/* ===================== PRÉ-VISUALIZAÇÃO ===================== */
function render(){
  const d = dadosRegistro(LOTE.length ? REC : null);
  const stage = $("#stage");
  const lados = S.vista==="ambos" ? ["frente","verso"] : [S.vista];
  stage.innerHTML = lados.map(l=>`<div class="pv"><div class="box">${l==="frente"?frenteHTML(d):versoHTML(d)}</div><div class="lbl">${l==="frente"?"Frente":"Verso"}</div></div>`).join("");
  $$(".face", stage).forEach(ajustarFace);
  escalar();
  $("#dimLbl").textContent = `${fmtNum(S.w/10)} × ${fmtNum(S.h/10)} cm · ${S.w>S.h?"Horizontal":"Vertical"}`;
  $$("#viewSeg button").forEach(b=>b.classList.toggle("on", b.dataset.v===S.vista));
  infoImpressao();
}
function escalar(){
  const wrap = $("#stageWrap"), stage = $("#stage");
  const boxes = $$(".pv .box", stage); if(!boxes.length) return;
  const W = wrap.clientWidth - 60, H = wrap.clientHeight - 90;
  const fw = S.w*PX_MM, fh = S.h*PX_MM;
  let e, dir = "row";
  if(boxes.length === 1) e = Math.min(W/fw, H/fh);
  else {
    const lado = Math.min((W-28)/(fw*2), H/fh), empil = Math.min(W/fw, (H-50)/(fh*2));
    if(empil > lado*1.1){ e = empil; dir = "column"; } else e = lado;
  }
  e = Math.max(0.1, Math.min(e, 4));
  stage.style.flexDirection = dir;
  stage.style.gap = dir==="row" ? "28px" : "14px";
  boxes.forEach(b=>{ b.style.width = fw*e+"px"; b.style.height = fh*e+"px"; b.firstElementChild.style.transform = `scale(${e})`; });
}

/* ===================== CORES RGB ===================== */
function montarCores(){
  $$(".cor[data-cor]").forEach(el=>{
    const nome = el.dataset.nome ? `<span class="cn">${el.dataset.nome}</span>` : "";
    el.innerHTML = nome +
      `<label class="sw" title="Escolher visualmente"><i></i><input type="color"></label>`+
      `<label class="ch">R<input type="number" min="0" max="255" data-c="0"></label>`+
      `<label class="ch">G<input type="number" min="0" max="255" data-c="1"></label>`+
      `<label class="ch">B<input type="number" min="0" max="255" data-c="2"></label>`+
      `<code></code>`;
  });
}
function mostrarCor(el){
  const hex = S[el.dataset.cor] || "#000000", rgb = hexRgb(hex);
  $$("input[data-c]", el).forEach(i=>{ if(document.activeElement !== i) i.value = rgb[+i.dataset.c]; });
  $("input[type=color]", el).value = hex;
  $(".sw i", el).style.background = hex;
  $("code", el).textContent = hex.toUpperCase();
}
/* mudar uma das 4 cores da paleta à mão torna a paleta "Personalizada" */
function corMudou(k){
  if(["cor1","cor2","fundo","corTexto"].includes(k)){ S.paleta = ""; $("#selPaleta").value = ""; }
}
function corDigitada(el){
  const v = $$("input[data-c]", el).map(i=>{ let n = parseInt(i.value,10); return isNaN(n) ? 0 : Math.max(0,Math.min(255,n)); });
  S[el.dataset.cor] = rgbHex(v[0],v[1],v[2]);
  corMudou(el.dataset.cor); mostrarCor(el); mudou();
}

/* ===================== FORMULÁRIO ===================== */
function preencherForm(){
  $$("[data-k]").forEach(el=>{
    const k = el.dataset.k, v = S[k];
    if(el.type === "checkbox") el.checked = !!v; else el.value = v == null ? "" : v;
  });
  $$("[data-x]").forEach(el=>{ el.checked = !!S.exibir[el.dataset.x]; });
  $$("[data-canto]").forEach(el=>{ el.checked = S.cantos[el.dataset.canto] !== false; });
  $("#moldura").value = S.moldura ? "1" : "0";
  $("#selPaleta").value = S.paleta == null ? "" : String(S.paleta);
  $("#marcaOpacLbl").textContent = S.marcaOpac + "%";
  listaFontes();
  visibilidade();
  $$(".f[data-campo]").forEach(f=>f.classList.toggle("off", !S.exibir[f.dataset.campo]));
  $$(".cor[data-cor]").forEach(mostrarCor);
  $("#modelo").value = S.modelo;
  $("#orient").value = S.w > S.h ? "h" : "v";
  $("#thLogo").style.backgroundImage = cssUrl(S.logo);
  $("#thFoto").style.backgroundImage = cssUrl(S.foto);
  listaPatroc();
  infoModelo();
}
/* mostra só os controles que fazem sentido para as opções escolhidas */
function visibilidade(){
  $("#boxCorCat").classList.toggle("hidden", S.tarjaCor !== "categoria");
  $("#boxCorTarja").classList.toggle("hidden", S.tarjaCor !== "personalizada");
  $("#boxMolEsp").classList.toggle("hidden", !S.moldura);
  $("#boxMolCor").classList.toggle("hidden", !S.moldura);
  $("#qrTextoBox").classList.toggle("hidden", S.qrTipo !== "texto");
  const semMarca = !S.marca || S.marca === "nenhuma";
  $("#boxMarca").classList.toggle("hidden", semMarca);
  $("#boxMarcaVerso").classList.toggle("hidden", semMarca);
}

/* ===================== FONTES ===================== */
function listaFontes(){
  const sel = $("#selFonte");
  sel.innerHTML =
    `<optgroup label="Fontes embutidas">`+FONTES.map(f=>`<option value="${esc(f.nome)}" style="font-family:${fonteCss(f.nome)}">${esc(f.nome)}</option>`).join("")+`</optgroup>`+
    (S.fontesImp.length ? `<optgroup label="Fontes importadas">`+S.fontesImp.map(f=>`<option value="${esc(f.nome)}" style="font-family:${fonteCss(f.nome)}">${esc(f.nome)}</option>`).join("")+`</optgroup>` : "");
  sel.value = S.fonte;
  $("#amostraFonte").style.fontFamily = fonteCss(S.fonte);
  $("#fontesImp").innerHTML = S.fontesImp.map((f,i)=>`<span style="font-family:${fonteCss(f.nome)}">${esc(f.nome)}<button title="Remover" data-rmf="${i}">×</button></span>`).join("");
}
async function registrarFonte(nome, data){
  try{ const ff = new FontFace(nome, `url(${data})`); await ff.load(); document.fonts.add(ff); return true; }
  catch(e){ console.error(e); return false; }
}
async function importarFontes(files){
  for(const f of files){
    const data = await new Promise((ok,erro)=>{ const fr = new FileReader(); fr.onload=()=>ok(fr.result); fr.onerror=erro; fr.readAsDataURL(f); });
    let nome = f.name.replace(/\.(ttf|otf|woff2?)$/i,"").replace(/[-_]+/g," ").replace(/[^\p{L}\p{N} ]/gu,"").trim() || "Fonte importada";
    if(FONTES.some(x=>x.nome===nome) || S.fontesImp.some(x=>x.nome===nome)) nome += " importada";
    if(!(await registrarFonte(nome, data))){ toast(`Não foi possível ler a fonte ${f.name}.`); continue; }
    S.fontesImp.push({nome, data});
    S.fonte = nome;
    toast(`Fonte "${nome}" importada.`);
  }
  listaFontes(); mudou();
}
/* carrega as fontes antes de medir o texto (o ajuste automático depende da largura real das letras) */
function carregarFontes(){
  if(!document.fonts || !document.fonts.load) return Promise.resolve();
  const pesos = [400,700,800];
  return Promise.all(FONTES.flatMap(f=>pesos.map(w=>document.fonts.load(`${w} 16px "${f.nome}"`).catch(()=>{}))));
}

function infoModelo(){
  const m = MODELOS[S.modelo] || MODELOS.custom;
  $("#modeloInfo").innerHTML = `<b>Medida:</b> ${m.medida}<br><b>Norma:</b> ${m.norma}<br><b>Uso:</b> ${m.uso}`;
}
function aplicarModelo(id){
  const m = MODELOS[id]; S.modelo = id;
  if(id !== "custom"){
    S.w = m.w; S.h = m.h; S.raio = m.raio;
    if(m.cat){ S.categoria = m.cat; S.corCat = CATEGORIAS[m.cat] || S.corCat; }
    if(S.patrocLocal !== "nenhum") S.patrocLocal = m.patroc || "verso";
  }
  preencherForm(); mudou();
}
function detectaModelo(){
  const id = Object.keys(MODELOS).find(k=>k!=="custom" && Math.abs(MODELOS[k].w-S.w)<.05 && Math.abs(MODELOS[k].h-S.h)<.05);
  if(!id) S.modelo = "custom";
  else if(!(MODELOS[S.modelo] && MODELOS[S.modelo].w===MODELOS[id].w && MODELOS[S.modelo].h===MODELOS[id].h)) S.modelo = id;
  $("#modelo").value = S.modelo; $("#orient").value = S.w > S.h ? "h" : "v"; infoModelo();
}
function listaPatroc(){
  $("#spList").innerHTML = (S.patroc||[]).map((p,i)=>`<div class="it"><div class="thumb" style="background-image:${cssUrl(p)}"></div><button title="Remover" data-sp="${i}">×</button></div>`).join("");
}
let _t;
function mudou(){
  clearTimeout(_t);
  _t = setTimeout(()=>{ render(); salvarLocal(); }, 60);
}
function lerImagem(file, max){
  return new Promise((ok,erro)=>{
    const fr = new FileReader();
    fr.onerror = erro;
    fr.onload = () => {
      const src = fr.result;
      if(/svg/.test(file.type)) return ok(src);
      const img = new Image();
      img.onload = () => {
        const e = Math.min(1, max / Math.max(img.width, img.height));
        if(e === 1 && file.size < 400000) return ok(src);
        const c = document.createElement("canvas"); c.width = Math.round(img.width*e); c.height = Math.round(img.height*e);
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        ok(c.toDataURL(/png|gif|webp/.test(file.type) ? "image/png" : "image/jpeg", .9));
      };
      img.onerror = () => ok(src);
      img.src = src;
    };
    fr.readAsDataURL(file);
  });
}
function atualizaLote(){
  const info = $("#csvInfo"), nav = $("#recNav");
  if(!LOTE.length){ info.classList.add("hidden"); nav.classList.add("hidden"); return; }
  info.classList.remove("hidden");
  info.innerHTML = `<b>${LOTE.length}</b> pessoas no lote. A impressão vai gerar um crachá para cada linha (o campo "Cópias" é ignorado). Use as setas acima da pré-visualização para conferir cada uma.`;
  nav.classList.remove("hidden");
  $("#recLbl").textContent = `${REC+1} de ${LOTE.length}`;
}

/* ===================== INÍCIO E EVENTOS ===================== */
function iniciar(){
  $("#modelo").innerHTML = Object.entries(MODELOS).map(([k,m])=>`<option value="${k}">${m.nome}</option>`).join("");
  $("#catList").innerHTML = Object.keys(CATEGORIAS).map(c=>`<option value="${c}">`).join("");
  $("#selLayout").innerHTML = LAYOUTS.map((L,i)=>`<option value="${L.id}">${String(i+1).padStart(2,"0")} — ${L.nome}  (logo ${L.logo==="acima"?"acima":"ao lado"}, texto ${L.txt==="centro"?"centralizado":"à esquerda"})</option>`).join("");
  $("#selPaleta").innerHTML = `<option value="">Personalizada (cores escolhidas à mão)</option>` +
    PALETAS.map((p,i)=>`<option value="${i}">${String(i+1).padStart(2,"0")} — ${p[0]}  (${p[1].toUpperCase()} · ${p[2].toUpperCase()})</option>`).join("");
  $("#selMarca").innerHTML = MARCAS.map((m,i)=>`<option value="${m.id}">${i ? String(i).padStart(2,"0")+" — " : ""}${m.nome}</option>`).join("");
  montarCores();

  carregarLocal();
  preencherForm();
  aplicarTema(document.documentElement.dataset.tema || "claro");
  $("#btnTema").onclick = alternarTema;

  document.addEventListener("input", e=>{
    const el = e.target;
    // cores
    const cor = el.closest && el.closest(".cor[data-cor]");
    if(cor){
      if(el.type === "color"){ S[cor.dataset.cor] = el.value; corMudou(cor.dataset.cor); mostrarCor(cor); mudou(); }
      else if(el.dataset.c !== undefined) corDigitada(cor);
      return;
    }
    // cantos arredondados
    if(el.dataset && el.dataset.canto){ S.cantos[el.dataset.canto] = el.checked; mudou(); return; }
    // caixas "Exibir"
    if(el.dataset && el.dataset.x){
      S.exibir[el.dataset.x] = el.checked;
      const f = el.closest(".f[data-campo]"); if(f) f.classList.toggle("off", !el.checked);
      mudou(); return;
    }
    const k = el.dataset && el.dataset.k; if(!k) return;
    let v = el.type==="checkbox" ? el.checked : el.value;
    if(el.type === "number" || el.type === "range"){ v = parseFloat(String(v).replace(",",".")); if(isNaN(v)) return; }
    S[k] = v;
    if(k === "categoria"){
      const key = Object.keys(CATEGORIAS).find(c=>c.toLowerCase()===String(v).trim().toLowerCase());
      if(key){ S.corCat = CATEGORIAS[key]; mostrarCor($('.cor[data-cor="corCat"]')); }
    }
    if(k === "w" || k === "h") detectaModelo();
    if(k === "qrTipo" || k === "tarjaCor" || k === "marca") visibilidade();
    if(k === "marcaOpac") $("#marcaOpacLbl").textContent = v + "%";
    if(k === "fonte") $("#amostraFonte").style.fontFamily = fonteCss(v);
    mudou();
  });
  // ao sair de um campo RGB, mostra o valor já corrigido (0 a 255)
  document.addEventListener("focusout", e=>{ const cor = e.target.closest && e.target.closest(".cor[data-cor]"); if(cor) setTimeout(()=>mostrarCor(cor)); });

  $("#modelo").addEventListener("change", e=>aplicarModelo(e.target.value));
  $("#moldura").addEventListener("change", e=>{ S.moldura = e.target.value === "1"; visibilidade(); mudou(); });
  $("#fonteIn").addEventListener("change", e=>{ const fs = [...e.target.files]; e.target.value = ""; importarFontes(fs); });
  $("#fontesImp").addEventListener("click", e=>{
    const b = e.target.closest("[data-rmf]"); if(!b) return;
    const [rem] = S.fontesImp.splice(+b.dataset.rmf, 1);
    if(rem && S.fonte === rem.nome) S.fonte = "Roboto";
    listaFontes(); mudou();
  });
  $("#orient").addEventListener("change", e=>{
    const querH = e.target.value === "h";
    if((S.w > S.h) !== querH){ [S.w,S.h] = [S.h,S.w]; }
    detectaModelo(); preencherForm(); mudou();
  });

  $("#selPaleta").addEventListener("change", e=>{
    const v = e.target.value; S.paleta = v;
    if(v === "") return;
    const p = PALETAS[+v]; [S.cor1,S.cor2,S.fundo,S.corTexto] = p.slice(1); S.corMoldura = S.cor1;
    preencherForm(); mudou();
  });

  $$("[data-img]").forEach(inp=>inp.addEventListener("change", async e=>{
    const f = e.target.files[0]; if(!f) return;
    const k = inp.dataset.img;
    S[k] = await lerImagem(f, k==="foto" ? 900 : 900);
    S.exibir[k] = true;
    inp.value = ""; preencherForm(); mudou();
  }));
  $$("[data-clear]").forEach(b=>b.addEventListener("click", ()=>{ S[b.dataset.clear] = ""; preencherForm(); mudou(); }));
  $("#spIn").addEventListener("change", async e=>{
    for(const f of e.target.files) S.patroc.push(await lerImagem(f, 600));
    e.target.value = ""; if(S.patrocLocal === "nenhum") S.patrocLocal = "verso";
    preencherForm(); mudou();
  });
  $("#spList").addEventListener("click", e=>{ const b = e.target.closest("[data-sp]"); if(!b) return; S.patroc.splice(+b.dataset.sp,1); listaPatroc(); mudou(); });

  $("#viewSeg").addEventListener("click", e=>{ const b = e.target.closest("button"); if(!b) return; S.vista = b.dataset.v; mudou(); });
  $("#btnPrint").onclick = $("#btnPrint2").onclick = imprimir;
  $("#btnPng").onclick = $("#btnPng2").onclick = exportarPng;

  $("#csvIn").addEventListener("change", e=>{
    const f = e.target.files[0]; if(!f) return;
    const importar = txt => {
      const r = lerPlanilha(txt);
      if(r.erro){ toast(r.erro); return; }
      LOTE = r.lista; REC = 0; atualizaLote(); render(); toast(`${LOTE.length} pessoas importadas.`);
    };
    const fr = new FileReader();
    fr.onload = () => {
      if(fr.result.includes("�")){ const fr2 = new FileReader(); fr2.onload = () => importar(fr2.result); fr2.readAsText(f, "windows-1252"); }
      else importar(fr.result);
    };
    fr.readAsText(f, "utf-8"); e.target.value = "";
  });
  $("#csvModelo").onclick = ()=> download(new Blob([CSV_EXEMPLO],{type:"text/csv;charset=utf-8"}), "freewebcracha-lista-exemplo.csv");
  $("#csvLimpar").onclick = ()=>{ LOTE = []; REC = 0; atualizaLote(); render(); };
  $("#recPrev").onclick = ()=>{ if(!LOTE.length) return; REC = (REC-1+LOTE.length)%LOTE.length; atualizaLote(); render(); };
  $("#recNext").onclick = ()=>{ if(!LOTE.length) return; REC = (REC+1)%LOTE.length; atualizaLote(); render(); };

  $("#btnSave").onclick = ()=> download(new Blob([JSON.stringify(S,null,1)],{type:"application/json"}), `freewebcracha-modelo-${slug(S.evento)}.json`);
  $("#jsonIn").addEventListener("change", e=>{
    const f = e.target.files[0]; if(!f) return;
    const fr = new FileReader();
    fr.onload = () => { try{ S = migrar(JSON.parse(fr.result)); preencherForm(); mudou(); toast("Configuração carregada."); }catch(_){ toast("Arquivo de configuração inválido."); } };
    fr.readAsText(f); e.target.value = "";
  });
  $("#btnReset").onclick = ()=>{ S = clone(PADRAO); preencherForm(); mudou(); toast("Configuração padrão restaurada."); };

  window.addEventListener("resize", ()=>escalar());
  window.addEventListener("beforeprint", ()=>{ if(!$("#printArea").innerHTML) montarImpressao(); });
  window.addEventListener("afterprint", ()=>{ $("#printArea").innerHTML = ""; });
  render();
  // espera as fontes (embutidas e importadas) carregarem e redesenha com as medidas certas
  Promise.all([carregarFontes(), ...S.fontesImp.map(f=>registrarFonte(f.nome, f.data))]).then(()=>render());
}
document.addEventListener("DOMContentLoaded", iniciar);
