/* FreeWebCrachá — 20 marcas d'água para o fundo do crachá.
   Cada desenho é um SVG gerado aqui mesmo, em milímetros do tamanho real do crachá (sem arquivos externos). */
"use strict";

const MARCAS = [
  {id:"nenhuma",      nome:"Sem marca d'água"},
  {id:"concentricos", nome:"Círculos concêntricos"},
  {id:"conccanto",    nome:"Círculos concêntricos no canto"},
  {id:"ondas",        nome:"Ondas"},
  {id:"diagonais",    nome:"Linhas diagonais"},
  {id:"pontos",       nome:"Grade de pontos"},
  {id:"hexagonos",    nome:"Hexágonos"},
  {id:"triangulos",   nome:"Triângulos (low poly)"},
  {id:"bolhas",       nome:"Bolhas"},
  {id:"escamas",      nome:"Escamas / arcos"},
  {id:"losangos",     nome:"Losangos"},
  {id:"topografico",  nome:"Linhas topográficas"},
  {id:"raios",        nome:"Raios de sol"},
  {id:"quadrados",    nome:"Quadrados concêntricos girados"},
  {id:"zigue",        nome:"Zigue-zague"},
  {id:"blobs",        nome:"Formas orgânicas"},
  {id:"faixas",       nome:"Faixas curvas"},
  {id:"xadrez",       nome:"Xadrez suave"},
  {id:"cruzes",       nome:"Cruzes"},
  {id:"espiral",      nome:"Espiral"},
  {id:"circuito",     nome:"Circuito / tecnologia"}
];

