import {neon} from "@neondatabase/serverless";
const sql=neon(process.env.DATABASE_URL);
const decode=(s="")=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
const meta=(h,re)=>decode((h.match(re)||[])[1]||"");
const abs=(u,b)=>{try{return new URL(u,b).toString()}catch{return ""}};
const slugify=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,180);
const items=await sql`SELECT i.id,i.source_url,i.source_title,i.source_published_at,s.name source_name FROM editorial_inbox i LEFT JOIN editorial_sources s ON s.id=i.source_id WHERE i.status='new' AND COALESCE(i.source_published_at,i.created_at)>=now()-interval '72 hours' ORDER BY i.source_published_at DESC LIMIT 60`;
let published=0,duplicates=0,pending=0;
for(const i of items){try{
 const r=await fetch(i.source_url,{headers:{"user-agent":"CheckpointNEditorialBot/2.1","accept":"text/html"}});if(!r.ok){pending++;continue}
 const h=await r.text();
 const title=(meta(h,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)||i.source_title).replace(/\s+[-|–]\s+Nintendo.*$/i,"").trim();
 const description=meta(h,/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)/i).replace(/\s+/g," ").trim();
 const raw=meta(h,/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/i)||meta(h,/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i);
 const image=abs(raw,i.source_url),slug=slugify(title);
 const d=await sql`SELECT id FROM articles WHERE (source_url=${i.source_url} OR slug=${slug}) AND status<>'archived' LIMIT 1`;
 if(d.length){await sql`UPDATE editorial_inbox SET status='duplicate',updated_at=now() WHERE id=${i.id}`;duplicates++;continue}
 if(!image||/logo|favicon|icon[-_.]|social-share\.jpg/i.test(image)||description.length<60){pending++;continue}
 const excerpt=description.slice(0,260);
 const body=excerpt+"\n\nA informação foi divulgada por "+(i.source_name||"fonte oficial")+". O Checkpoint N acompanha a novidade e atualizará esta matéria se novos detalhes oficiais forem publicados.";
 await sql`INSERT INTO articles(slug,title,excerpt,body,type,status,author_name,source_label,source_url,hero_url,seo_title,seo_description,featured,published_at) VALUES(${slug},${title},${excerpt},${body},'news','published','Checkpoint N',${i.source_name||"Fonte oficial"},${i.source_url},${image},${title.slice(0,70)},${excerpt.slice(0,160)},false,${i.source_published_at||new Date().toISOString()})`;
 await sql`UPDATE editorial_inbox SET status='published',notes=${"auto_published;hero:"+image},updated_at=now() WHERE id=${i.id}`;
 console.log("PUBLISHED",slug);published++;
}catch(e){console.warn("PUBLISH_FAILED",i.source_url,e?.message||e);pending++}}
console.log(JSON.stringify({publisher:true,candidates:items.length,published,duplicates,pending}));


