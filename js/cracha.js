/* FreeWebCrachá — montagem do crachá (frente e verso), QR Code e ajuste automático do conteúdo */
"use strict";

/* ---------- utilitários ---------- */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function cssUrl(d){ return d ? "url('"+d.replace(/'/g,"%27").replace(/"/g,"%22")+"')" : "none"; }
function hexRgb(hex){
  const m = /^#?([0-9a-f]{6})$/i.exec(hex||""); if(!m) return [0,0,0];
  const n = parseInt(m[1],16); return [n>>16&255, n>>8&255, n&255];
}
function rgbHex(r,g,b){ return "#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(+v||0))).toString(16).padStart(2,"0")).join(""); }
function rgba(hex,a){ const [r,g,b]=hexRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function lum(hex){
  const c = hexRgb(hex).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function textOn(hex){ return lum(hex) > .42 ? "#16191d" : "#ffffff"; }
function fmtData(iso){ if(!iso) return ""; const p=iso.split("-"); return p.length===3 ? p[2]+"/"+p[1]+"/"+p[0] : iso; }
function layoutDe(d){ return LAYOUTS.find(l=>l.id===d.layout) || LAYOUTS[0]; }
function uOf(d){ return d.w > d.h ? Math.min(d.w/85.6, d.h/54) : Math.min(d.w/54, d.h/85.6); }

/* ---------- QR Code ---------- */
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
const qrCache = new Map();
function qrDataUrl(text){
  if(!text) return "";
  if(qrCache.has(text)) return qrCache.get(text);
  let url = "";
  for(const ec of ["M","L"]){
    try{
      const q = qrcode(0, ec); q.addData(text, "Byte"); q.make();
      const n = q.getModuleCount(), b = 2, size = n + b*2;
      let d = "";
      for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d += "M"+(c+b)+" "+(r+b)+"h1v1h-1z";
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+(size*10)+'" height="'+(size*10)+'" viewBox="0 0 '+size+' '+size+'" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
      url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      break;
    }catch(e){ url = ""; }
  }
  if(qrCache.size > 400) qrCache.clear();
  qrCache.set(text, url);
  return url;
}
function registroTexto(d){ return [d.regOrgao, d.regNumero].filter(Boolean).join(" "); }
function qrConteudo(d){
  if(d.qrTipo === "vcard"){
    const partes = (d.nome||"").trim().split(/\s+/);
    const sob = partes.length>1 ? partes.pop() : ""; const pri = partes.join(" ");
    return ["BEGIN:VCARD","VERSION:3.0","N:"+sob+";"+pri+";;;","FN:"+(d.nome||""),
      d.empresa?"ORG:"+d.empresa:"", d.cargo?"TITLE:"+d.cargo:"",
      registroTexto(d)?"NOTE:Registro "+registroTexto(d):"", d.codigo?"UID:"+d.codigo:"","END:VCARD"].filter(Boolean).join("\n");
  }
  if(d.qrTipo === "texto"){
    return (d.qrTexto||"").replace(/\{(nome|cargo|empresa|categoria|codigo|destaque|registro)\}/gi,(m,k)=>{
      k = k.toLowerCase(); return k==="registro" ? registroTexto(d) : (d[k]||"");
    });
  }
  return d.codigo || d.nome || "";
}

/* ---------- variáveis e classes ---------- */
/* cor da tarja (faixa da categoria): segue o layout e a paleta, a cor da categoria ou uma cor personalizada */
function tarjaDe(d){
  if(d.tarjaCor === "categoria") return {bg:d.corCat, cor:d.corCat};
  if(d.tarjaCor === "personalizada") return {bg:d.corTarja, cor:d.corTarja};
  const t = layoutDe(d).tarja;
  if(t === "grad") return {bg:`linear-gradient(90deg,${d.cor1},${d.cor2})`, cor:d.cor1};
  const c = t === "c2" ? d.cor2 : d.cor1;
  return {bg:c, cor:c};
}
function fonteCss(nome){
  const f = FONTES.find(x=>x.nome===nome);
  return `'${String(nome||"Roboto").replace(/'/g,"")}', ${f ? f.tipo : "sans-serif"}`;
}
function faceVars(d){
  const t = tarjaDe(d), r = +d.raio || 0, c = d.cantos || {};
  const rc = k => (c[k] === false ? 0 : r) + "mm";
  return `--w:${d.w};--h:${d.h};--u:${uOf(d).toFixed(4)};--rse:${rc("se")};--rsd:${rc("sd")};--rid:${rc("id")};--rie:${rc("ie")};`+
         `--c1:${d.cor1};--c2:${d.cor2};--fundo:${d.fundo};--txt:${d.corTexto};`+
         `--c1a:${rgba(d.cor1,.12)};--c2a:${rgba(d.cor2,.30)};--c2b:${rgba(d.cor2,.18)};`+
         `--fonte:${fonteCss(d.fonte)};--cc:${t.cor};--ccBg:${t.bg};--catTxt:${textOn(t.cor)};--hdrTxt:${textOn(d.cor1)};--ftTxt:${textOn(d.cor2)};`+
         `--molC:${d.corMoldura};--molE:${Math.max(0.2, +d.molduraEsp || 1.5)};`;
}
/* posição do logotipo e alinhamento do cabeçalho: os do layout, ou os escolhidos pelo usuário.
   No crachá horizontal o padrão é logotipo ao lado, para não roubar altura do corpo. */
function cabecalhoDe(d){
  const L = layoutDe(d), horiz = d.w > d.h;
  const logo = d.logoPos && d.logoPos !== "layout" ? d.logoPos : (horiz ? "lado" : L.logo);
  const txt  = d.cabAlinh && d.cabAlinh !== "layout" ? d.cabAlinh : L.txt;
  return {logo, txt};
}
function faceClasses(d, lado){
  const L = layoutDe(d), c = cabecalhoDe(d);
  return `face ${lado} ${d.w > d.h ? "h" : "v"} L-${L.id} hl-${c.logo} ht-${c.txt} foto-${L.foto} cat-${L.cat} ${d.furoTipo && d.furoTipo !== "nenhum" ? "temfuro" : ""} ${d.moldura ? "commoldura" : ""}`;
}
function furosHTML(d){
  if(d.furoTipo === "centro") return '<div class="furo"></div>';
  if(d.furoTipo === "dois") return '<div class="furo2 esq"></div><div class="furo2 dir"></div>';
  return "";
}
function decoHTML(d){ return layoutDe(d).deco ? '<i class="dc d1"></i><i class="dc d2"></i><i class="dc d3"></i>' : ""; }
function sponsorsHTML(d, cls){
  if(!d.patroc || !d.patroc.length) return "";
  const u = uOf(d), n = d.patroc.length;
  const sw = (n > 6 ? 13 : 16) * u, sh = (n > 6 ? 6 : 7.5) * u;
  return `<div class="${cls}" style="--sw:${sw.toFixed(2)}mm;--sh:${sh.toFixed(2)}mm">`+
    (d.patrocTitulo ? `<div class="lab">${esc(d.patrocTitulo)}</div>` : "") +
    d.patroc.map(p=>`<div class="sp" style="background-image:${cssUrl(p)}"></div>`).join("") + `</div>`;
}
const SILHUETA = cssUrl("data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e6ebf0"/><circle cx="50" cy="38" r="18" fill="#b8c3cf"/><path d="M14 100c2-22 17-34 36-34s34 12 36 34z" fill="#b8c3cf"/></svg>'));

/* ---------- frente ---------- */
function frenteHTML(d){
  const L = layoutDe(d), u = uOf(d), h = d.w > d.h, ex = d.exibir || {};
  const temQR = d.qrLocal==="frente" || d.qrLocal==="ambos";
  const qr = temQR ? qrDataUrl(d._qr) : "";
  const nome = ex.nome ? d.nome : "";
  const destaque = ex.destaque ? d.destaque : "";
  const nomeGrande = destaque || nome;
  // tamanho base da foto (o ajuste automático reduz se faltar espaço)
  let fotoTam;
  if(h) fotoTam = Math.min(d.h * (L.foto==="grande" ? .56 : .5), (L.foto==="grande" ? 31 : 28) * u);
  else fotoTam = (L.foto==="grande" ? 34 : L.foto==="esq" ? 24 : 32) * u;
  const qs = (h ? 15 : 14) * u;
  const forma = L.foto==="grande" ? "retrato" : d.fotoForma;
  const foto = ex.foto ? `<div class="foto ${forma}" style="--fs:${fotoTam.toFixed(2)}mm;background-image:${d.foto?cssUrl(d.foto):SILHUETA}"></div>` : "";
  const catTxt = ex.categoria && d.categoria ? esc(d.categoria) : "";
  const pil = (L.cat==="pilula" && catTxt) ? `<div class="pil">${catTxt}</div>` : "";
  const textos =
    (nomeGrande ? `<div class="nm" data-fit="${destaque?1:2}">${esc(nomeGrande)}</div>` : "")+
    (destaque && nome ? `<div class="fn">${esc(nome)}</div>` : "")+ pil +
    (ex.cargo && d.cargo ? `<div class="cg">${esc(d.cargo)}</div>` : "")+
    (ex.empresa && d.empresa ? `<div class="em">${esc(d.empresa)}</div>` : "")+
    (ex.registro && registroTexto(d) ? `<div class="rp">${esc(registroTexto(d))}</div>` : "")+
    (ex.validade && d.validade ? `<div class="vl">Válido até ${fmtData(d.validade)}</div>` : "");
  const qrImg = qr ? `<img class="qr" style="--qs:${qs.toFixed(2)}mm" src="${qr}" alt="">` : "";
  const cod = ex.codigo && d.codigo ? `<div class="cod">${esc(d.codigo)}</div>` : "";
  let corpo;
  if(h){
    corpo = `<div class="body">${foto}<div class="inf">${textos}${!qr?cod:""}</div>${qr?`<div class="qrcol">${qrImg}${cod}</div>`:""}</div>`;
  } else if(L.foto === "esq"){
    corpo = `<div class="body">${foto}<div class="inf">${textos}</div>${(qr||cod)?`<div class="qrrow">${qrImg}${cod?`<div>${cod}</div>`:""}</div>`:""}</div>`;
  } else {
    corpo = `<div class="body">${foto}${textos}${(qr||cod)?`<div class="qrrow">${qrImg}${cod?`<div>${cod}</div>`:""}</div>`:""}</div>`;
  }
  const evento = ex.evento ? d.evento : "", sub = ex.subtitulo ? d.subtitulo : "", logo = ex.logo ? d.logo : "";
  const hdr = (evento || sub || logo || d.furoTipo !== "nenhum") ?
    `<div class="hdr ${logo?"":"sem-logo"}">${logo?`<div class="logo" style="background-image:${cssUrl(logo)}"></div>`:""}`+
    ((evento||sub)?`<div class="ev">${evento?`<div class="evn">${esc(evento)}</div>`:""}${sub?`<div class="evs">${esc(sub)}</div>`:""}</div>`:"")+`</div>` : "";
  const spf = (d.patrocLocal==="frente"||d.patrocLocal==="ambos") ? sponsorsHTML(d,"spf") : "";
  const catBand = catTxt ? `<div class="cat">${catTxt}</div>` : "";
  const catLat = L.cat==="lateral" ? `<div class="catlat"><span>${catTxt}</span></div>` : "";
  return `<div class="${faceClasses(d,"frente")}" style="${faceVars(d)}">`+
    marcaHTML(d) + decoHTML(d) + catLat + furosHTML(d) + hdr +
    (L.cat==="topo" ? catBand : "") +
    corpo + spf +
    ((L.cat==="rodape" || L.cat==="contorno") ? catBand : "")+
  `</div>`;
}

/* ---------- verso ---------- */
function versoHTML(d){
  const L = layoutDe(d), u = uOf(d), ex = d.exibir || {};
  const temQR = d.qrLocal==="verso" || d.qrLocal==="ambos";
  const qr = temQR ? qrDataUrl(d._qr) : "";
  const qs = 16 * u;
  const spb = (d.patrocLocal==="verso"||d.patrocLocal==="ambos") ? sponsorsHTML(d,"spb") : "";
  return `<div class="${faceClasses(d,"verso")}" style="${faceVars(d)}">`+
    (d.marcaVerso ? marcaHTML(d) : "") + decoHTML(d) + (L.cat==="lateral" ? '<div class="catlat"><span></span></div>' : "") + furosHTML(d)+
    `<div class="bhdr">${esc(d.versoTitulo || d.evento)}</div>`+
    `<div class="bbody">`+
      (d.versoTexto ? `<div class="btxt al-${d.versoAlinh||"left"}">${esc(d.versoTexto)}</div>` : "")+
      (qr ? `<div class="bqr"><img class="qr" style="--qs:${qs.toFixed(2)}mm" src="${qr}" alt="">${ex.codigo&&d.codigo?`<div class="cod">${esc(d.codigo)}</div>`:""}</div>` : "")+
      (d.versoAssinatura ? `<div class="assin">${esc(d.assinTexto||"Assinatura")}</div>` : "")+
      spb+
    `</div>`+
    (d.contato ? `<div class="bft">${esc(d.contato)}</div>` : "")+
  `</div>`;
}

/* ---------- ajuste automático ----------
   Ordem quando falta espaço: QR Code → patrocinadores → texto (até 85%) → foto (até 55%) → texto.  */
function overflowV(el){ return el.scrollHeight > el.clientHeight + 1; }
function ajustarFace(face){
  const u = parseFloat(face.style.getPropertyValue("--u")) || 1;
  const mm = PX_MM * u;
  const evn = face.querySelector(".evn");
  if(evn){
    let fs = 3.5*mm; evn.style.fontSize = fs+"px";
    for(let i=0;i<40 && (evn.scrollHeight > fs*1.12*2+2 || evn.scrollWidth > evn.clientWidth+1) && fs > 1.6*mm;i++){ fs*=0.94; evn.style.fontSize=fs+"px"; }
  }
  const lat = face.querySelector(".catlat span");
  if(lat && lat.textContent){
    let fs = 4*mm; lat.style.fontSize = fs+"px";
    const lim = face.offsetHeight * .9;
    for(let i=0;i<40 && lat.offsetWidth > lim && fs > 1.5*mm;i++){ fs*=.93; lat.style.fontSize = fs+"px"; }
  }
  if(face.classList.contains("frente")) ajustarFrente(face, u, mm);
  else ajustarVerso(face, u, mm);
}
function ajustarFrente(face, u, mm){
  const body = face.querySelector(".body"), nm = face.querySelector(".nm");
  const horiz = face.classList.contains("h");
  if(nm){
    const linhas = +nm.dataset.fit || 2;
    let fs = (horiz ? 5.2 : 7.2) * mm; nm.style.fontSize = fs+"px";
    for(let i=0;i<60 && (nm.scrollWidth > nm.clientWidth+1 || nm.scrollHeight > fs*1.1*linhas+2) && fs > 2.2*mm;i++){ fs*=0.94; nm.style.fontSize=fs+"px"; }
  }
  const cat = face.querySelector(".cat");
  if(cat){
    let fs = parseFloat(getComputedStyle(cat).fontSize);
    for(let i=0;i<30 && cat.scrollWidth > cat.clientWidth+1 && fs > 1.5*mm;i++){ fs*=.93; cat.style.fontSize = fs+"px"; }
  }
  const foto = face.querySelector(".foto"), qr = face.querySelector(".body .qr"), spf = face.querySelector(".spf");
  const fs0 = foto ? parseFloat(foto.style.getPropertyValue("--fs")) : 0;
  const qs0 = qr ? parseFloat(qr.style.getPropertyValue("--qs")) : 0;
  const nm0 = nm ? parseFloat(nm.style.fontSize) : 0;
  const bodyFs0 = parseFloat(getComputedStyle(body).fontSize);
  let sw = spf ? parseFloat(spf.style.getPropertyValue("--sw")) : 0, sh = spf ? parseFloat(spf.style.getPropertyValue("--sh")) : 0;
  const shMin = 4.2*u;
  if(spf){ let j=0; while(j++<25 && spf.offsetHeight > face.offsetHeight*0.24 && sh > shMin){ sw*=.92; sh*=.92; spf.style.setProperty("--sw",sw+"mm"); spf.style.setProperty("--sh",sh+"mm"); } }
  let fFoto = 1, fTxt = 1, fQr = 1, k = 0;
  const transborda = () => overflowV(body) || (horiz && body.scrollWidth > body.clientWidth+1);
  const aplicaTxt = () => { body.style.fontSize = (bodyFs0*fTxt)+"px"; if(nm) nm.style.fontSize = (nm0*fTxt)+"px"; };
  while(k++ < 120 && transborda()){
    if(qr && fQr > .62){ fQr *= .95; qr.style.setProperty("--qs",(qs0*fQr).toFixed(2)+"mm"); }
    else if(spf && sh > shMin){ sw*=.94; sh*=.94; spf.style.setProperty("--sw",sw+"mm"); spf.style.setProperty("--sh",sh+"mm"); }
    else if(fTxt > .85){ fTxt *= .97; aplicaTxt(); }
    else if(foto && fFoto > .55){ fFoto *= .96; foto.style.setProperty("--fs",(fs0*fFoto).toFixed(2)+"mm"); }
    else if(fTxt > .4){ fTxt *= .95; aplicaTxt(); }
    else break;
  }
}
function ajustarVerso(face, u, mm){
  const bb = face.querySelector(".bbody"), bh = face.querySelector(".bhdr");
  if(bh){
    const cs = getComputedStyle(bh), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    let fs=3.4*mm; bh.style.fontSize=fs+"px";
    for(let i=0;i<30 && (bh.scrollHeight - pad) > fs*1.15*2 + 2 && fs>1.6*mm;i++){ fs*=.94; bh.style.fontSize=fs+"px"; }
  }
  const spb = face.querySelector(".spb"), qr = face.querySelector(".bqr .qr");
  let f = 1, k = 0; const fs0 = parseFloat(getComputedStyle(bb).fontSize);
  let sw = spb ? parseFloat(spb.style.getPropertyValue("--sw")) : 0, sh = spb ? parseFloat(spb.style.getPropertyValue("--sh")) : 0;
  const qs0 = qr ? parseFloat(qr.style.getPropertyValue("--qs")) : 0;
  while(k++ < 50 && overflowV(bb)){
    f *= 0.94; bb.style.fontSize = (fs0*f)+"px";
    if(spb && f < .85){ sw*=.95; sh*=.95; spb.style.setProperty("--sw",sw+"mm"); spb.style.setProperty("--sh",sh+"mm"); }
    if(qr && f < .8) qr.style.setProperty("--qs",(qs0*Math.max(f,.6)).toFixed(2)+"mm");
    if(f < .35) break;
  }
}
