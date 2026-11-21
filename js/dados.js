/* FreeWebCrachá — dados fixos: modelos, layouts, categorias, paletas e configuração padrão */
"use strict";

const PX_MM = 96 / 25.4;

const MODELOS = {
  cr80h:  {nome:"Crachá corporativo CR80 — horizontal", w:85.6, h:54, raio:3.18, medida:"8,56 × 5,4 cm (86 × 54 mm)", norma:"ISO/IEC 7810 ID-1 (mesmo tamanho de um cartão de crédito)", uso:"Funcionários, carteirinhas de estudante, clubes, igrejas e controle de acesso fixo."},
  cr80v:  {nome:"Crachá corporativo CR80 — vertical", w:54, h:85.6, raio:3.18, medida:"5,4 × 8,56 cm (54 × 86 mm)", norma:"ISO/IEC 7810 ID-1 (mesmo tamanho de um cartão de crédito)", uso:"Funcionários, carteirinhas de estudante, clubes, igrejas e controle de acesso fixo."},
  visit:  {nome:"Visitante / prestador — CR80 vertical", w:54, h:85.6, raio:3.18, medida:"5,4 × 8,56 cm (CR80)", norma:"ISO/IEC 7810 ID-1", uso:"Visitantes, prestadores de serviço e acessos temporários.", cat:"Visitante"},
  m912:   {nome:"Evento — padrão médio 9 × 12 cm", w:90, h:120, raio:0, medida:"9 × 12 cm", norma:"Padrão de mercado para eventos", uso:"Bom para nome, empresa e QR Code."},
  c1014:  {nome:"Congressos e feiras — 10 × 14 cm (mais usado)", w:100, h:140, raio:0, medida:"10 × 14 cm", norma:"Padrão de mercado para eventos", uso:"Leitura rápida do nome à distância, categoria e logos de patrocinadores."},
  s913:   {nome:"Shows e festivais — 9 × 13 cm", w:90, h:130, raio:0, medida:"9 × 13 cm", norma:"Padrão de mercado para eventos", uso:"Credenciais de shows, festivais, staff e imprensa."},
  p1215:  {nome:"Evento com muitos patrocinadores — 12 × 15 cm", w:120, h:150, raio:0, medida:"12 × 15 cm", norma:"Padrão de mercado para eventos", uso:"Mais espaço para a grade de logotipos de patrocinadores.", patroc:"frente"},
  custom: {nome:"Tamanho personalizado", medida:"Definido por você", norma:"—", uso:"Ajuste largura e altura nos campos abaixo."}
};

/* foto: centro | esq | grande     cat: rodape | topo | lateral | pilula | contorno
   logo: acima | lado (posição do logotipo no cabeçalho)     txt: centro | esquerda (alinhamento do texto do cabeçalho) */
/* foto: centro | esq | grande     cat: rodape | topo | lateral | pilula | contorno
   logo: acima | lado (posição do logotipo no cabeçalho)     txt: centro | esquerda (alinhamento do texto do cabeçalho)
   tarja: cor que a tarja da categoria usa quando segue o layout (c1 = principal, c2 = secundária, grad = degradê) */
