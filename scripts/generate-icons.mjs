import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

function svgFor(size) {
  const r = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.52);
  return Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="'Noto Sans JP','Yu Gothic','Hiragino Sans',sans-serif"
    font-size="${fontSize}" font-weight="700" fill="#7dd3fc">あ</text>
</svg>`);
}

async function makePng(size) {
  return sharp(svgFor(size)).png().toBuffer();
}

mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, await makePng(size));
  writeFileSync(`public/icons/icon-${size}-maskable.png`, await makePng(size));
}

writeFileSync("public/icons/apple-touch-icon.png", await makePng(180));
writeFileSync("public/favicon.png", await makePng(32));

console.log("PWA icons generated.");
