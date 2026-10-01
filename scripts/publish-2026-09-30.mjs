import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const items = [
  {
    slug:"star-fox-atualizacao-gratuita-battle-mode-switch-2",
    title:"Star Fox recebe atualização gratuita com Battle Mode para quatro jogadores no Switch 2",
    excerpt:"Atualização gratuita amplia o Battle Mode de Star Fox no Nintendo Switch 2 com tela dividida para até quatro jogadores, equipes online e três novas fases.",
    body:`Star Fox ganhou uma nova atualização gratuita no Nintendo Switch 2. O pacote amplia o Battle Mode e adiciona suporte a partidas locais em tela dividida para até quatro pessoas no mesmo console.

A atualização também acrescenta três fases ao modo: Katina, Sector X e Venom. Cada cenário traz objetivos próprios, ampliando a variedade das batalhas. Também foram adicionados novos itens durante os confrontos.

Outra novidade é a possibilidade de formar uma equipe de até quatro jogadores usando a tela dividida e entrar em batalhas online a partir de um único Nintendo Switch 2. Para os recursos online, é necessária uma assinatura ativa do Nintendo Switch Online e uma Conta Nintendo.

A Nintendo confirmou que a atualização é gratuita e já está disponível. A versão 1.2.0 também inclui ajustes de visibilidade em determinados chefes e pequenas melhorias de interface e campanha.

Para quem acompanha a franquia, a atualização reforça o componente multiplayer do novo Star Fox e oferece mais opções para jogar em grupo no Switch 2.`,
    source:"https://www.nintendo.com/en-gb/News/2026/September/A-free-update-has-blasted-off-in-Star-Fox--3210450.html",
    sourceLabel:"Nintendo",
    hero:"https://www.nintendo.com/eu/media/images/news_12/2026/september_45/a_free_update_has_blasted_off_in_star_fox_/16x9_NSwitch2_Starfox_Freeupdate_UK.jpg",
    seoTitle:"Star Fox recebe atualização gratuita com multiplayer para 4 no Switch 2",
    seoDescription:"Star Fox recebe atualização gratuita no Nintendo Switch 2 com tela dividida para quatro jogadores, equipes online e três novas fases."
  },
  {
    slug:"bubble-bobble-4-friends-switch-2-stardrop-mountain-2027",
    title:"Bubble Bobble 4 Friends ganha edição para Switch 2 com Stardrop Mountain em 2027",
    excerpt:"TAITO anuncia Bubble Bobble 4 Friends para Nintendo Switch 2 com a nova expansão Stardrop Mountain, alta resolução e Camera Play.",
    body:`A TAITO anunciou Bubble Bobble 4 Friends: The Baron is Back! – Nintendo Switch 2 Edition + Stardrop Mountain. O jogo será lançado mundialmente em 25 de fevereiro de 2027 para Nintendo Switch 2.

A principal novidade é Stardrop Mountain, uma expansão com fases de rolagem vertical que muda a estrutura tradicional de telas fixas da série. A edição também terá resolução de 1920×1080 e suporte ao Camera Play, recurso que permite inserir imagens dos jogadores dentro das bolhas.

O pacote mantém o cooperativo local para até quatro pessoas e reúne o conteúdo de Bubble Bobble 4 Friends e The Baron is Back!. Segundo as informações divulgadas, são 200 fases, além da versão arcade original de Bubble Bobble, lançada em 1986.

Quem já possui a edição de Nintendo Switch poderá acessar a versão de Switch 2 por meio de um upgrade pago. A TAITO ainda não detalhou preço ou disponibilidade específica do upgrade para a eShop brasileira.

O anúncio chega no ano em que Bubble Bobble completa 40 anos e coloca uma das séries clássicas da TAITO entre os lançamentos confirmados para o Switch 2 em 2027.`,
    source:"https://www.taito.co.jp/en/mob/topics/47410",
    sourceLabel:"TAITO",
    hero:"https://www.taito.co.jp/Content/images/zone/0/news/201407/efa14a2d-8dac-4e15-96df-e7b0a37054ab_p_02_ja.webp",
    seoTitle:"Bubble Bobble 4 Friends chega ao Switch 2 em fevereiro de 2027",
    seoDescription:"TAITO anuncia Bubble Bobble 4 Friends para Nintendo Switch 2 com Stardrop Mountain, Camera Play e lançamento em 25 de fevereiro de 2027."
  },
  {
    slug:"middle-earth-shadow-bundle-lancamento-switch-2",
    title:"Middle-earth: Shadow Bundle chega ao Nintendo Switch 2 com os dois jogos completos",
    excerpt:"Shadow of Mordor GOTY e Shadow of War Definitive Edition chegam juntos ao Nintendo Switch 2 no Middle-earth: Shadow Bundle.",
    body:`Middle-earth: Shadow Bundle chegou ao Nintendo Switch 2 em 30 de setembro de 2026, reunindo Middle-earth: Shadow of Mordor Game of the Year Edition e Middle-earth: Shadow of War Definitive Edition.

É a estreia dos dois jogos da série Shadow em uma plataforma Nintendo. O pacote preserva o Nemesis System, mecânica pela qual inimigos desenvolvem características e lembranças dos encontros com o jogador.

Shadow of Mordor inclui o jogo base e seus conteúdos adicionais da edição Game of the Year. Shadow of War chega na Definitive Edition, que reúne as expansões de história Desolation of Mordor e Blade of Galadriel, além dos pacotes Slaughter Tribe e Outlaw Tribe.

Os dois títulos também podem ser adquiridos separadamente. A versão para Switch 2 foi publicada pela Aspyr, enquanto os jogos originais foram desenvolvidos pela Monolith Productions.

A chegada do bundle amplia o catálogo de jogos de ação e aventura do Switch 2 e permite que a saga completa de Talion seja jogada no ecossistema Nintendo pela primeira vez.`,
    source:"https://www.gematsu.com/2026/09/middle-earth-shadow-bundle-announced-for-switch-2",
    sourceLabel:"Gematsu / Aspyr",
    hero:null,
    seoTitle:"Middle-earth: Shadow Bundle chega ao Nintendo Switch 2",
    seoDescription:"Shadow of Mordor GOTY e Shadow of War Definitive Edition chegam ao Nintendo Switch 2 em um pacote com os conteúdos adicionais."
  }
];

