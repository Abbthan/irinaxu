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

// Day recovery is deliberately shallower than night cleanup: it stops above
// the architecture and only restores foliage against the original white sky.
const DAY_RECOVERY_ZONES = [
  { left: 55, top: 0, right: 525, bottom: 315 },
  { left: 890, top: 155, right: 1195, bottom: 455 },
];

function inCanopy(x, y) {
  return CANOPY_ZONES.some(
    (zone) => x > zone.left && x < zone.right && y > zone.top && y < zone.bottom,
  );
}

function inDayRecoveryZone(x, y) {
  return DAY_RECOVERY_ZONES.some(
    (zone) => x > zone.left && x < zone.right && y > zone.top && y < zone.bottom,
  );
}

function clearLampSkyPocket(output) {
  const left = 555;
  const right = 590;
  const top = 168;
  const bottom = 204;
  const localWidth = right - left;
  const localHeight = bottom - top;
  const barrier = new Uint8Array(localWidth * localHeight);
  const exterior = new Uint8Array(localWidth * localHeight);
  const queue = [];

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const pixel = (y * WIDTH + x) * 4;
      const local = (y - top) * localWidth + (x - left);
      // Dark, strongly opaque painted pixels are the bracket's metal edge.
      barrier[local] = output[pixel + 3] > 150 && Math.max(output[pixel], output[pixel + 1], output[pixel + 2]) < 150 ? 1 : 0;
    }
  }

  const enqueue = (local) => {
    if (local < 0 || local >= exterior.length || barrier[local] || exterior[local]) return;
    exterior[local] = 1;
    queue.push(local);
  };
  for (let x = 0; x < localWidth; x += 1) {
    enqueue(x);
    enqueue((localHeight - 1) * localWidth + x);
  }
  for (let y = 0; y < localHeight; y += 1) {
    enqueue(y * localWidth);
    enqueue(y * localWidth + localWidth - 1);
  }
  while (queue.length) {
    const current = queue.pop();
    const x = current % localWidth;
    if (x > 0) enqueue(current - 1);
    if (x < localWidth - 1) enqueue(current + 1);
    enqueue(current - localWidth);
    enqueue(current + localWidth);
  }

  // Any non-metal pixel the exterior flood cannot reach is enclosed by the
  // bracket. Remove that entire island, including its darker speckles.
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const local = (y - top) * localWidth + (x - left);
      if (barrier[local] || exterior[local]) continue;
      const pixel = (y * WIDTH + x) * 4;
      output[pixel] = 0;
      output[pixel + 1] = 0;
      output[pixel + 2] = 0;
      output[pixel + 3] = 0;
    }
  }
}

async function recoverDayFoliage(rawDayPath, dayPath) {
  const raw = await sharp(rawDayPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const day = await sharp(dayPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (raw.info.width !== WIDTH || day.info.width !== WIDTH || day.info.height !== HEIGHT) {
    throw new Error("Unexpected foreground dimensions; review canopy zones before running this recovery.");
  }

  const output = Buffer.from(day.data);
  const transparentDistance = 4;
  const opaqueDistance = 62;

  for (let y = 0; y < Math.min(raw.info.height, HEIGHT); y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (!inDayRecoveryZone(x, y)) continue;

      const sourcePixel = (y * WIDTH + x) * 3;
      const outputPixel = (y * WIDTH + x) * 4;
      const red = raw.data[sourcePixel];
      const green = raw.data[sourcePixel + 1];
      const blue = raw.data[sourcePixel + 2];
      const whiteDistance = Math.hypot(255 - red, 255 - green, 255 - blue);
      let alpha = Math.max(
        0,
        Math.min(1, (whiteDistance - transparentDistance) / (opaqueDistance - transparentDistance)),
      );
      alpha = alpha * alpha * (3 - 2 * alpha);
      const recoveredAlpha = Math.round(alpha * 255);

      // Add back only source-supported coverage that the existing mask lost.
      // Never reduce or recolor an already-opaque pixel, which keeps every
      // roof, wall, and surviving leaf exactly as deployed.
      if (recoveredAlpha <= output[outputPixel + 3]) continue;
      output[outputPixel] = Math.max(0, Math.min(255, Math.round((red - 255 * (1 - alpha)) / alpha)));
      output[outputPixel + 1] = Math.max(0, Math.min(255, Math.round((green - 255 * (1 - alpha)) / alpha)));
      output[outputPixel + 2] = Math.max(0, Math.min(255, Math.round((blue - 255 * (1 - alpha)) / alpha)));
      output[outputPixel + 3] = recoveredAlpha;
    }
  }

  const temporaryPath = `${dayPath}.recovered`;
  await sharp(output, { raw: day.info }).png().toFile(temporaryPath);
  await rename(temporaryPath, dayPath);
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

async function recoverNightFoliage(rawNightPath, nightPath) {
  const raw = await sharp(rawNightPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const night = await sharp(nightPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (raw.info.width !== WIDTH || night.info.width !== WIDTH || night.info.height !== HEIGHT) {
    throw new Error("Unexpected foreground dimensions; review canopy zones before running this recovery.");
  }

  const output = Buffer.from(night.data);
  // The source background is sampled #fdfdfd. Use distance from that canvas
  // as the matte signal: the former chroma fallback treated cool-tinted white
  // canvas pixels as foliage, which created the blue sheets visible between
  // branches. The soft distance ramp keeps dark twigs and real blue leaves,
  // while near-white enclosed canvas becomes fully transparent.
  const backgroundLevel = 253;
  const transparentDistance = 170;
  const opaqueDistance = 240;

  for (let y = 0; y < Math.min(raw.info.height, HEIGHT); y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (!inCanopy(x, y)) continue;

      const sourcePixel = (y * WIDTH + x) * 3;
      const outputPixel = (y * WIDTH + x) * 4;
      const red = raw.data[sourcePixel];
      const green = raw.data[sourcePixel + 1];
      const blue = raw.data[sourcePixel + 2];
      const whiteDistance = Math.hypot(backgroundLevel - red, backgroundLevel - green, backgroundLevel - blue);
      let distanceAlpha = Math.max(0, Math.min(1, (whiteDistance - transparentDistance) / (opaqueDistance - transparentDistance)));
      distanceAlpha = distanceAlpha * distanceAlpha * (3 - 2 * distanceAlpha);
      const cleanedAlpha = Math.round(distanceAlpha * 255);
      output[outputPixel + 3] = cleanedAlpha;
      if (cleanedAlpha === 0) {
        output[outputPixel] = 0;
        output[outputPixel + 1] = 0;
        output[outputPixel + 2] = 0;
      }
    }
  }
  clearLampSkyPocket(output);

  const temporaryPath = `${nightPath}.recovered`;
  await sharp(output, { raw: night.info }).png().toFile(temporaryPath);
  await rename(temporaryPath, nightPath);
}

async function main() {
  const [dayPath, nightPath, rawDayPath, rawNightPath] = process.argv.slice(2);
  if (!dayPath || !nightPath) {
    throw new Error("Usage: node scripts/clean-foreground-foliage.js DAY.png NIGHT.png [RAW_DAY.png] [RAW_NIGHT.png]");
  }
  if (rawDayPath) await recoverDayFoliage(rawDayPath, dayPath);
  if (rawNightPath) {
    await recoverNightFoliage(rawNightPath, nightPath);
  } else {
    await cleanNightWithDaySilhouette(dayPath, nightPath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
