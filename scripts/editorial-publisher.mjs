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
