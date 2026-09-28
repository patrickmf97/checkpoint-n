import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin";
import {db} from "@/lib/db";
import {buildDraft,cleanTitle,extractMeta} from "@/lib/editorial";
function slugify(s:string){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,180)}
export async function POST(req:Request){
 if(!(await isAdmin()))return NextResponse.json({error:"unauthorized"},{status:401});
 const f=await req.formData(),id=String(f.get("id")||""),sql=db();
 const rows=await sql`SELECT i.*,s.name source_name FROM editorial_inbox i LEFT JOIN editorial_sources s ON s.id=i.source_id WHERE i.id=${id} LIMIT 1`;
 const item=rows[0];if(!item)return NextResponse.json({error:"not found"},{status:404});
 let meta:any={title:"",description:"",hero:""};
 try{const r=await fetch(item.source_url,{headers:{"user-agent":"CheckpointNEditorial/2.0"},cache:"no-store"});if(r.ok)meta=extractMeta(await r.text(),item.source_url)}catch{}
 const title=cleanTitle(meta.title||String(item.source_title)).replace(/^Experimente o teste de jogo mais recente,?\\s*/i,"Teste grátis: "),slug=slugify(title),draft=buildDraft(title,meta.description,item.source_url,item.source_name||"Fonte oficial");
 const dupe=await sql`SELECT id FROM articles WHERE (source_url=${item.source_url} OR slug=${slug}) AND status<>'archived' LIMIT 1`;
 const inserted=await sql`INSERT INTO articles(slug,title,excerpt,body,type,status,source_label,source_url,hero_url,seo_title,seo_description,featured) VALUES (${slug},${title},${draft.excerpt},${draft.body},${"news"},${"draft"},${item.source_name||"Fonte oficial"},${item.source_url},${meta.hero||null},${draft.seoTitle},${draft.seoDescription},false) ON CONFLICT(slug) DO UPDATE SET source_label=EXCLUDED.source_label,source_url=EXCLUDED.source_url,hero_url=COALESCE(articles.hero_url,EXCLUDED.hero_url),seo_title=COALESCE(articles.seo_title,EXCLUDED.seo_title),seo_description=COALESCE(articles.seo_description,EXCLUDED.seo_description) RETURNING id`;
 await sql`UPDATE editorial_inbox SET status=${"drafted"},notes=${meta.hero?"hero:"+meta.hero:(dupe.length?"duplicate":"image_pending")},updated_at=now() WHERE id=${id}`;
 const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";return NextResponse.redirect(new URL("/admin/editar/"+inserted[0].id,base),303)
}