const LAYOUTS = [
  {id:"classico",     nome:"Clássico",              foto:"centro", cat:"rodape",   tarja:"c1", logo:"lado", txt:"esquerda"},
  {id:"degrade",      nome:"Degradê",               foto:"centro", cat:"rodape",   tarja:"grad", logo:"lado", txt:"esquerda"},
  {id:"curva",        nome:"Curva",                 foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"centro"},
  {id:"minimalista",  nome:"Minimalista",           foto:"centro", cat:"rodape",   tarja:"c2", logo:"lado", txt:"esquerda"},
  {id:"lateral",      nome:"Faixa lateral",         foto:"centro", cat:"lateral",  tarja:"c1", logo:"lado", txt:"esquerda"},
  {id:"sobreposta",   nome:"Foto sobreposta",       foto:"centro", cat:"rodape",   tarja:"c1", logo:"acima", txt:"centro"},
  {id:"cheio",        nome:"Fundo cheio",           foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"esquerda"},
  {id:"diagonal",     nome:"Diagonal",              foto:"centro", cat:"rodape",   tarja:"c1", logo:"lado", txt:"esquerda"},
  {id:"moldura",      nome:"Moldura",               foto:"centro", cat:"rodape",   tarja:"c1", logo:"acima", txt:"centro"},
  {id:"faixadupla",   nome:"Faixa dupla",           foto:"centro", cat:"rodape",   tarja:"c1", logo:"lado", txt:"centro"},
  {id:"rodapealto",   nome:"Rodapé em destaque",    foto:"centro", cat:"rodape",   tarja:"c1", logo:"acima", txt:"centro"},
  {id:"fotogrande",   nome:"Foto grande",           foto:"grande", cat:"rodape",   tarja:"c2", logo:"lado", txt:"esquerda"},
  {id:"geometrico",   nome:"Geométrico",            foto:"centro", cat:"rodape",   tarja:"grad", deco:true, logo:"lado", txt:"esquerda"},
  {id:"elegante",     nome:"Elegante",              foto:"centro", cat:"contorno", tarja:"c2", logo:"acima", txt:"centro"},
  {id:"festival",     nome:"Festival",              foto:"centro", cat:"topo",     tarja:"grad", logo:"acima", txt:"centro"},
  {id:"fotoesquerda", nome:"Foto à esquerda",       foto:"esq",    cat:"rodape",   tarja:"c2", logo:"lado", txt:"esquerda"},
  {id:"arco",         nome:"Halo",                  foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"centro"},
  {id:"interno",      nome:"Cartão interno",        foto:"centro", cat:"rodape",   tarja:"c2", logo:"lado", txt:"centro"},
  {id:"capsula",      nome:"Cápsulas",              foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"centro"},
  {id:"neon",         nome:"Neon escuro",           foto:"centro", cat:"contorno", tarja:"c2", logo:"lado", txt:"esquerda"},
  {id:"pilula",       nome:"Etiqueta",              foto:"centro", cat:"pilula",   tarja:"c2", logo:"lado", txt:"centro"},
  {id:"centralizado", nome:"Logo centralizado",     foto:"centro", cat:"rodape",   tarja:"c1", logo:"acima", txt:"centro"},
  {id:"rodapeevento", nome:"Evento no rodapé",      foto:"centro", cat:"topo",     tarja:"c2", logo:"acima", txt:"centro"},
  {id:"listravertical",nome:"Listras verticais",    foto:"centro", cat:"rodape",   tarja:"c1", deco:true, logo:"lado", txt:"esquerda"},
  {id:"ondadupla",    nome:"Onda dupla",            foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"centro"},
  {id:"tonal",        nome:"Fundo tonal",           foto:"centro", cat:"rodape",   tarja:"c1", logo:"lado", txt:"esquerda"},
  {id:"cattopo",      nome:"Categoria no topo",     foto:"centro", cat:"topo",     tarja:"grad", logo:"acima", txt:"esquerda"},
  {id:"ficha",        nome:"Ficha",                 foto:"esq",    cat:"pilula",   tarja:"c1", logo:"lado", txt:"esquerda"},
  {id:"circulo",      nome:"Círculo central",       foto:"centro", cat:"rodape",   tarja:"c2", deco:true, logo:"acima", txt:"centro"},
  {id:"bordas",       nome:"Bordas coloridas",      foto:"centro", cat:"rodape",   tarja:"c2", logo:"acima", txt:"esquerda"}
];

/* 10 fontes embutidas em css/fontes.css (nenhuma depende de internet) */
const FONTES = [
  {nome:"Roboto",           tipo:"sans-serif"},
  {nome:"Open Sans",        tipo:"sans-serif"},
  {nome:"Montserrat",       tipo:"sans-serif"},
  {nome:"Lato",             tipo:"sans-serif"},
  {nome:"Poppins",          tipo:"sans-serif"},
  {nome:"Oswald",           tipo:"sans-serif"},
  {nome:"Raleway",          tipo:"sans-serif"},
  {nome:"Nunito",           tipo:"sans-serif"},
  {nome:"Merriweather",     tipo:"serif"},
  {nome:"Playfair Display", tipo:"serif"}
];

const CATEGORIAS = {
  "Participante":"#1e6fd9","Palestrante":"#7b2cbf","Expositor":"#e67e22","Organização":"#2e7d32","Staff":"#00897b",
  "Imprensa":"#c62828","VIP":"#b8860b","Patrocinador":"#ad1457","Visitante":"#546e7a","Prestador de serviço":"#6d4c41",
  "Funcionário":"#0b3d91","Estudante":"#00838f","Artista":"#6a1b9a","Produção":"#37474f"
};