const curated=[
 {slug:"star-fox-atualizacao-gratuita-multiplayer-switch-2",title:"Star Fox recebe atualização gratuita com multiplayer para quatro jogadores no Switch 2",excerpt:"Atualização gratuita de Star Fox adiciona tela dividida para quatro jogadores, equipes online e três novas fases ao Battle Mode no Nintendo Switch 2.",source:"https://www.nintendo.com/pt-br/whatsnew/reuna-a-tripulacao-uma-atualizacao-gratuita-esta-decolando-no-star-fox/",label:"Nintendo Brasil",body:"Star Fox recebeu uma atualização gratuita no Nintendo Switch 2 com novidades importantes para o Battle Mode. O jogo agora permite partidas locais em tela dividida para até quatro jogadores no mesmo console.\n\nA atualização acrescenta três fases: Katina, Setor X e Venom. Também é possível formar uma equipe com até quatro jogadores no mesmo Switch 2 e participar de batalhas online. Para os recursos online, é necessária uma assinatura do Nintendo Switch Online e uma Conta Nintendo.\n\nA atualização já está disponível gratuitamente. A novidade amplia principalmente as opções multiplayer de Star Fox e cria novas possibilidades para quem joga em grupo."},
 {slug:"bubble-bobble-4-friends-switch-2-stardrop-mountain",title:"Bubble Bobble 4 Friends ganha edição para Switch 2 com Stardrop Mountain",excerpt:"Bubble Bobble 4 Friends: The Baron is Back! terá edição para Nintendo Switch 2 com Stardrop Mountain e lançamento previsto para 25 de fevereiro de 2027.",source:"https://nintendoeverything.com/bubble-bobble-4-friends-the-baron-is-back-nintendo-switch-2-edition-stardrop-mountain-revealed/",label:"Nintendo Everything / TAITO",body:"Bubble Bobble 4 Friends: The Baron is Back! – Nintendo Switch 2 Edition + Stardrop Mountain foi anunciado para o Nintendo Switch 2. O lançamento está previsto para 25 de fevereiro de 2027.\n\nA nova edição traz Stardrop Mountain e mantém o foco cooperativo da série, permitindo que até quatro pessoas joguem juntas localmente. A versão também aproveita recursos do Switch 2 e reúne conteúdo de Bubble Bobble 4 Friends e The Baron is Back!.\n\nO lançamento marca mais uma aparição de Bub e Bob na nova geração da Nintendo. O Checkpoint N atualizará a página conforme preço e disponibilidade brasileira forem oficialmente detalhados."},
 {slug:"middle-earth-shadow-bundle-switch-2-lancamento",title:"Middle-earth: Shadow Bundle chega ao Nintendo Switch 2",excerpt:"Pacote reúne Shadow of Mordor GOTY e Shadow of War Definitive Edition no Nintendo Switch 2, incluindo as expansões das duas aventuras.",source:"https://www.gematsu.com/2026/09/middle-earth-shadow-bundle-announced-for-switch-2",label:"Gematsu / Aspyr",body:"Middle-earth: Shadow Bundle chega ao Nintendo Switch 2 reunindo Middle-earth: Shadow of Mordor Game of the Year Edition e Middle-earth: Shadow of War Definitive Edition.\n\nO pacote leva a saga e o Nemesis System ao console da Nintendo. Shadow of Mordor inclui o conteúdo da edição Game of the Year, enquanto Shadow of War chega na Definitive Edition, com expansões de história e conteúdo adicional.\n\nOs dois jogos também são oferecidos individualmente. A coletânea foi anunciada pela Aspyr para lançamento em 30 de setembro de 2026 no Nintendo Switch 2."}
];
for(const a of curated){try{
 const d=await sql\`SELECT id FROM articles WHERE (slug=\${a.slug} OR source_url=\${a.source}) AND status<>'archived' LIMIT 1\`;if(d.length){console.log("CURATED_DUPLICATE",a.slug);continue}
 const r=await fetch(a.source,{headers:{"user-agent":"CheckpointNEditorialBot/2.1","accept":"text/html"}});if(!r.ok){console.warn("CURATED_SOURCE_FAILED",a.slug,r.status);continue}
 const h=await r.text();const raw=meta(h,/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/i)||meta(h,/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i);const hero=abs(raw,a.source);
 if(!hero||/logo|favicon|icon[-_.]/i.test(hero)){console.warn("CURATED_IMAGE_PENDING",a.slug);continue}
 await sql\`INSERT INTO articles(slug,title,excerpt,body,type,status,author_name,source_label,source_url,hero_url,seo_title,seo_description,featured,published_at) VALUES(\${a.slug},\${a.title},\${a.excerpt},\${a.body},'news','published','Checkpoint N',\${a.label},\${a.source},\${hero},\${a.title.slice(0,70)},\${a.excerpt.slice(0,160)},false,now())\`;
 console.log("CURATED_PUBLISHED",a.slug);
}catch(e){console.warn("CURATED_FAILED",a.slug,e?.message||e)}}
