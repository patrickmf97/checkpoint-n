import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const item = {
  slug:"nintendo-switch-2-atualizacao-23-0-1-corrige-lentidao",
  title:"Nintendo Switch 2 recebe atualização 23.0.1 que corrige lentidão ao abrir e fechar jogos",
  excerpt:"Nintendo libera a versão 23.0.1 do sistema do Switch 2 para corrigir um problema da atualização anterior que podia deixar softwares lentos ao iniciar, pausar ou fechar.",
  body:`A Nintendo disponibilizou em 30 de setembro de 2026 a atualização de sistema 23.0.1 para o Nintendo Switch 2. O novo firmware é uma correção pontual para um problema introduzido na versão 23.0.0.

Segundo a página oficial de suporte da Nintendo para o Brasil, alguns softwares podiam demorar mais do que o esperado para iniciar, pausar ou fechar após a atualização anterior. A versão 23.0.1 foi lançada especificamente para solucionar esse comportamento.

A atualização pode ser instalada pela internet. Normalmente, o Nintendo Switch 2 baixa a versão mais recente automaticamente quando está conectado, mas também é possível iniciar a verificação manualmente em Configuração do console > Console > Atualização do console.

A versão 23.0.0, lançada em 9 de setembro, havia trazido uma lista bem maior de novidades, incluindo suporte a VRR no modo TV, mudanças no GameChat, novos recursos para cartões de jogo virtuais, transferência de dados entre consoles Switch 2 e melhorias de acessibilidade em português do Brasil.

Para quem percebeu demora incomum ao abrir ou encerrar jogos depois da atualização de setembro, portanto, vale confirmar se o console já está na versão 23.0.1.`,
  source:"https://pt-americas-support.nintendo.com/app/answers/detail/a_id/69978/p/1095/c/947",
  sourceLabel:"Nintendo",
  seoTitle:"Switch 2: atualização 23.0.1 corrige lentidão em jogos",
  seoDescription:"Nintendo libera a atualização 23.0.1 do Switch 2, corrigindo lentidão ao iniciar, pausar ou fechar softwares após a versão 23.0.0."
};

function abs(u,b){try{return new URL(u,b).toString()}catch{return null}}
async function pageMeta(url){
  const r=await fetch(url,{headers:{"user-agent":"Mozilla/5.0 CheckpointNEditorial/2.0","accept":"text/html"}});
  if(!r.ok) throw new Error("SOURCE_HTTP_"+r.status);
  const h=await r.text();
  const m=h.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/i)
    ||h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i)
    ||h.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i);
  return {image:abs(m?.[1]||"",url)};
}
async function validImage(url){
  if(!url)return false;
  try{
    const r=await fetch(url,{headers:{"user-agent":"Mozilla/5.0 CheckpointNEditorial/2.0","accept":"image/avif,image/webp,image/png,image/jpeg,*/*"},redirect:"follow"});
    return r.ok && (r.headers.get("content-type")||"").startsWith("image/");
  }catch{return false}
}

const dupe=await sql`SELECT id,slug,title FROM articles WHERE slug=${item.slug} OR source_url=${item.source} LIMIT 1`;
if(dupe.length){
  console.log("DUPLICATE",JSON.stringify(dupe[0]));
  process.exit(0);
}
const imagePages=[
  "https://www.nintendo.com/pt-br/gaming-systems/switch-2/",
  "https://www.nintendo.com/us/gaming-systems/switch-2/"
];
let hero=null;
for(const url of imagePages){
  try{
    const candidate=(await pageMeta(url)).image;
    if(await validImage(candidate)){hero=candidate;break}
  }catch{}
}
if(!hero){
  console.log("IMAGE_INVALID_SKIP");
  process.exit(2);
}
const rows=await sql`INSERT INTO articles(slug,title,excerpt,body,type,status,author_name,source_label,source_url,hero_url,seo_title,seo_description,featured,published_at)
VALUES(${item.slug},${item.title},${item.excerpt},${item.body},'news','published','Checkpoint N',${item.sourceLabel},${item.source},${hero},${item.seoTitle},${item.seoDescription},false,now())
RETURNING id,slug,title,hero_url,published_at`;
console.log("PUBLISHED",JSON.stringify(rows[0]));

// publisher configured for one-shot execution
