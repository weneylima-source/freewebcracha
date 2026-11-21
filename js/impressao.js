/* FreeWebCrachá — montagem das folhas de impressão e exportação em PNG */
"use strict";

function papelDim(){
  let [pw,ph] = PAPEIS[S.papel] || PAPEIS.A4;
  if(S.papelOrient === "paisagem") [pw,ph] = [ph,pw];
  return [pw,ph];
}

function grade(){
  const [pw,ph] = papelDim();
  const lado = S.impModo === "lado";
  const uw = lado ? S.w*2 : S.w, uh = S.h;
  const m = +S.margem||0, g = +S.espaco||0;
  const cols = Math.floor((pw - 2*m + g) / (uw + g));
  const rows = Math.floor((ph - 2*m + g) / (uh + g));
  const gw = cols*uw + (cols-1)*g, gh = rows*uh + (rows-1)*g;
  return {pw,ph,uw,uh,g,cols,rows,ox:(pw-gw)/2,oy:(ph-gh)/2,porFolha:Math.max(0,cols)*Math.max(0,rows)};
}

function infoImpressao(){
  const G = grade(), el = document.getElementById("impInfo");
  if(G.porFolha < 1){ el.innerHTML = `<b>Não cabe na folha.</b> Diminua a margem, troque a orientação da folha ou use um papel maior.`; return; }
  const total = LOTE.length ? LOTE.length : Math.max(1, +S.copias||1);
  const folhas = Math.ceil(total / G.porFolha) * (S.impModo==="duplex" ? 2 : 1);
  el.innerHTML = `<b>${G.porFolha}</b> ${S.impModo==="lado"?"pares (frente + verso)":"crachás"} por folha (${G.cols} × ${G.rows}) · `+
    `${LOTE.length?`lote com <b>${total}</b> pessoas`:`<b>${total}</b> cópia(s)`} · <b>${folhas}</b> folha(s)` +
    (S.impModo==="duplex" ? `<br>Os versos saem espelhados para impressão frente e verso virando pela borda longa.` : "");
}

function montarImpressao(){
  const G = grade();
  if(G.porFolha < 1){ toast("O crachá não cabe na folha escolhida."); return false; }
  const regs = LOTE.length ? LOTE.map((_,i)=>dadosRegistro(i)) : Array.from({length:Math.max(1,+S.copias||1)},()=>dadosRegistro(null));
  const area = document.getElementById("printArea");
  let html = "";
  const celula = (x,y,w,h,conteudo,dobra)=>
    `<div class="cell" style="left:${x}mm;top:${y}mm;width:${w}mm;height:${h}mm">${conteudo}`+
    (dobra?`<div class="fold" style="left:${w/2}mm"></div>`:"")+
    (S.marcasCorte?'<i class="cm tl"></i><i class="cm tr"></i><i class="cm bl"></i><i class="cm br"></i>':"")+`</div>`;
  const pagina = itens => `<div class="page" style="width:${G.pw}mm;height:${G.ph}mm">${itens}</div>`;
  for(let p=0; p<regs.length; p+=G.porFolha){
    const lote = regs.slice(p, p+G.porFolha);
    const pos = (i, espelho) => {
      const r = Math.floor(i / G.cols); let c = i % G.cols;
      if(espelho) c = G.cols - 1 - c;
      return [G.ox + c*(G.uw+G.g), G.oy + r*(G.uh+G.g)];
    };
    if(S.impModo === "lado"){
      html += pagina(lote.map((d,i)=>{ const [x,y]=pos(i);
        return celula(x,y,G.uw,G.uh, `<div style="position:absolute;left:0;top:0">${frenteHTML(d)}</div><div style="position:absolute;left:${S.w}mm;top:0">${versoHTML(d)}</div>`, true); }).join(""));
    } else {
      if(S.impModo !== "verso") html += pagina(lote.map((d,i)=>{ const [x,y]=pos(i); return celula(x,y,G.uw,G.uh,frenteHTML(d)); }).join(""));
      if(S.impModo !== "frente") html += pagina(lote.map((d,i)=>{ const [x,y]=pos(i, S.impModo==="duplex"); return celula(x,y,G.uw,G.uh,versoHTML(d)); }).join(""));
    }
  }
  area.innerHTML = html;
  area.querySelectorAll(".face").forEach(ajustarFace);
  document.getElementById("pageStyle").textContent = `@page { size: ${G.pw}mm ${G.ph}mm; margin: 0; }`;
  return true;
}

function imprimir(){
  if(!montarImpressao()) return;
  setTimeout(()=>{ try{ window.print(); }catch(e){ toast("A impressão foi bloqueada neste ambiente. Abra o arquivo direto no navegador."); } }, 60);
}

async function exportarPng(){
  if(typeof html2canvas !== "function"){ toast("Exportação PNG indisponível."); return; }
  const d = dadosRegistro(LOTE.length ? REC : null);
  const lados = S.vista==="ambos" ? ["frente","verso"] : [S.vista];
  const exp = document.getElementById("exp");
  toast("Gerando imagem…");
  for(const l of lados){
    exp.innerHTML = l==="frente" ? frenteHTML(d) : versoHTML(d);
    const face = exp.firstElementChild;
    ajustarFace(face);
    try{
      const canvas = await html2canvas(face, {scale: 300/96, backgroundColor: null, logging: false});
      const blob = await new Promise(r=>canvas.toBlob(r,"image/png"));
      download(blob, `cracha-${slug(d.destaque||d.nome)}-${l}.png`);
    }catch(e){ console.error(e); toast("Não foi possível gerar o PNG."); }
  }
  exp.innerHTML = "";
}