/* [nome, principal, secundária, fundo, texto] */
const PALETAS = [
  ["Azul corporativo",  "#0b3d91","#00a3e0","#ffffff","#1b1f24"],
  ["Verde natureza",    "#14532d","#22c55e","#ffffff","#16201a"],
  ["Vinho e ouro",      "#7f1d1d","#d4a017","#fffdf8","#211514"],
  ["Grafite e laranja", "#1f2937","#f97316","#ffffff","#111827"],
  ["Roxo e rosa",       "#4c1d95","#ec4899","#ffffff","#1c1530"],
  ["Petróleo e amarelo","#0f766e","#facc15","#ffffff","#0f1f1d"],
  ["Preto e vermelho",  "#111111","#e11d48","#ffffff","#111111"],
  ["Marinho e prata",   "#1e3a8a","#94a3b8","#f8fafc","#0f172a"],
  ["Terracota",         "#9a3412","#fdba74","#fffaf5","#2a1a12"],
  ["Turquesa e coral",  "#0e7490","#fb7185","#ffffff","#102a33"],
  ["Índigo e ciano",    "#312e81","#22d3ee","#ffffff","#151436"],
  ["Esmeralda e lima",  "#065f46","#a3e635","#ffffff","#0b241c"],
  ["Bordô e rosa",      "#831843","#f9a8d4","#fffafc","#2a0f1d"],
  ["Azul e âmbar",      "#1d4ed8","#f59e0b","#ffffff","#0f1a3a"],
  ["Chumbo e verde-água","#334155","#2dd4bf","#ffffff","#111827"],
  ["Café e caramelo",   "#4a2c2a","#d4a373","#fffaf3","#241614"],
  ["Oceano",            "#0c4a6e","#38bdf8","#f8fcff","#0a2233"],
  ["Floresta e ouro",   "#1f3d1a","#ca8a04","#fffdf5","#14200f"],
  ["Ameixa e lavanda",  "#581c87","#c4b5fd","#ffffff","#1f0f2e"],
  ["Vermelho e cinza",  "#b91c1c","#9ca3af","#ffffff","#1f1f1f"]
];

const PAPEIS = {A4:[210,297], A3:[297,420], Carta:[215.9,279.4], Oficio:[215.9,330.2]};

/* campos que podem ser incluídos ou não no crachá */
const CAMPOS_EXIBIR = ["evento","subtitulo","nome","destaque","cargo","empresa","registro","categoria","codigo","validade","foto","logo"];

const PADRAO = {
  modelo:"c1014", w:100, h:140, raio:0, furoTipo:"centro", layout:"classico",
  evento:"Congresso Brasileiro de Tecnologia e Inovação 2026", subtitulo:"12 a 14 de março · Brasília – DF",
  nome:"Maria Fernanda Souza", destaque:"", cargo:"Gerente de Projetos", empresa:"Empresa Exemplo Ltda.",
  regOrgao:"", regNumero:"", categoria:"Participante", corCat:"#1e6fd9", codigo:"CBTI-2026-00123", validade:"",
  exibir:{evento:true,subtitulo:true,nome:true,destaque:true,cargo:true,empresa:true,registro:true,categoria:true,codigo:true,validade:true,foto:true,logo:true},
  logo:"", foto:"", fotoForma:"redonda", patroc:[], patrocLocal:"verso", patrocTitulo:"Patrocínio",
  qrLocal:"frente", qrTipo:"codigo", qrTexto:"https://www.exemplo.com.br/inscricao/{codigo}",
  versoTitulo:"Informações importantes",
  versoTexto:"• Credencial pessoal e intransferível.\n• Mantenha a credencial visível durante todo o evento.\n• Em caso de perda, procure a secretaria do evento.\n• O acesso às salas depende da categoria indicada na frente.",
  contato:"www.exemplo.com.br · (61) 0000-0000", versoAssinatura:false, assinTexto:"Assinatura do responsável",
  cor1:"#0b3d91", cor2:"#00a3e0", fundo:"#ffffff", corTexto:"#1b1f24", fonte:"Roboto", fontesImp:[],
  moldura:false, corMoldura:"#0b3d91", molduraEsp:1.5, paleta:"0",
  logoPos:"layout", cabAlinh:"layout", marca:"nenhuma", marcaCor:"c1", marcaOpac:12, marcaVerso:true, versoAlinh:"left",
  tarjaCor:"layout", corTarja:"#0b3d91",
  cantos:{se:true, sd:true, ie:true, id:true},
  papel:"A4", papelOrient:"retrato", impModo:"duplex", copias:1, margem:8, espaco:6, marcasCorte:true,
  vista:"ambos"
};
