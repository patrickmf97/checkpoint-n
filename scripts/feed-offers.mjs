import { neon } from "@neondatabase/serverless";

const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl) throw new Error("DATABASE_URL is required");
const sql=neon(databaseUrl);

const offers=[
  {
    aliases:["Pokémon Legends: Z-A","Pokémon Legends Z-A","Pokemon Legends Z-A"],
    title:"Pokémon Legends Z-A (Switch 2) — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/910941/jogo-pokemon-legends-z-a-nintendo-switch-2-nt000056nsw",
    price:369.00,
    oldPrice:436.45,
    source:"KaBuM!"
  },
  {
    aliases:["The Legend of Zelda: Tears of the Kingdom","The Legend of Zelda Tears of the Kingdom","Zelda: Tears of the Kingdom"],
    title:"The Legend of Zelda: Tears of the Kingdom — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/458675/jogo-the-legend-of-zelda-tears-of-the-kingdom-nintendo-switch-hbcpaxn7a",
    price:353.30,
    oldPrice:440.75,
    source:"KaBuM!"
  },
  {
    aliases:["Super Smash Bros. Ultimate","Super Smash Bros Ultimate"],
    title:"Super Smash Bros. Ultimate — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/483315/jogo-super-smash-bros-ultimate-nintendo-switch-hbcpaaaba",
    price:305.90,
    oldPrice:365.48,
    source:"KaBuM!"
  },
  {
    aliases:["Mario & Luigi: Brothership","Mario & Luigi Brothership"],
    title:"Mario & Luigi: Brothership — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/648940/jogo-mario-luigi-brothership-nintendo-switch-nt000002nsw",
    price:273.95,
    oldPrice:349.00,
    source:"KaBuM!"
  },
  {
    aliases:["Mario Kart World"],
    title:"Mario Kart World — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/779793/jogo-mario-kart-world-nintendo-switch-2",
    price:425.90,
    oldPrice:null,
    source:"KaBuM!"
  },
  {
    aliases:["Mario Kart 8 Deluxe"],
    title:"Mario Kart 8 Deluxe — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/483316/jogo-mario-kart-8-deluxe-nintendo-switch-hbcpaabpa",
    price:324.57,
    oldPrice:null,
    source:"KaBuM!"
  },
  {
    aliases:["Metroid Prime 4: Beyond","Metroid Prime 4 Beyond"],
    title:"Metroid Prime 4: Beyond — KaBuM! no PIX",
    url:"https://www.kabum.com.br/produto/952752/jogo-metroid-prime-4-beyond-para-nintendo-switch-nt000062nsw",
    price:324.57,
    oldPrice:null,
    source:"KaBuM!"
  }
];

const normalize=(value="")=>value
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase()
  .replace(/™|®/g,"")
  .replace(/[^a-z0-9]+/g," ")
  .trim();

const games=await sql`SELECT id,title FROM games WHERE status='published' ORDER BY title`;
const stores=await sql`SELECT id,name FROM stores ORDER BY name`;
const kabum=stores.find((s)=>normalize(s.name)==="kabum")||stores.find((s)=>normalize(s.name).includes("kabum"));
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

  const existing=await sql`SELECT id,price FROM offers WHERE game_id=${game.id} AND url=${item.url} LIMIT 1`;
  if(existing.length){
    const previous=Number(existing[0].price);
    await sql`UPDATE offers
      SET title=${item.title},store_id=${kabum?.id||null},price=${item.price},old_price=${item.oldPrice},
          is_active=true,last_checked_at=now()
      WHERE id=${existing[0].id}`;
    if(previous!==item.price) await sql`INSERT INTO price_history(offer_id,price) VALUES(${existing[0].id},${item.price})`;
    updated++;
    results.push({status:"updated",game:game.title,price:item.price,oldPrice:item.oldPrice});
  }else{
    const rows=await sql`INSERT INTO offers(game_id,store_id,title,url,price,old_price,is_active,last_checked_at)
      VALUES(${game.id},${kabum?.id||null},${item.title},${item.url},${item.price},${item.oldPrice},true,now())
      RETURNING id`;
    await sql`INSERT INTO price_history(offer_id,price) VALUES(${rows[0].id},${item.price})`;
    inserted++;
    results.push({status:"inserted",game:game.title,price:item.price,oldPrice:item.oldPrice});
  }
}

console.log(JSON.stringify({games:games.map(g=>g.title),store:kabum?.name||null,inserted,updated,skipped,results},null,2));
