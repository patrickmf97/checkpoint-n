export type EditorialMeta={title:string;description:string;hero:string;published:string;quality:{source:boolean;image:boolean;seo:boolean;duplicate:boolean};score:number};

const decode=(s:string="")=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
const pick=(html:string,re:RegExp)=>decode((html.match(re)||[])[1]||"");
const absolute=(u:string,base:string)=>{try{return new URL(u,base).toString()}catch{return ""}};
const badImage=(u:string)=>!u||/social-share\.jpg|logo|favicon|icon[-_.]/i.test(u);
export function cleanTitle(s:string){return decode(s).replace(/\s+[-|–]\s+(Novidades\s+[-|–]\s+)?Site Oficial.*$/i,"").replace(/\s+[-|–]\s+Nintendo.*$/i,"").trim()}
export function extractMeta(html:string,url:string):EditorialMeta{
 const title=cleanTitle(pick(html,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)||pick(html,/<title[^>]*>([^<]+)/i));
 const description=pick(html,/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)/i);
 const candidates:string[]=[];
 for(const re of [/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)/gi,/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/gi,/"image"\s*:\s*["']([^"']+)["']/gi,/(https:\/\/assets\.nintendo\.com\/[^"'<> ]+)/gi]){for(const m of html.matchAll(re))candidates.push(absolute(m[1],url))}
 const hero=candidates.find(x=>!badImage(x))||"";
 const published=pick(html,/<meta[^>]+(?:property|name)=["'](?:article:published_time|date|datePublished)["'][^>]+content=["']([^"']+)/i);
 const seo=title.length>=20&&title.length<=90&&description.length>=60;
 const score=(hero?35:0)+(description?25:0)+(title?20:0)+(published?10:0)+10;
 return {title,description,hero,published,quality:{source:true,image:!!hero,seo,duplicate:false},score};
}
export function priority(title:string,published?:string|null){
 let p=0;const t=title.toLowerCase();
 if(/nintendo direct|switch 2|lançamento|lancamento|disponível|disponivel|atualização|atualizacao/.test(t))p+=40;
 if(/oferta|promoção|promocao|teste|demo|gratuito|grátis|gratis/.test(t))p+=25;
 if(/brasil|português|portugues/.test(t))p+=20;
 if(/ícone|icone|wallpaper|tema/.test(t))p-=15;
 if(published&&Date.now()-new Date(published).getTime()<48*3600e3)p+=20;
 return p;
}
export function buildDraft(title:string,description:string,sourceUrl:string,sourceName:string){
 const excerpt=(description||("Acompanhe os principais detalhes de "+title+" e o que a novidade representa para jogadores Nintendo.")).slice(0,260);
 const body=[excerpt,"","O que foi anunciado","",description||"A fonte oficial confirmou a novidade. A redação deve complementar este trecho com os detalhes essenciais antes da publicação.","","O que você precisa saber","","Confira datas, disponibilidade, plataformas, preços e condições na fonte oficial. Acrescente contexto próprio do Checkpoint N antes de publicar.","","Fonte: "+sourceName+" — "+sourceUrl].join("\n");
 return {excerpt,body,seoTitle:title.slice(0,70),seoDescription:excerpt.slice(0,160)};
}