import {ArrowRight,BookOpen,CalendarDays,Clock3,Gamepad2,Newspaper,ShoppingBag,Tag,Zap} from "lucide-react";
import {getArticles,getGames,getOffers} from "@/lib/content";

export const dynamic="force-dynamic";

const formatDate=(value:any)=>value?new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(value)):"";
const formatPrice=(value:any)=>Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const discount=(price:any,oldPrice:any)=>{const p=Number(price),o=Number(oldPrice);return o>p&&o>0?Math.round((1-p/o)*100):0};

const cards=[
  ["Switch 2","Tudo sobre a nova geração, jogos e recursos.","/jogos"],
  ["Guias","Conteúdo direto para aproveitar mais cada jogo.","/guias"],
  ["Ofertas","Preços e oportunidades reunidos em um só lugar.","/ofertas"]
];

export default async function Home(){
  const [news,guides,games,offers]=await Promise.all([
    getArticles("news"),
    getArticles("guide"),
    getGames(),
    getOffers()
  ]);

  const featured=news.slice(0,3);
  const remainingNews=news.slice(3,7);
  const latestNews=remainingNews.length>=2?remainingNews:news.slice(0,4);
  const featuredGames=games.slice(0,4);
  const recentGuides=guides.slice(0,3);
  const upcoming=[...games]
    .filter((g:any)=>g.release_date&&new Date(g.release_date).getTime()>=Date.now()-86400000)
    .sort((a:any,b:any)=>new Date(a.release_date).getTime()-new Date(b.release_date).getTime())
    .slice(0,5);
  const weeklyOffers=offers.slice(0,4);

  return <main>
    <section className="hero">
      <div className="eyebrow"><Zap size={15}/> SEU CHECKPOINT NINTENDO</div>
      <h1>Jogue mais.<br/><em>Descubra antes.</em></h1>
      <p>Notícias, guias, lançamentos e ofertas em uma experiência feita para a comunidade Nintendo brasileira.</p>
      <div className="actions">
        <a className="primary" href="/noticias">Últimas notícias <ArrowRight size={18}/></a>
        <a className="secondary" href="/jogos">Explorar jogos</a>
      </div>
    </section>

    <section className="section">
      <div className="sectionHead"><div><small>EXPLORE</small><h2>Tudo em um só checkpoint.</h2></div><Gamepad2/></div>
      <div className="grid">
        {cards.map(([t,d,href],i)=><article className="card" key={t}>
          <span>0{i+1}</span><h3>{t}</h3><p>{d}</p>
          <a href={href}>Explorar <ArrowRight size={16}/></a>
        </article>)}
      </div>
    </section>

    {featured.length>0&&<section className="homeSection">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><Newspaper size={16}/></span><small>EM DESTAQUE</small><h2>Agora no Checkpoint.</h2></div>
        <a href="/noticias">Todas as notícias <ArrowRight size={16}/></a>
      </div>
      <div className="featureGrid">
        <a className="featureMain" href={"/noticias/"+featured[0].slug}>
          <div className="featureMedia">
            {featured[0].hero_url?<img src={featured[0].hero_url} alt={featured[0].title}/>:<div className="mediaFallback">N</div>}
          </div>
          <div className="featureCopy">
            <small>{featured[0].category||"NINTENDO"} · DESTAQUE</small>
            <h3>{featured[0].title}</h3>
            <p>{featured[0].excerpt}</p>
            <span>Leia a matéria <ArrowRight size={16}/></span>
          </div>
        </a>
        <div className="featureSide">
          {featured.slice(1).map((a:any)=><a className="featureSideCard" href={"/noticias/"+a.slug} key={a.id}>
            {a.hero_url?<img src={a.hero_url} alt="" loading="lazy"/>:<div className="mediaFallback small">N</div>}
            <div><small>{a.category||"NINTENDO"}</small><h3>{a.title}</h3><span>{formatDate(a.published_at)}</span></div>
          </a>)}
        </div>
      </div>
    </section>}

    {latestNews.length>0&&<section className="homeSection compactTop">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><Clock3 size={16}/></span><small>ÚLTIMAS NOTÍCIAS</small><h2>O que acabou de acontecer.</h2></div>
        <a href="/noticias">Ver tudo <ArrowRight size={16}/></a>
      </div>
      <div className="newsGrid">
        {latestNews.map((a:any)=><a className="newsCard" href={"/noticias/"+a.slug} key={a.id}>
          {a.hero_url?<img src={a.hero_url} alt="" loading="lazy"/>:<div className="mediaFallback news">N</div>}
          <div><small>{a.category||"NINTENDO"} · {formatDate(a.published_at)}</small><h3>{a.title}</h3><p>{a.excerpt}</p></div>
        </a>)}
      </div>
    </section>}

    {featuredGames.length>0&&<section className="homeSection">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><Gamepad2 size={16}/></span><small>JOGOS EM DESTAQUE</small><h2>Escolha sua próxima aventura.</h2></div>
        <a href="/jogos">Explorar catálogo <ArrowRight size={16}/></a>
      </div>
      <div className="homeGameGrid">
        {featuredGames.map((g:any)=><a className="homeGameCard" href={"/jogos/"+g.slug} key={g.id}>
          {g.cover_url?<img src={g.cover_url} alt={"Capa de "+g.title} loading="lazy"/>:<div className="mediaFallback coverFallback">{g.title.slice(0,1)}</div>}
          <div className="homeGameCopy"><small>{(g.platforms||[]).join(" · ")||"NINTENDO"}</small><h3>{g.title}</h3><p>{g.excerpt}</p><span>Ver jogo <ArrowRight size={15}/></span></div>
        </a>)}
      </div>
    </section>}

    {recentGuides.length>0&&<section className="homeSection">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><BookOpen size={16}/></span><small>GUIAS RECENTES</small><h2>Menos dúvida. Mais jogo.</h2></div>
        <a href="/guias">Todos os guias <ArrowRight size={16}/></a>
      </div>
      <div className="guideGrid">
        {recentGuides.map((g:any)=><a className="guideCard" href={"/guias/"+g.slug} key={g.id}>
          {g.hero_url?<img src={g.hero_url} alt="" loading="lazy"/>:<div className="mediaFallback guide">GUIA</div>}
          <div><small>{g.game_title||g.category||"GUIA"}</small><h3>{g.title}</h3><p>{g.excerpt}</p><span>Abrir guia <ArrowRight size={15}/></span></div>
        </a>)}
      </div>
    </section>}

    {upcoming.length>0&&<section className="homeSection releaseSection">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><CalendarDays size={16}/></span><small>PRÓXIMOS CHECKPOINTS</small><h2>Fique de olho no calendário.</h2></div>
        <a href="/jogos">Ver jogos <ArrowRight size={16}/></a>
      </div>
      <div className="releaseList">
        {upcoming.map((g:any)=><a className="releaseItem" href={"/jogos/"+g.slug} key={g.id}>
          <time dateTime={String(g.release_date)}><b>{new Intl.DateTimeFormat("pt-BR",{day:"2-digit",timeZone:"UTC"}).format(new Date(g.release_date))}</b><span>{new Intl.DateTimeFormat("pt-BR",{month:"short",timeZone:"UTC"}).format(new Date(g.release_date)).replace(".","").toUpperCase()}</span></time>
          <div><small>{(g.platforms||[]).join(" · ")||"NINTENDO"}</small><h3>{g.title}</h3></div>
          <ArrowRight size={18}/>
        </a>)}
      </div>
    </section>}

    {weeklyOffers.length>0&&<section className="homeSection">
      <div className="homeSectionHead">
        <div><span className="sectionIcon"><ShoppingBag size={16}/></span><small>OFERTAS DA SEMANA</small><h2>Mais jogo pelo melhor preço.</h2></div>
        <a href="/ofertas">Todas as ofertas <ArrowRight size={16}/></a>
      </div>
      <div className="offerGrid">
        {weeklyOffers.map((o:any)=><a className="homeOffer" href={o.url} rel="nofollow sponsored" target="_blank" key={o.id}>
          <div className="offerTop"><small>{o.store_name||"LOJA"}</small>{discount(o.price,o.old_price)>0&&<b>-{discount(o.price,o.old_price)}%</b>}</div>
          <h3>{o.game_title}</h3>
          <div className="homePrice">{o.old_price&&Number(o.old_price)>Number(o.price)&&<del>{formatPrice(o.old_price)}</del>}<strong>{formatPrice(o.price)}</strong></div>
          <span>Ver oferta <ArrowRight size={15}/></span>
        </a>)}
      </div>
    </section>}

    <section className="newsletter">
      <Tag/>
      <div><small>CHECKPOINT DROP</small><h2>Não perca seu próximo checkpoint.</h2><p>Notícias, guias, lançamentos e quedas de preço. Sem spam.</p></div>
      <form action="/api/newsletter" method="post"><input name="email" type="email" required placeholder="seu@email.com"/><button>Quero receber</button></form>
    </section>
  </main>
}