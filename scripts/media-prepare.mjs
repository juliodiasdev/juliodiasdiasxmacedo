#!/usr/bin/env node
/**
 * Prepara versões para a web SEM tocar nos originais.
 *
 * - Vídeos: gera capa (poster) em JPEG e uma versão H.264/AAC em MP4 com "faststart",
 *   compatível com Safari/iPhone e Android. Mantém a resolução até 1920px no lado maior
 *   e usa CRF 20 (qualidade visual alta).
 * - Fotos HEIC/HEIF (não suportadas por navegadores): tenta gerar JPEG de alta qualidade.
 * - Demais fotos: servidas a partir do original e otimizadas na entrega pelo next/image
 *   (AVIF/WebP no tamanho certo para cada tela).
 *
 * Saída: public/media/web/. Depois, o inventário é atualizado automaticamente.
 * Uso: npm run media:prepare
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const WEB = join(ROOT, "public/media/web");
const MANIFEST = join(ROOT, "content/media.json");

mkdirSync(WEB, { recursive: true });
execFileSync("node", ["scripts/media-inventory.mjs"], { stdio: "inherit" });
const { items } = JSON.parse(readFileSync(MANIFEST, "utf8"));

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

for (const item of items) {
  const src = join(ROOT, "public/media", item.file);
  if (item.kind === "video") {
    const poster = join(WEB, `${item.id}.poster.jpg`);
    if (!existsSync(poster)) {
      const at = item.duration && item.duration > 2 ? "1" : "0";
      ff(["-ss", at, "-i", src, "-frames:v", "1", "-q:v", "2", poster]);
      console.log(`  capa: ${item.id}`);
    }
    const out = join(WEB, `${item.id}.mp4`);
    if (item.needsConversion && !existsSync(out)) {
      console.log(`  convertendo vídeo: ${item.file} (pode levar alguns minutos)…`);
      ff([
        "-i", src,
        "-vf", "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k",
        "-movflags", "+faststart",
        out,
      ]);
    }
  } else if (item.needsConversion) {
    const out = join(WEB, `${item.id}.jpg`);
    if (!existsSync(out)) {
      try {
        ff(["-i", src, "-q:v", "2", out]);
        console.log(`  HEIC → JPEG: ${item.id}`);
      } catch {
        console.warn(`  ! Não foi possível converter ${item.file}. Exporte como JPEG no celular (Ajustes › Câmera › Formatos › Mais Compatível).`);
      }
    }
  }
}

execFileSync("node", ["scripts/media-inventory.mjs"], { stdio: "inherit" });
console.log("✓ Mídias preparadas em public/media/web (originais intactos).");
