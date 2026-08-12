/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node asset utility */
const sharp = require("sharp");
const { rename } = require("node:fs/promises");

const WIDTH = 1264;
const HEIGHT = 1618;

// The main-village illustrations were painted over a white canvas before
// being keyed to alpha. The original connected-background pass cannot reach
// pale matte islands enclosed by branches, so clean only the two known canopy
// zones. Architecture and the downward terrain extension are outside them.
const CANOPY_ZONES = [
  { left: 55, top: 0, right: 525, bottom: 455 },
  { left: 900, top: 155, right: 1215, bottom: 500 },
];

function inCanopy(x, y) {
  return CANOPY_ZONES.some(
    (zone) => x > zone.left && x < zone.right && y > zone.top && y < zone.bottom,
  );
}

async function cleanNightWithDaySilhouette(dayPath, nightPath) {
  const day = await sharp(dayPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const night = await sharp(nightPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (day.info.width !== WIDTH || day.info.height !== HEIGHT || night.info.width !== WIDTH || night.info.height !== HEIGHT) {
    throw new Error("Unexpected foreground dimensions; review canopy zones before running this cleanup.");
  }

  // Night was generated from the same aligned composition but retained a
  // denser white matte. The already-clean day alpha is the safest semantic
  // guide for where sky should pass through. A one-pixel dilation preserves
  // night foliage that is only slightly fuller, while removing the large
  // enclosed matte sheets responsible for the pale canopy blobs.
  const dayAlphaDilated = Buffer.alloc(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      let maxAlpha = 0;
      for (let sampleY = Math.max(0, y - 1); sampleY <= Math.min(HEIGHT - 1, y + 1); sampleY += 1) {
        for (let sampleX = Math.max(0, x - 1); sampleX <= Math.min(WIDTH - 1, x + 1); sampleX += 1) {
          maxAlpha = Math.max(maxAlpha, day.data[(sampleY * WIDTH + sampleX) * 4 + 3]);
        }
      }
      dayAlphaDilated[y * WIDTH + x] = maxAlpha;
    }
  }

  const output = Buffer.from(night.data);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (!inCanopy(x, y)) continue;
      const pixel = (y * WIDTH + x) * 4;
      const cleanedAlpha = Math.min(output[pixel + 3], dayAlphaDilated[y * WIDTH + x]);
      output[pixel + 3] = cleanedAlpha;
      if (cleanedAlpha === 0) {
        output[pixel] = 0;
        output[pixel + 1] = 0;
        output[pixel + 2] = 0;
      }
    }
  }

  const temporaryPath = `${nightPath}.cleaned`;
  await sharp(output, { raw: night.info }).png().toFile(temporaryPath);
  await rename(temporaryPath, nightPath);
}

async function main() {
  const [dayPath, nightPath] = process.argv.slice(2);
  if (!dayPath || !nightPath) {
    throw new Error("Usage: node scripts/clean-foreground-foliage.js DAY.png NIGHT.png");
  }
  await cleanNightWithDaySilhouette(dayPath, nightPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