/* números pseudoaleatórios fixos: o desenho é sempre o mesmo para o mesmo crachá */
function sorteador(semente){
  let s = semente >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const f1 = n => (Math.round(n*10)/10).toString();

function marcaSvg(id, cor, w, h){
  const cx = w/2, cy = h*0.55, R = Math.hypot(w, h);
  const st = `fill="none" stroke="${cor}"`;
  let g = "";
  const rnd = sorteador(7 + id.length * 131);
  switch(id){
    case "concentricos":
      for(let r=5; r<R; r+=5) g += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" ${st} stroke-width=".55"/>`; break;
    case "conccanto":
      for(let r=6; r<R*1.1; r+=6) g += `<circle cx="${f1(w)}" cy="${f1(h)}" r="${r}" ${st} stroke-width=".7"/>`;
      for(let r=6; r<R*0.5; r+=6) g += `<circle cx="0" cy="0" r="${r}" ${st} stroke-width=".5"/>`; break;
    case "ondas":
      for(let y=-4; y<h+8; y+=6){
        let d = `M-10 ${f1(y)}`;
        for(let x=-10, k=0; x<w+20; x+=10, k++) d += k%2 ? " q5 3 10 0" : " q5 -3 10 0";
        g += `<path d="${d}" ${st} stroke-width=".6"/>`;
      } break;
    case "diagonais":
      for(let x=-h; x<w; x+=5) g += `<line x1="${f1(x)}" y1="${f1(h)}" x2="${f1(x+h)}" y2="0" stroke="${cor}" stroke-width=".55"/>`; break;
    case "pontos":
      for(let y=3; y<h; y+=5) for(let x=3; x<w; x+=5) g += `<circle cx="${x}" cy="${y}" r=".75" fill="${cor}"/>`; break;
    case "hexagonos": {
      const s = 5, hw = Math.sqrt(3)*s;
      for(let row=-1, y=0; y<h+s*2; row++, y=row*s*1.5)
        for(let x=(row%2?hw/2:0)-hw; x<w+hw; x+=hw){
          const p = [0,1,2,3,4,5].map(i=>{ const a = Math.PI/180*(60*i-30); return f1(x+s*Math.cos(a))+","+f1(y+s*Math.sin(a)); }).join(" ");
          g += `<polygon points="${p}" ${st} stroke-width=".5"/>`;
        }
      break; }
    case "triangulos": {
      const s = 14;
      for(let y=0; y<h+s; y+=s) for(let x=0; x<w+s; x+=s){
        const o1 = (rnd()*0.9+0.1).toFixed(2), o2 = (rnd()*0.9+0.1).toFixed(2);
        g += `<polygon points="${x},${y} ${x+s},${y} ${x},${y+s}" fill="${cor}" fill-opacity="${o1}"/>`;
        g += `<polygon points="${x+s},${y} ${x+s},${y+s} ${x},${y+s}" fill="${cor}" fill-opacity="${o2}"/>`;
      } break; }
    case "bolhas":
      for(let i=0;i<22;i++){ const r = 3 + rnd()*16; g += `<circle cx="${f1(rnd()*w)}" cy="${f1(rnd()*h)}" r="${f1(r)}" fill="${cor}" fill-opacity="${(0.25+rnd()*0.75).toFixed(2)}"/>`; }
      break;
    case "escamas":
      for(let row=0, y=0; y<h+10; row++, y+=5)
        for(let x=(row%2?5:0)-10; x<w+10; x+=10) g += `<path d="M${x} ${y} a5 5 0 0 0 10 0" ${st} stroke-width=".55"/>`;
      break;
    case "losangos":
      for(let y=0; y<h+8; y+=8) for(let x=0; x<w+12; x+=12)
        g += `<polygon points="${x},${y-4} ${x+6},${y} ${x},${y+4} ${x-6},${y}" ${st} stroke-width=".5"/>`;
      break;
    case "topografico": {
      const centros = [[w*0.25,h*0.3],[w*0.8,h*0.78]];
      for(const [px,py] of centros){
        const fase = rnd()*6.28;
        for(let r=4; r<R*0.55; r+=4.5){
          let d = "";
          for(let k=0;k<=72;k++){
            const a = k/72*Math.PI*2, rr = r*(1 + 0.12*Math.sin(3*a+fase) + 0.06*Math.sin(5*a+fase*2));
            d += (k?"L":"M") + f1(px+rr*Math.cos(a)) + " " + f1(py+rr*Math.sin(a));
          }
          g += `<path d="${d}Z" ${st} stroke-width=".5"/>`;
        }
      } break; }
    case "raios":
      for(let i=0;i<36;i+=2){
        const a1 = i/36*Math.PI*2, a2 = (i+1)/36*Math.PI*2;
        g += `<polygon points="${f1(cx)},${f1(cy)} ${f1(cx+R*Math.cos(a1))},${f1(cy+R*Math.sin(a1))} ${f1(cx+R*Math.cos(a2))},${f1(cy+R*Math.sin(a2))}" fill="${cor}" fill-opacity=".6"/>`;
      } break;
    case "quadrados":
      for(let s=6; s<R; s+=7) g += `<rect x="${f1(cx-s/2)}" y="${f1(cy-s/2)}" width="${s}" height="${s}" transform="rotate(45 ${f1(cx)} ${f1(cy)})" ${st} stroke-width=".6"/>`;
      break;
    case "zigue":
      for(let y=0; y<h+6; y+=6){
        let d = `M-4 ${y}`;
        for(let x=-4, k=0; x<w+8; x+=4, k++) d += ` L${x+4} ${k%2 ? y : y-3}`;
        g += `<path d="${d}" ${st} stroke-width=".55" stroke-linejoin="round"/>`;
      } break;
    case "blobs": {
      const blob = (px,py,r,op) => {
        const n = 8, pts = [];
        for(let i=0;i<n;i++){ const a = i/n*Math.PI*2, rr = r*(0.72+rnd()*0.5); pts.push([px+rr*Math.cos(a), py+rr*Math.sin(a)]); }
        let d = `M${f1((pts[0][0]+pts[n-1][0])/2)} ${f1((pts[0][1]+pts[n-1][1])/2)}`;
        for(let i=0;i<n;i++){ const p = pts[i], q = pts[(i+1)%n]; d += ` Q${f1(p[0])} ${f1(p[1])} ${f1((p[0]+q[0])/2)} ${f1((p[1]+q[1])/2)}`; }
        return `<path d="${d}Z" fill="${cor}" fill-opacity="${op}"/>`;
      };
      g = blob(w*0.95, h*0.18, w*0.45, .7) + blob(w*0.05, h*0.88, w*0.5, .8) + blob(w*0.2, h*0.45, w*0.18, .45) + blob(w*0.85, h*0.7, w*0.14, .4);
      break; }
    case "faixas":
      for(let i=0;i<5;i++){
        const y0 = h*(0.1+i*0.22);
        g += `<path d="M${f1(-w*0.2)} ${f1(y0)} C${f1(w*0.3)} ${f1(y0-h*0.25)} ${f1(w*0.7)} ${f1(y0+h*0.25)} ${f1(w*1.2)} ${f1(y0-h*0.05)}" ${st} stroke-width="${f1(2+i*1.2)}" stroke-opacity="${(0.5+i*0.1).toFixed(2)}" stroke-linecap="round"/>`;
      } break;
    case "xadrez":
      for(let y=0, r=0; y<h; y+=8, r++) for(let x=(r%2?8:0); x<w; x+=16) g += `<rect x="${x}" y="${y}" width="8" height="8" fill="${cor}" fill-opacity=".55"/>`;
      break;
    case "cruzes":
      for(let y=4, r=0; y<h; y+=8, r++) for(let x=(r%2?8:4); x<w; x+=8) g += `<path d="M${x-1.5} ${y}h3M${x} ${y-1.5}v3" stroke="${cor}" stroke-width=".55" stroke-linecap="round"/>`;
      break;
    case "espiral": {
      let d = `M${f1(cx)} ${f1(cy)}`;
      for(let a=0; a<Math.PI*2*14; a+=0.12){ const r = 1.15*a; d += ` L${f1(cx+r*Math.cos(a))} ${f1(cy+r*Math.sin(a))}`; if(r > R) break; }
      g = `<path d="${d}" ${st} stroke-width=".6"/>`; break; }
    case "circuito":
      for(let i=0;i<26;i++){
        let x = Math.round(rnd()*w/4)*4, y = Math.round(rnd()*h/4)*4, d = `M${x} ${y}`;
        for(let k=0;k<3;k++){ if(rnd()<.5) x += (rnd()<.5?-1:1)*4*(2+Math.floor(rnd()*4)); else y += (rnd()<.5?-1:1)*4*(2+Math.floor(rnd()*4)); d += ` L${x} ${y}`; }
        g += `<path d="${d}" ${st} stroke-width=".55"/><circle cx="${x}" cy="${y}" r="1.1" fill="${cor}"/>`;
      } break;
    default: return "";
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${f1(w*10)}" height="${f1(h*10)}" viewBox="0 0 ${f1(w)} ${f1(h)}" preserveAspectRatio="none">${g}</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const marcaCache = new Map();
function marcaHTML(d){
  if(!d.marca || d.marca === "nenhuma") return "";
  const cor = {c1:d.cor1, c2:d.cor2, texto:d.corTexto, cinza:"#808080"}[d.marcaCor] || d.cor1;
  const chave = [d.marca, cor, d.w, d.h].join("|");
  if(!marcaCache.has(chave)){ if(marcaCache.size > 60) marcaCache.clear(); marcaCache.set(chave, marcaSvg(d.marca, cor, d.w, d.h)); }
  const url = marcaCache.get(chave);
  const op = Math.max(0.02, Math.min(1, (+d.marcaOpac || 12) / 100));
  return url ? `<div class="marca" style="background-image:url('${url}');opacity:${op}"></div>` : "";
}
