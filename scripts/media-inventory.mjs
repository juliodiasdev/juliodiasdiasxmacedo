#!/usr/bin/env node
/**
 * Inventário das mídias reais.
 *
 * Lê (sem modificar) os arquivos em public/media/originals, extrai metadados técnicos
 * (dimensões, orientação, duração, codec, data EXIF quando existir, tom de luz médio)
 * e:
 *   1. atualiza content/media.json, preservando o que você já editou (alt, chapter, notes);
 *   2. gera content/media-inventory.md, um relatório legível com sugestões de capítulo.
 *
 * As sugestões são apenas técnicas (formato, luz, duração). O sentido emocional de cada
 * imagem — e qualquer data ou história — vem de você.
 *
 * Uso: npm run media:inventory
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import exifr from "exifr";

const ROOT = process.cwd();
const ORIGINALS = join(ROOT, "public/media/originals");
const WEB = join(ROOT, "public/media/web");
const MANIFEST = join(ROOT, "content/media.json");
const REPORT = join(ROOT, "content/media-inventory.md");

const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif", ".gif"]);
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm", ".3gp", ".avi", ".mkv"]);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.name.startsWith(".")) return [];
    return e.isDirectory() ? walk(p) : [p];
  });

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function probe(file) {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file],
      { encoding: "utf8" },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

/** Cor média do quadro (1x1 px) para descrever a luz: clara/escura, quente/fria. */
function averageColor(file, isVideo) {
  try {
    const args = ["-v", "error"];
    if (isVideo) args.push("-ss", "1");
    args.push("-i", file, "-frames:v", "1", "-vf", "scale=1:1:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-");
    const buf = execFileSync("ffmpeg", args);
    if (buf.length < 3) return null;
    return { r: buf[0], g: buf[1], b: buf[2] };
  } catch {
    return null;
  }
}

function describeLight(c) {
  if (!c) return null;
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const light = lum < 70 ? "escura / noturna" : lum < 140 ? "luz média" : "clara";
  const warmth = c.r - c.b > 18 ? "tons quentes" : c.b - c.r > 12 ? "tons frios" : "tons neutros";
  return { luminance: Math.round(lum), label: `${light}, ${warmth}` };
}

function rotationOf(stream) {
  const side = stream?.side_data_list?.find((s) => s.rotation !== undefined);
  const r = Number(side?.rotation ?? stream?.tags?.rotate ?? 0);
  return Math.abs(r) % 180 === 90;
}

/** Sugestões técnicas — sempre revisáveis. */
function suggest(item) {
  const s = [];
  if (item.kind === "video") {
    if (item.duration && item.duration <= 20) s.push({ chapter: "interlude", why: "curto: funciona como pausa cinematográfica entre capítulos" });
    if (item.duration && item.duration > 20) s.push({ chapter: "moments", why: "mais longo: melhor como memória que ela escolhe assistir, com controles" });
    if (item.orientation === "portrait") s.push({ chapter: "moments", why: "vertical: natural no celular dela" });
    return s;
  }
  if (item.orientation === "landscape") s.push({ chapter: "moments", why: "horizontal: abre bem em formato panorâmico na galeria" });
  if (item.orientation === "portrait") s.push({ chapter: "moments", why: "vertical: compõe bem como retrato ao lado de outra imagem" });
  if (item.light?.luminance !== undefined && item.light.luminance < 70) s.push({ chapter: "thoughts", why: "luz baixa e intimista: combina com pensamentos de saudade" });
  if (item.light?.luminance !== undefined && item.light.luminance > 150) s.push({ chapter: "future", why: "luz clara e aberta: combina com a atmosfera de sonho do futuro" });
  if (item.orientation === "square") s.push({ chapter: "details", why: "quadrada: funciona como detalhe" });
  return s;
}