async function og(url){
  try{const r=await fetch(url,{headers:{"user-agent":"CheckpointNEditorial/2.0"}});const h=await r.text();return (h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)||h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)||[])[1]||null}catch{return null}
}
let published=0, skipped=0;
for(const a of items){
  const exists=await sql`SELECT id,title FROM articles WHERE (slug=${a.slug} OR source_url=${a.source}) AND status<>'archived' LIMIT 1`;
  if(exists.length){console.log("SKIP",a.slug,exists[0].id);skipped++;continue}
  const hero=a.hero||await og(a.source);
  if(!hero){console.log("NO_HERO",a.slug);continue}
  await sql`INSERT INTO articles(slug,title,excerpt,body,type,status,author_name,source_label,source_url,hero_url,seo_title,seo_description,featured,published_at)
  VALUES(${a.slug},${a.title},${a.excerpt},${a.body},'news','published','Checkpoint N',${a.sourceLabel},${a.source},${hero},${a.seoTitle},${a.seoDescription},false,now())`;
  console.log("PUBLISHED",a.slug);published++;
}

const games=[
 {title:"Bubble Bobble 4 Friends: The Baron is Back! – Nintendo Switch 2 Edition + Stardrop Mountain",slug:"bubble-bobble-4-friends-switch-2-stardrop-mountain",excerpt:"Bub e Bob retornam ao Switch 2 com Stardrop Mountain e cooperativo local.",description:"Edição para Nintendo Switch 2 de Bubble Bobble 4 Friends com The Baron is Back!, a expansão Stardrop Mountain, Camera Play e o Bubble Bobble arcade original.",platforms:["Nintendo Switch 2"],genres:["Ação","Puzzle"],developer:"TAITO",publisher:"TAITO",cover:"https://www.taito.co.jp/Content/images/zone/0/news/201407/efa14a2d-8dac-4e15-96df-e7b0a37054ab_p_02_ja.webp",release:"2027-02-25"},
 {title:"Middle-earth: Shadow Bundle",slug:"middle-earth-shadow-bundle",excerpt:"Shadow of Mordor GOTY e Shadow of War Definitive Edition em um único pacote.",description:"Coletânea para Nintendo Switch 2 que reúne Middle-earth: Shadow of Mordor Game of the Year Edition e Middle-earth: Shadow of War Definitive Edition.",platforms:["Nintendo Switch 2"],genres:["Ação","Aventura"],developer:"Monolith Productions / Aspyr",publisher:"Aspyr",cover:null,release:"2026-09-30"}
];
for(const g of games){
 const found=await sql`SELECT id FROM games WHERE slug=${g.slug} OR lower(title)=lower(${g.title}) LIMIT 1`;
 if(found.length){console.log("GAME_EXISTS",g.slug);continue}
 let cover=g.cover;
 if(!cover && g.slug==="middle-earth-shadow-bundle") cover=await og("https://www.gematsu.com/games/middle-earth-shadow-bundle");
 if(!cover){console.log("GAME_NO_IMAGE",g.slug);continue}
 await sql`INSERT INTO games(title,slug,excerpt,description,platforms,genres,developer,publisher,cover_url,hero_url,release_date,status,featured)
 VALUES(${g.title},${g.slug},${g.excerpt},${g.description},${g.platforms},${g.genres},${g.developer},${g.publisher},${cover},${cover},${g.release},'published',false)`;
 console.log("GAME_PUBLISHED",g.slug);
}
console.log(JSON.stringify({published,skipped}));
