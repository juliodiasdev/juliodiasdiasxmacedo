# Todas as vezes que pensei em você

> Um lugar para guardar tudo aquilo que meu coração nunca conseguiu explicar por completo.

Experiência web narrativa, um presente, feita com Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Motion e Lucide.

É um site **100% estático**: sem banco de dados, sem login, sem serviços externos. Todo o conteúdo fica em arquivos na pasta `content/`.

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

A ordem dos capítulos 2 a 6 é definida em `content/site.json` (`chapterOrder`). Vídeos (interlúdios) podem ser inseridos entre os capítulos.

## Estrutura

```
content/                 ← TODO o conteúdo pessoal. Nada pessoal no código.
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
src/
  app/                   página única + estados de carregamento, erro e 404
  components/experience/ capítulos e narrativa
  components/ui/         primitivos (revelação, mídia, áudio, diálogo acessível)
  lib/content/           lê e valida os arquivos de /content
```

## Como editar e adicionar conteúdo

Tudo é feito editando os arquivos de `content/` (em qualquer editor ou direto no GitHub) e publicando de novo.

- **Novo pensamento:** adicione um item em `content/thoughts.json` (copie um existente e troque `id`, `title`, `body`, `categoryId`, `createdAt` e `publishedAt`). Use `"status": "draft"` para guardar sem mostrar e `"isSpecial": true` para destacar.
- **Memórias:** `content/memories.json` (`mediaId` aponta para a foto ou vídeo em `media.json`).
- **Carta:** `content/letter.json`. No campo `body`, use `\n\n` entre parágrafos.
- **Textos, ordem dos capítulos, música e vídeos entre capítulos:** `content/site.json`.
- **Áudios pessoais e música:** coloque o arquivo em `public/media/` e informe o caminho (ex.: `"audioSrc": "/media/audio/voz.m4a"`). A música só toca se ela ativar o botão na entrada.

Na Vercel, cada `git push` publica a nova versão em cerca de um minuto. Na próxima visita, ela vê os pensamentos novos marcados como “novo” e o final mostra quantos chegaram.

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

> O GitHub aceita arquivos de até 100 MB (25 MB pelo navegador). Para vídeos maiores, rode `npm run media:prepare`, que gera versões menores, e use essas.

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

## Publicar na Vercel

1. Importe o repositório na Vercel. O framework é detectado automaticamente.
2. Opcional: em **Settings → Environment Variables**, defina `NEXT_PUBLIC_SITE_URL`.
3. Faça o deploy. Não há nada para configurar além disso. O site é marcado como `noindex` para não aparecer em buscadores.

## Acessibilidade e desempenho

- Respeita `prefers-reduced-motion`: sem parallax, sem partículas, sem vídeo automático.
- Diálogos com foco preso, `Esc` para fechar e setas do teclado para navegar.
- Alvos de toque de pelo menos 44 px e controles na parte de baixo da tela, ao alcance do polegar.
- Áreas seguras do iPhone respeitadas (`env(safe-area-inset-*)`).
- Fontes servidas pelo `next/font` (sem requisição externa em produção).
- Áudio e música nunca tocam sem um gesto dela.
