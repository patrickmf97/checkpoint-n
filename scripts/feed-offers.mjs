import { neon } from "@neondatabase/serverless";

const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl) throw new Error("DATABASE_URL is required");
const sql=neon(databaseUrl);

const offers=[
  {
    aliases:["Prince of Persia: The Lost Crown","Prince of Persia The Lost Crown"],
    title:"Prince of Persia: The Lost Crown — 70% OFF na Nintendo Store",
    url:"https://www.nintendo.com/pt-br/store/products/prince-of-persia-the-lost-crown-switch/",
    price:44.99,
    oldPrice:149.99,
    retailer:"Nintendo Store"
  },
  {
    aliases:["Minecraft Dungeons II"],
    title:"Minecraft Dungeons II Deluxe Edition — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/1062740/jogo-minecraft-dungeons-ii-deluxe-edition-nintendo-switch-2-nsca10000036fgr",
    price:297.52,
    oldPrice:355.44,
    retailer:"KaBuM!"
  },
  {
    aliases:["EA SPORTS FC 27","EA Sports FC 27"],
    title:"EA SPORTS FC 27 — Nintendo Switch 2 digital",
    url:"https://www.nintendo.com/pt-br/store/products/ea-sports-fc-27-switch-2/",
    price:349.00,
    oldPrice:null,
    retailer:"Nintendo Store"
  },
  {
    aliases:["The Witcher 3: Wild Hunt — Remastered","The Witcher 3: Wild Hunt - Remastered"],
    title:"The Witcher 3: Wild Hunt — Remastered — Nintendo Switch 2 digital",
    url:"https://www.nintendo.com/pt-br/store/products/the-witcher-3-wild-hunt-remastered-switch-2/",
    price:199.00,
    oldPrice:null,
    retailer:"Nintendo Store"
  },
  {
    aliases:["Fire Emblem: Fortune’s Weave","Fire Emblem: Fortune's Weave"],
    title:"Fire Emblem: Fortune’s Weave — Nintendo Switch 2 digital",
    url:"https://www.nintendo.com/pt-br/store/products/fire-emblem-fortunes-weave-switch-2/",
    price:389.90,
    oldPrice:null,
    retailer:"Nintendo Store"
  }
];

const normalize=(value="")=>value
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase()
  .replace(/™|®/g,"")
  .replace(/[’‘]/g,"'")
  .replace(/[—–]/g,"-")
  .replace(/[^a-z0-9]+/g," ")
  .trim();

const games=await sql`SELECT id,title FROM games WHERE status='published' ORDER BY title`;
const stores=await sql`SELECT id,name FROM stores ORDER BY name`;
let inserted=0,updated=0,skipped=0;
const results=[];

for(const item of offers){
  const normalizedAliases=item.aliases.map(normalize);
  const game=games.find((g)=>normalizedAliases.includes(normalize(g.title)))
    || games.find((g)=>normalizedAliases.some((a)=>normalize(g.title).includes(a)||a.includes(normalize(g.title))));
  if(!game){
    skipped++;
    results.push({status:"skipped",reason:"game_not_found",aliases:item.aliases});
    continue;
  }

  const store=stores.find((s)=>normalize(s.name)===normalize(item.retailer))
    || stores.find((s)=>normalize(s.name).includes(normalize(item.retailer))||normalize(item.retailer).includes(normalize(s.name)));

  const existing=await sql`SELECT id,price FROM offers WHERE game_id=${game.id} AND url=${item.url} LIMIT 1`;
  if(existing.length){
    const previous=Number(existing[0].price);
    await sql`UPDATE offers
      SET title=${item.title},store_id=${store?.id||null},price=${item.price},old_price=${item.oldPrice},
          is_active=true,last_checked_at=now()
      WHERE id=${existing[0].id}`;
    if(previous!==item.price) await sql`INSERT INTO price_history(offer_id,price) VALUES(${existing[0].id},${item.price})`;
    updated++;
    results.push({status:"updated",game:game.title,retailer:item.retailer,price:item.price,oldPrice:item.oldPrice});
  }else{
    const rows=await sql`INSERT INTO offers(game_id,store_id,title,url,price,old_price,is_active,last_checked_at)
      VALUES(${game.id},${store?.id||null},${item.title},${item.url},${item.price},${item.oldPrice},true,now())
      RETURNING id`;
    await sql`INSERT INTO price_history(offer_id,price) VALUES(${rows[0].id},${item.price})`;
    inserted++;
    results.push({status:"inserted",game:game.title,retailer:item.retailer,price:item.price,oldPrice:item.oldPrice});
  }
}

console.log(JSON.stringify({inserted,updated,skipped,results},null,2));
