/* FreeWebCrachá — importação de planilha CSV para gerar crachás em lote */
"use strict";

let LOTE = [];   // uma linha da planilha por pessoa
let REC = 0;     // registro exibido na pré-visualização

const COLS_CSV = {
  nome:["nome","nome completo","participante"],
  destaque:["destaque","apelido","nome destaque","nome em destaque","primeiro nome"],
  cargo:["cargo","funcao","função"],
  empresa:["empresa","instituicao","instituição","organizacao","organização"],
  regOrgao:["orgao","órgão","conselho"],
  regNumero:["registro","registro profissional","numero registro","n registro"],
  categoria:["categoria","tipo"],
  codigo:["codigo","código","inscricao","inscrição","matricula","matrícula","id"],
  validade:["validade"]
};

function normaliza(s){ return String(s).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }

function parseCSV(txt){
  txt = txt.replace(/^﻿/,"");
  const primeira = txt.split(/\r?\n/)[0] || "";
  const sep = (primeira.split(";").length >= primeira.split(",").length) ? ";" : ",";
  const linhas = []; let cel = "", lin = [], aspas = false;
  for(let i=0;i<txt.length;i++){
    const ch = txt[i];
    if(aspas){
      if(ch === '"'){ if(txt[i+1] === '"'){ cel += '"'; i++; } else aspas = false; }
      else cel += ch;
    } else if(ch === '"') aspas = true;
    else if(ch === sep){ lin.push(cel); cel = ""; }
    else if(ch === "\n" || ch === "\r"){ if(ch==="\r" && txt[i+1]==="\n") i++; lin.push(cel); linhas.push(lin); lin=[]; cel=""; }
    else cel += ch;
  }
  if(cel !== "" || lin.length){ lin.push(cel); linhas.push(lin); }
  return linhas.filter(l=>l.some(c=>c.trim()!==""));
}

/* devolve a lista de pessoas ou uma mensagem de erro */
function lerPlanilha(txt){
  const linhas = parseCSV(txt);
  if(linhas.length < 2) return {erro:"A planilha precisa de títulos na primeira linha e ao menos uma pessoa."};
  const cab = linhas[0].map(normaliza), mapa = {};
  for(const [k,alts] of Object.entries(COLS_CSV)){ const i = cab.findIndex(c=>alts.map(normaliza).includes(c)); if(i>=0) mapa[k]=i; }
  if(mapa.nome === undefined) return {erro:"Não achei a coluna 'nome' na primeira linha."};
  const lista = linhas.slice(1).map(l=>{ const o={}; for(const [k,i] of Object.entries(mapa)) o[k]=(l[i]||"").trim(); return o; }).filter(o=>o.nome);
  return {lista};
}

const CSV_EXEMPLO = "﻿nome;destaque;cargo;empresa;orgao;registro;categoria;codigo;validade\n"+
  "Maria Fernanda Souza;Maria;Psicóloga;Clínica Exemplo;CRP;01/12345;Participante;CBTI-0001;\n"+
  "João Carlos Pereira;;Médico;Hospital Regional;CRM;DF 54321;Palestrante;CBTI-0002;\n"+
  "Ana Beatriz Lima;Ana;Repórter;Jornal da Cidade;;;Imprensa;CBTI-0003;\n"+
  "Pedro Henrique Alves;;Advogado;Comissão Organizadora;OAB;DF 98765;Organização;CBTI-0004;\n";
