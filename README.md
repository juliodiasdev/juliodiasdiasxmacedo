# Todas as vezes que pensei em você

> Um lugar para guardar tudo aquilo que meu coração nunca conseguiu explicar por completo.

Experiência web narrativa, um presente, feita com Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Motion, Lucide e Supabase.

## Capítulos

| # | Capítulo | O que acontece |
|---|---|---|
| 1 | Antes de entrar | As frases surgem uma a uma. O botão inicia a transição. A música é opcional e só toca se ela escolher. |
| 2 | Todas as vezes que pensei em você | Diário em linha do tempo, com filtros por categoria, “Especiais” e “Novos”. Cada pensamento abre como uma página de diário, com foto e áudio. |
| 3 | Momentos que eu guardaria para sempre | Galeria editorial com formatos variados, profundidade discreta e visualização ampliada (foto ou vídeo, história, sentimento, áudio). Dá para deslizar entre as memórias. |
| 4 | As pequenas coisas sobre você | Bilhetes dobrados, abertos um de cada vez. |
| 5 | A vida que imagino com você | Fragmentos marcados como “um dia, talvez”. São sonhos e planos, nunca fatos. |
| 6 | A carta | Texto livre, revelado parágrafo a parágrafo durante a leitura. |
| 7 | Isso não termina aqui | Volta ao diário e mostra quantos pensamentos novos chegaram desde a última visita (registrado no próprio aparelho dela). |

A ordem dos capítulos 2 a 6 pode ser mudada no painel. Vídeos (interlúdios) podem ser inseridos entre os capítulos.

## Estrutura

```
content/                 ← TODO o conteúdo pessoal (modo local). Nada pessoal no código.
  site.json              textos, ordem dos capítulos, música, interlúdios
  thoughts.json          pensamentos (photoId → media.json)
  memories.json          memórias (mediaId → media.json)
  details.json           pequenas coisas
  future.json            sonhos de futuro (mediaId opcional)
  letter.json            a carta
  categories.json        categorias do diário
  media.json             catálogo das mídias reais (gerado pelo inventário)
public/media/originals/  ← suas fotos e vídeos ORIGINAIS (nunca são alterados)
public/media/web/        versões derivadas (capas de vídeo, MP4 compatível), recriáveis
scripts/
  media-inventory.mjs    inventário técnico das mídias + relatório
  media-prepare.mjs      gera capas e vídeos compatíveis com celular
supabase/
  schema.sql             tabelas, RLS, bucket de armazenamento e políticas
  seed.sql               categorias iniciais (opcional)
src/
  app/                   rotas: / · /admin/* · /preview
  components/experience/ capítulos e narrativa
  components/admin/      formulários do painel
  components/ui/         primitivos (revelação, mídia, áudio, diálogo acessível)
  lib/content/           camada de dados: local (/content) ou Supabase
  lib/auth.ts            verificação de administrador (servidor)
  proxy.ts               proteção de /admin e /preview
```

## Dois modos de funcionamento

**Modo local** (sem variáveis de ambiente): o site lê `content/`. Para mudar algo, edite os arquivos e faça um novo deploy. Neste modo o `/admin` mostra só as instruções de configuração. Ele não finge salvar nada.

**Modo Supabase** (com as variáveis preenchidas): banco, autenticação e armazenamento ativos. O `/admin` permite:

- criar, editar e excluir pensamentos, salvar rascunhos e publicar;
- enviar fotos, vídeos e áudios;
- criar e editar memórias, categorias, pequenas coisas e sonhos de futuro;
- editar a carta;
- editar os textos de abertura e encerramento;
- reordenar os capítulos;
- configurar a música e os vídeos entre capítulos;
- marcar conteúdo como especial;
- ver em `/preview` a experiência como ela verá, com os rascunhos marcados.

Segurança:

- Visitantes só leem o que está publicado: o RLS do Postgres garante isso.
- Só usuários na tabela `admins` escrevem no banco e no bucket `media`.
- `ADMIN_EMAIL` adiciona uma segunda verificação no servidor.
- Nenhuma chave de serviço é usada: o navegador recebe apenas a chave pública *anon*.
- Toda página e ação do painel verifica o administrador por conta própria.

## Suas fotos e vídeos

1. Coloque os arquivos originais em `public/media/originals/` (subpastas são permitidas).
2. Rode o inventário:

   ```bash
   npm run media:inventory
   ```

   Ele gera `content/media.json` e `content/media-inventory.md`, com dimensões, orientação, duração, codec, tom de luz, data dos metadados e sugestões *técnicas* de capítulo.
3. Gere as versões compatíveis com celular. Os vídeos `.mov`/HEVC do iPhone viram MP4 H.264 com capa; os originais ficam intactos.

   ```bash
   npm run media:prepare
   ```

4. Em `content/media.json`, preencha `alt` (o que aparece na imagem) e `chapter`.
5. Referencie as mídias pelo `id`:
   - em `memories.json`: `"mediaId": "id-da-foto"`;
   - em `thoughts.json`: `"photoId": "..."`;
   - em `site.json`: `"interludes": [{ "afterChapter": "thoughts", "mediaId": "id-do-video", "caption": null }]`.

As fotos são otimizadas na entrega pelo `next/image` (AVIF/WebP no tamanho de cada tela), sem recomprimir o arquivo original. O tratamento “cinematográfico” é só um leve ajuste de tom via CSS mais granulação sobreposta. Nenhum rosto é alterado e nenhuma imagem é gerada.

> Repositórios no GitHub têm limite de 100 MB por arquivo. Para vídeos grandes, use o modo Supabase e envie pelo painel, ou use Git LFS.

## Rodar localmente

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:3000. Para verificar tudo (tipos, lint e build):

```bash
npm run check
```

## Ativar o Supabase

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, execute `supabase/schema.sql` e, se quiser, `supabase/seed.sql`.
3. Em **Authentication → Users**, crie o seu usuário. Em **Authentication → Providers → Email**, desative *Allow new users to sign up*.
4. Autorize o seu usuário:

   ```sql
   insert into public.admins (user_id) values ('SEU-USER-ID');
   ```

5. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAIL` e `NEXT_PUBLIC_SITE_URL`.
6. Reinicie e acesse `/admin`.

No modo Supabase, os textos-padrão de `content/site.json` e `content/letter.json` servem de ponto de partida até você salvar a sua versão no painel.

## Publicar na Vercel

1. Importe o repositório na Vercel. O framework é detectado automaticamente.
2. Em **Settings → Environment Variables**, adicione as mesmas variáveis do `.env.local`.
3. Faça o deploy. O site é marcado como `noindex` para não aparecer em buscadores.

Novos pensamentos publicados pelo painel aparecem na hora, porque cada ação revalida a página.

## Acessibilidade e desempenho

- Respeita `prefers-reduced-motion`: sem parallax, sem partículas, sem vídeo automático.
- Diálogos com foco preso, `Esc` para fechar e setas do teclado para navegar.
- Alvos de toque de pelo menos 44 px e controles na parte de baixo da tela, ao alcance do polegar.
- Áreas seguras do iPhone respeitadas (`env(safe-area-inset-*)`).
- Fontes servidas pelo `next/font` (sem requisição externa em produção).
- Áudio e música nunca tocam sem um gesto dela.
