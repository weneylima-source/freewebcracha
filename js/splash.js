/* FreeWebCrachá — tela de abertura e confirmação do "Limpar tudo" */
"use strict";

(function(){
  const sp = document.getElementById("splash");
  if(!sp) return;

  // estrelas em posições aleatórias
  const ceu = document.getElementById("spEstrelas");
  let html = "";
  for(let i=0;i<90;i++){
    const t = (Math.random()*2+1).toFixed(1);
    html += `<i style="left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;animation-delay:${(-Math.random()*3).toFixed(2)}s;animation-duration:${t}s;opacity:${Math.random().toFixed(2)}"></i>`;
  }
  ceu.innerHTML = html;

  // impede rolar a página por trás da abertura
  document.documentElement.style.overflow = "hidden";

  function entrar(){
    if(sp.classList.contains("saindo")) return;
    sp.classList.add("saindo");
    document.documentElement.style.overflow = "";
    setTimeout(()=>{ sp.remove(); if(typeof escalar === "function") escalar(); }, 950);
  }
  document.getElementById("spComecar").addEventListener("click", entrar);
  document.addEventListener("keydown", function k(e){
    if(!document.getElementById("splash")){ document.removeEventListener("keydown", k); return; }
    if(e.key === "Enter" || e.key === " " || e.key === "Escape"){ e.preventDefault(); entrar(); }
  });
  setTimeout(()=>document.getElementById("spComecar").focus({preventScroll:true}), 1600);
})();

/* ---------- Limpar tudo, com confirmação ---------- */
(function(){
  const dlg = document.getElementById("dlg");
  const abrir = () => { dlg.classList.add("on"); dlg.setAttribute("aria-hidden","false"); setTimeout(()=>document.getElementById("dlgNao").focus(), 50); };
  const fechar = () => { dlg.classList.remove("on"); dlg.setAttribute("aria-hidden","true"); };
  document.getElementById("btnLimpar").addEventListener("click", abrir);
  document.getElementById("dlgNao").addEventListener("click", fechar);
  dlg.addEventListener("click", e=>{ if(e.target === dlg) fechar(); });
  document.addEventListener("keydown", e=>{ if(e.key === "Escape" && dlg.classList.contains("on")) fechar(); });
  document.getElementById("dlgSim").addEventListener("click", ()=>{ fechar(); limparTudo(); });
})();
