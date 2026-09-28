import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const sql = neon(databaseUrl);

const reviewed = [
  {
    key: "prince-of-persia",
    find: async () => sql`
      SELECT id,title,slug,hero_url,source_url,status
      FROM articles
      WHERE status='draft' AND lower(title) LIKE '%prince of persia%'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT 1
    `,
    title: "Prince of Persia: The Lost Crown fica grátis por tempo limitado no Nintendo Switch Online",
    excerpt: "Assinantes do Nintendo Switch Online podem jogar Prince of Persia: The Lost Crown completo até 1º de outubro, com progresso preservado e desconto temporário na versão digital.",
    body: "A Nintendo liberou um Teste de Jogo de Prince of Persia: The Lost Crown para assinantes do Nintendo Switch Online no Brasil. O acesso ao jogo completo começou em 24 de setembro, às 14h, e fica disponível até 1º de outubro, às 3h59, no horário de Brasília. Durante a ação, o progresso salvo pode ser mantido caso o jogador compre o título depois. A versão digital também está com 70% de desconto na Nintendo eShop e na Nintendo Store até 8 de outubro, às 3h59. Assinantes que participarem do teste ainda podem completar uma missão para receber 100 pontos de platina My Nintendo. O jogo de ação e plataforma da Ubisoft coloca o jogador no papel de Sargon e mistura combate acrobático, exploração e poderes de manipulação do tempo.",
    sourceLabel: "Nintendo",
    sourceUrl: "https://www.nintendo.com/pt-br/whatsnew/experimente-o-teste-de-jogo-mais-recente-prince-of-persia-the-lost-crown/",
    seoTitle: "Prince of Persia está grátis no Nintendo Switch Online por tempo limitado",
    seoDescription: "Prince of Persia: The Lost Crown está liberado para assinantes do Nintendo Switch Online até 1º de outubro, com 70% de desconto na versão digital."
  },
  {
    key: "game-key-card",
    find: async () => sql`
      SELECT id,title,slug,hero_url,source_url,status
      FROM articles
      WHERE status='draft' AND (
        lower(title) LIKE '%cartão de acesso%' OR
        lower(title) LIKE '%cartao de acesso%' OR
        source_url LIKE '%cartao-de-acesso-de-jogo%'
      )
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT 1
    `,
    title: "Nintendo explica como funcionam os cartões de acesso de jogo do Switch 2",
    excerpt: "A Nintendo detalhou as diferenças entre cartões físicos, jogos digitais e cartões de acesso do Switch 2, incluindo download inicial, armazenamento e empréstimo.",
    body: "A Nintendo publicou um guia para esclarecer como funcionam os cartões de acesso de jogo do Nintendo Switch 2. Diferentemente dos cartões físicos convencionais, que armazenam os dados do jogo no próprio cartucho, o cartão de acesso funciona como uma chave física: ao inseri-lo pela primeira vez, o console baixa os dados do jogo pela internet e os armazena na memória interna ou em um cartão microSD Express compatível. Depois do download inicial, o jogo pode ser iniciado sem nova conexão obrigatória, mas o cartão precisa permanecer inserido no console para jogar. Outra diferença importante é que o cartão de acesso não fica vinculado a uma conta Nintendo, o que permite emprestá-lo a outra pessoa; no outro console, os dados do jogo serão baixados novamente. Já os jogos digitais ficam ligados à conta usada na compra ou no resgate.",
    sourceLabel: "Nintendo",
    sourceUrl: "https://www.nintendo.com/pt-br/whatsnew/nao-sabe-muito-bem-o-que-e-um-cartao-de-acesso-de-jogo-vamos-conversar/",
    seoTitle: "Cartão de acesso do Switch 2: entenda como funciona",
    seoDescription: "Nintendo explica como funcionam os cartões de acesso do Switch 2, por que exigem download inicial, como ocupam armazenamento e como podem ser emprestados."
  },
  {
    key: "ea-sports-fc-27",
    find: async () => sql`
      SELECT id,title,slug,hero_url,source_url,status
      FROM articles
      WHERE status='draft' AND lower(title) LIKE '%ea sports fc%27%'
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT 1
    `,
    title: "EA SPORTS FC 27 já está disponível com The Grounds, novidades no FUT e versão Lite",
    excerpt: "EA SPORTS FC 27 foi lançado mundialmente em 25 de setembro com o novo The Grounds, mudanças no Modo Carreira e Ultimate Team, além de uma versão Lite gratuita.",
    body: "A Electronic Arts lançou mundialmente o EA SPORTS FC 27 em 25 de setembro para PlayStation 5, PlayStation 4, Xbox Series X|S, Xbox One, PC, Nintendo Switch e Nintendo Switch 2. Entre as principais novidades está The Grounds, espaço social de futebol com partidas rápidas, duelos de 1 contra 1 e integração com Clubs nas plataformas compatíveis. O Modo Carreira recebeu um mercado de transferências reformulado, novas cláusulas e desafios criados pela comunidade, enquanto o Football Ultimate Team ganhou a FUT Gallery, novos tipos de itens e eventos para um jogador. A EA também disponibilizou o FC 27 Lite, uma introdução gratuita com seleção limitada de modos, incluindo Jogo Rápido, Aprenda a Jogar, Amistosos Online e Temporadas Online. Assinantes do EA Play têm ainda acesso a um teste de 10 horas, com progresso transferível para o jogo completo.",
    sourceLabel: "Electronic Arts",
    sourceUrl: "https://www.ea.com/news/fc-27-launches-today",
    seoTitle: "EA SPORTS FC 27 já foi lançado: veja as principais novidades",
    seoDescription: "EA SPORTS FC 27 já está disponível mundialmente com The Grounds, mudanças no Modo Carreira e Ultimate Team, versão Lite gratuita e teste pelo EA Play."
  }
];

const results = [];

for (const item of reviewed) {
  const rows = await item.find();
  const article = rows[0];
  if (!article) {
    results.push({ key: item.key, status: "not_found" });
    continue;
  }
  if (!article.hero_url || !String(article.hero_url).trim()) {
    results.push({ key: item.key, id: article.id, title: article.title, status: "skipped_missing_hero" });
    continue;
  }

  const updated = await sql`
    UPDATE articles
    SET
      title=${item.title},
      type='news',
      status='published',
      excerpt=${item.excerpt},
      body=${item.body},
      author_name='Checkpoint N',
      source_label=${item.sourceLabel},
      source_url=${item.sourceUrl},
      seo_title=${item.seoTitle},
      seo_description=${item.seoDescription},
      published_at=COALESCE(published_at, now()),
      updated_at=now()
    WHERE id=${article.id}
      AND status='draft'
      AND hero_url IS NOT NULL
      AND btrim(hero_url)<>''
    RETURNING id,title,slug,status,published_at,hero_url,source_url
  `;

  if (updated[0]) {
    await sql`
      UPDATE editorial_inbox
      SET status='drafted', updated_at=now()
      WHERE source_url=${article.source_url}
        AND status IN ('new','reviewed','drafted')
    `;
    results.push({ key: item.key, status: "published", article: updated[0] });
  } else {
    results.push({ key: item.key, id: article.id, status: "not_updated" });
  }
}

console.log("CHECKPOINT_REVIEWED_PUBLISH " + JSON.stringify(results));