async function main() {
  if (!existsSync(ORIGINALS)) {
    console.error("Pasta public/media/originals não encontrada.");
    process.exit(1);
  }
  const files = walk(ORIGINALS).filter((f) => IMAGE.has(extname(f).toLowerCase()) || VIDEO.has(extname(f).toLowerCase()));
  const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { items: [] };
  const byFile = new Map((previous.items ?? []).map((i) => [i.file, i]));

  const items = [];
  for (const abs of files.sort()) {
    const rel = relative(join(ROOT, "public/media"), abs).split("\\").join("/");
    const ext = extname(abs).toLowerCase();
    const kind = VIDEO.has(ext) ? "video" : "image";
    const meta = probe(abs);
    const v = meta?.streams?.find((s) => s.codec_type === "video");
    const a = meta?.streams?.find((s) => s.codec_type === "audio");
    let width = v?.width ?? null;
    let height = v?.height ?? null;
    if (rotationOf(v)) [width, height] = [height, width];

    let exif = null;
    if (kind === "image") {
      try {
        exif = await exifr.parse(abs, { pick: ["DateTimeOriginal", "CreateDate", "Orientation", "Make", "Model", "latitude", "longitude"] });
      } catch {
        exif = null;
      }
      if (exif?.Orientation && [5, 6, 7, 8].includes(exif.Orientation) && width && height) [width, height] = [height, width];
    }

    const ratio = width && height ? width / height : null;
    const orientation = !ratio ? null : ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square";
    const takenAt = exif?.DateTimeOriginal ?? exif?.CreateDate ?? meta?.format?.tags?.creation_time ?? null;
    const name = basename(abs, ext);
    const id = slug(name) || `midia-${items.length + 1}`;
    const posterFile = join(WEB, `${id}.poster.jpg`);
    const webVideo = join(WEB, `${id}.mp4`);
    const webJpeg = join(WEB, `${id}.jpg`);
    const prev = byFile.get(rel) ?? {};

    const item = {
      id: prev.id ?? id,
      file: rel,
      kind,
      width,
      height,
      orientation,
      sizeMB: +(statSync(abs).size / 1024 / 1024).toFixed(2),
      takenAt: takenAt ? new Date(takenAt).toISOString() : null,
      hasGps: Boolean(exif?.latitude),
      duration: kind === "video" && meta?.format?.duration ? +Number(meta.format.duration).toFixed(1) : null,
      videoCodec: kind === "video" ? (v?.codec_name ?? null) : null,
      hasAudio: kind === "video" ? Boolean(a) : null,
      light: describeLight(averageColor(abs, kind === "video")),
      webSrc:
        kind === "video" && existsSync(webVideo)
          ? `/media/web/${id}.mp4`
          : kind === "image" && existsSync(webJpeg)
            ? `/media/web/${id}.jpg`
            : null,
      poster: kind === "video" && existsSync(posterFile) ? `/media/web/${id}.poster.jpg` : (prev.poster ?? null),
      needsConversion:
        (kind === "video" && (v?.codec_name !== "h264" || ext !== ".mp4")) || [".heic", ".heif"].includes(ext),
      // Campos editáveis por você (preservados entre execuções):
      alt: prev.alt ?? "",
      chapter: prev.chapter ?? null,
      notes: prev.notes ?? "",
      suggestions: [],
    };
    item.suggestions = suggest(item);
    items.push(item);
  }

  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        $comment:
          "Gerado por `npm run media:inventory`. Edite apenas alt, chapter e notes; o resto é recalculado. Referencie as mídias pelo id em memories.json (mediaId), thoughts.json (photoId), future.json (mediaId) e site.json (interludes[].mediaId).",
        items,
      },
      null,
      2,
    ) + "\n",
  );

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
  const lines = [
    "# Inventário de mídias",
    "",
    `Gerado em ${new Date().toLocaleString("pt-BR")}. ${items.length} arquivo(s): ${items.filter((i) => i.kind === "image").length} foto(s), ${items.filter((i) => i.kind === "video").length} vídeo(s).`,
    "",
    "> As sugestões abaixo são **técnicas** (formato, luz, duração). Nenhuma história ou data foi inventada: a data exibida vem apenas dos metadados do arquivo, quando existem, e não aparece no site a menos que você a escreva.",
    "",
    "| id | tipo | formato | dimensões | duração | data do arquivo | luz | sugestão | precisa converter |",
    "|---|---|---|---|---|---|---|---|---|",
    ...items.map(
      (i) =>
        `| \`${i.id}\` | ${i.kind === "video" ? "vídeo" : "foto"} | ${i.orientation ?? "?"} | ${i.width ?? "?"}×${i.height ?? "?"} | ${i.duration ? `${i.duration}s` : "—"} | ${fmtDate(i.takenAt)} | ${i.light?.label ?? "—"} | ${i.suggestions.map((s) => `${s.chapter}: ${s.why}`).join("<br>") || "—"} | ${!i.needsConversion ? "não" : i.webSrc ? "convertido" : "sim (`npm run media:prepare`)"} |`,
    ),
    "",
    "## O que preciso saber de você para cada mídia",
    "",
    "Para cada item que for para o site, preencha em `content/media.json` (ou me envie):",
    "",
    "1. **alt** — o que aparece na imagem, de forma objetiva (acessibilidade).",
    "2. **chapter** — onde ela deve aparecer: `moments`, `thoughts`, `details`, `future` ou `interlude`.",
    "3. Para memórias: **título**, **o que aconteceu**, **o que você sentiu**, e se quiser **data** e **local** reais.",
    "4. Para vídeos de interlúdio: depois de qual capítulo ele deve tocar e se terá legenda.",
    "",
  ];
  writeFileSync(REPORT, lines.join("\n"));
  console.log(`✓ ${items.length} mídia(s) inventariada(s).`);
  console.log("  → content/media.json");
  console.log("  → content/media-inventory.md");
  const conv = items.filter((i) => i.needsConversion && !i.webSrc).length;
  if (conv) console.log(`  ${conv} arquivo(s) precisam de conversão para tocar em todos os celulares: npm run media:prepare`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
