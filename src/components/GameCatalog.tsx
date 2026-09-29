"use client";
import {useMemo,useState} from "react";
import {Search,SlidersHorizontal} from "lucide-react";

export function GameCatalog({games}:{games:any[]}){
 const [query,setQuery]=useState("");const [platform,setPlatform]=useState("Todos");
 const platforms=useMemo(()=>["Todos",...Array.from(new Set(games.flatMap(g=>g.platforms||[])))],[games]);
 const visible=useMemo(()=>games.filter(g=>(!query||g.title.toLowerCase().includes(query.toLowerCase()))&&(platform==="Todos"||(g.platforms||[]).includes(platform))),[games,query,platform]);
 return <section className="catalogWrap">
  <div className="catalogTools">
   <label className="catalogSearch"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar jogo..." aria-label="Buscar jogo"/></label>
   <div className="platformFilters" aria-label="Filtrar por plataforma"><SlidersHorizontal size={16}/>{platforms.map(p=><button className={platform===p?"active":""} onClick={()=>setPlatform(p)} key={p}>{p}</button>)}</div>
  </div>
  <p className="catalogCount">{visible.length} {visible.length===1?"jogo encontrado":"jogos encontrados"}</p>
  <div className="gameGrid catalogGrid">{visible.map((g:any)=><a className="gameCard" href={"/jogos/"+g.slug} key={g.id}>{g.cover_url?<img className="gameThumb" src={g.cover_url} alt={"Arte de "+g.title} loading="lazy"/>:<div className="cover">{g.title.slice(0,1)}</div>}<small>{(g.platforms||[]).join(" · ")}</small><h2>{g.title}</h2><p>{g.excerpt}</p></a>)}</div>
  {!visible.length&&<div className="empty">Nenhum jogo corresponde aos filtros.</div>}
 </section>
}