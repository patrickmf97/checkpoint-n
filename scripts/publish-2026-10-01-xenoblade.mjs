import { neon } from "@neondatabase/serverless";
const sql=neon(process.env.DATABASE_URL);
const source="https://www.nintendo.com/jp/topics/article/cf2ecdd9-7072-408b-99b5-40bd7b48e884";
const store="https://www.nintendo.com/us/store/products/xenoblade-chronicles-2-nintendo-switch-2-edition-switch-2/";
const slug="xenoblade-chronicles-2-switch-2-edition-versao-fisica";
async function meta(url){const r=await fetch(url,{headers:{"user-agent":"Mozilla/5.0 CheckpointNEditorial/2.0"}});if(!r.ok)throw new Error("HTTP "+r.status);const h=await r.text();const m=h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)||h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);return m?.[1]||null}
async function imageOK(url){if(!url)return false;const r=await fetch(url,{redirect:"follow",headers:{"user-agent":"Mozilla/5.0","accept":"image/avif,image/webp,image/png,image/jpeg,*/*"}});return r.ok&&(r.headers.get("content-type")||"").startsWith("image/")}
const dup=await sql`SELECT id,title FROM articles WHERE slug=${slug} OR source_url=${source} LIMIT 1`;
let hero=await meta(source); if(!await imageOK(hero)) hero=await meta(store); if(!await imageOK(hero)) throw new Error("NO_VALID_OFFICIAL_IMAGE");
if(!dup.length){
 const title="Xenoblade Chronicles 2 ganha edição física para Nintendo Switch 2";
 const excerpt="Edição física de Xenoblade Chronicles 2 para Switch 2 chega em 1º de outubro, enquanto versão digital e pacote de melhoria já estão disponíveis.";
 const body=`A Nintendo lançou em 1º de outubro de 2026 a edição física de Xenoblade Chronicles 2 – Nintendo Switch 2 Edition. A versão digital e o pacote de melhoria para quem já possui o jogo original já estavam disponíveis.

A edição para Nintendo Switch 2 aprimora a aventura de Rex e Pyra com resolução de até 4K no modo TV em telas compatíveis e Full HD no modo portátil, com taxa de até 60 quadros por segundo.

Além das melhorias técnicas, esta edição adiciona conteúdo novo. A Blade rara MOMO possui duas formas, clara e sombria, que podem ser alternadas e mudam sua afinidade elemental. O jogo também recebe o modo Merc Assault, no qual o jogador controla diretamente as Blades enviadas em missões de mercenários, além de novos visuais para Pyra e Mythra.

Xenoblade Chronicles 2 é um RPG ambientado em Alrest, um mundo coberto por um mar de nuvens onde civilizações vivem sobre criaturas gigantes chamadas Titans. A história acompanha Rex e Pyra em sua busca por Elysium.

Para quem já tem Xenoblade Chronicles 2 no Nintendo Switch, a Nintendo oferece separadamente o pacote de melhoria para acessar os recursos da Switch 2 Edition. A disponibilidade e os preços podem variar conforme a região da Nintendo eShop.`;
 await sql`INSERT INTO articles(slug,title,excerpt,body,type,status,author_name,source_label,source_url,hero_url,seo_title,seo_description,featured,published_at) VALUES(${slug},${title},${excerpt},${body},'news','published','Checkpoint N','Nintendo',${source},${hero},'Xenoblade Chronicles 2 ganha edição física no Switch 2','Nintendo lança a edição física de Xenoblade Chronicles 2 para Switch 2, com 4K, 60 fps, MOMO, Merc Assault e novos visuais.',false,now())`;
 console.log("ARTICLE_PUBLISHED");
}else console.log("ARTICLE_DUPLICATE",dup[0].id);

const gameSlug="xenoblade-chronicles-2-nintendo-switch-2-edition";
const games=await sql`SELECT id FROM games WHERE slug=${gameSlug} OR lower(title)=lower('Xenoblade Chronicles 2 – Nintendo Switch 2 Edition') LIMIT 1`;
if(!games.length){
 await sql`INSERT INTO games(title,slug,excerpt,description,platforms,genres,developer,publisher,cover_url,hero_url,release_date,status,featured) VALUES('Xenoblade Chronicles 2 – Nintendo Switch 2 Edition',${gameSlug},'A jornada de Rex e Pyra retorna aprimorada no Nintendo Switch 2.','Edição aprimorada de Xenoblade Chronicles 2 com resolução de até 4K no modo TV, Full HD portátil, até 60 fps, a nova Blade MOMO, modo Merc Assault e novos visuais para Pyra e Mythra.',ARRAY['Nintendo Switch 2'],ARRAY['RPG','Ação'],'MONOLITHSOFT','Nintendo',${hero},${hero},'2026-07-30','published',false)`;
 console.log("GAME_PUBLISHED");
}else{
 await sql`UPDATE games SET excerpt='A jornada de Rex e Pyra retorna aprimorada no Nintendo Switch 2.',description='Edição aprimorada de Xenoblade Chronicles 2 com resolução de até 4K no modo TV, Full HD portátil, até 60 fps, a nova Blade MOMO, modo Merc Assault e novos visuais para Pyra e Mythra.',platforms=ARRAY['Nintendo Switch 2'],genres=ARRAY['RPG','Ação'],developer='MONOLITHSOFT',publisher='Nintendo',cover_url=${hero},hero_url=${hero},release_date='2026-07-30',status='published' WHERE id=${games[0].id}`;
 console.log("GAME_UPDATED",games[0].id);
}