import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const sql = neon(databaseUrl);

const decode = (s="") => s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
const abs = (href, base) => { try { return new URL(href, base).toString(); } catch { return null; } };
const titleFrom = (html) => decode((html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)||html.match(/<title[^>]*>([^<]+)/i)||[])[1]||"");
const imageFrom = (html, base) => {
  const m=html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/i)||html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i);
  return m?.[1]?abs(decode(m[1]),base):null;
};
const descriptionFrom = (html) => decode((html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)/i)||[])[1]||"");
const dateFrom = (html) => (html.match(/<meta[^>]+(?:property|name)=["'](?:article:published_time|date|datePublished)["'][^>]+content=["']([^"']+)/i)||[])[1]||null;

const sources = await sql`SELECT id,name,url FROM editorial_sources WHERE active=true ORDER BY name`;
let discovered=0, inserted=0, withImage=0;

for (const source of sources) {
  try {
    const res=await fetch(source.url,{headers:{"user-agent":"CheckpointNEditorialBot/1.0 (+editorial monitoring; human-reviewed publication)","accept":"text/html"}});
    if(!res.ok){console.warn("source fetch failed",source.name,res.status);continue}
    const html=await res.text();
    const links=[...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>/gi)]
      .map(m=>abs(m[1],source.url)).filter(Boolean)
      .filter(u=>{const x=new URL(u);const root=new URL(source.url);return x.hostname===root.hostname && (/\/whatsnew\//i.test(x.pathname)||/\/news\//i.test(x.pathname));});
    const unique=[...new Set(links)].filter(u=>u!==source.url).slice(0,25);
    for(const url of unique){
      discovered++;
      try{
        const page=await fetch(url,{headers:{"user-agent":"CheckpointNEditorialBot/1.0 (+editorial monitoring; human-reviewed publication)","accept":"text/html"}});
        if(!page.ok)continue;
        const body=await page.text(), title=titleFrom(body);
        if(!title||title.length<8)continue;
        const image=imageFrom(body,url), published=dateFrom(body), description=descriptionFrom(body);
        const fingerprint=crypto.createHash("sha256").update(url).digest("hex");
        const rows=await sql`INSERT INTO editorial_inbox(source_id,source_url,source_title,source_published_at,fingerprint,status,notes)
          VALUES(${source.id},${url},${title},${published},${fingerprint},'new',${image?"hero:"+image:(description?"meta:"+description.slice(0,500):"image_pending")})
          ON CONFLICT DO NOTHING RETURNING id`;
        if(rows.length){inserted++;if(image)withImage++}
      }catch(err){console.warn("candidate failed",url,err?.message||err)}
    }
  } catch(err){console.warn("source failed",source.name,err?.message||err)}
}
console.log(JSON.stringify({sources:sources.length,discovered,inserted,withImage}));
