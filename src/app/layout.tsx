import "./globals.css";
import type {Metadata} from "next";
import {Search, Newspaper, Gamepad2, BookOpen, ShoppingBag} from "lucide-react";

export const metadata:Metadata={
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://checkpoint-n-production.up.railway.app"),
  title:{default:"Checkpoint N — Nintendo, sem enrolação",template:"%s | Checkpoint N"},
  description:"Notícias, guias, jogos, lançamentos e ofertas para a comunidade Nintendo brasileira.",
  openGraph:{type:"website",locale:"pt_BR",siteName:"Checkpoint N"},
  twitter:{card:"summary_large_image"},
  robots:{index:true,follow:true}
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-BR"><body>
  <header className="header">
   <a className="brand" href="/" aria-label="Checkpoint N — início"><span>CHECKPOINT</span><b>N</b></a>
   <nav aria-label="Navegação principal">
    <a href="/noticias"><Newspaper size={15}/>Notícias</a>
    <a href="/jogos"><Gamepad2 size={15}/>Jogos</a>
    <a href="/guias"><BookOpen size={15}/>Guias</a>
    <a href="/ofertas"><ShoppingBag size={15}/>Ofertas</a>
   </nav>
   <a className="headerSearch" href="/busca" aria-label="Buscar no Checkpoint N"><Search size={18}/><span>Buscar</span></a>
  </header>
  {children}
  <footer>
   <div className="footerBrand"><strong>CHECKPOINT <b>N</b></strong><p>Seu checkpoint no universo Nintendo.</p></div>
   <nav><a href="/noticias">Notícias</a><a href="/jogos">Jogos</a><a href="/guias">Guias</a><a href="/ofertas">Ofertas</a></nav>
   <p className="footerLegal">Veículo editorial independente sobre games. Não possui vínculo, patrocínio ou associação com a Nintendo.</p>
  </footer>
 </body></html>
}
// production-sync: 2026-09-30 redesign-and-image-fixes
