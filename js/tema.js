/* FreeWebCrachá — tema claro / escuro. Carregado no <head> para a página já abrir no tema certo. */
"use strict";
const LS_TEMA = "freewebcracha-tema";
(function(){
  let t = null; try{ t = localStorage.getItem(LS_TEMA); }catch(e){}
  if(!t) t = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "escuro" : "claro";
  document.documentElement.dataset.tema = t;
})();
function aplicarTema(t){
  document.documentElement.dataset.tema = t;
  const b = document.getElementById("btnTema");
  if(b) b.textContent = t === "escuro" ? "☀ Tema claro" : "☾ Tema escuro";
}
function alternarTema(){
  const t = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(t); try{ localStorage.setItem(LS_TEMA, t); }catch(e){}
}
