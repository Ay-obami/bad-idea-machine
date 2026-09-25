import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.BIM_BASE_URL ?? 'http://127.0.0.1:3100';
const outputDir = process.env.BIM_VISUAL_DIR ?? 'visual-regression';
const aftermathStates = new Set(['failure', 'minor', 'moderate', 'severe', 'legendary']);
const aftermathFiles = ['0x.webp', '1_2x.webp', '3x.webp', '10x.webp', '100x.webp'];

await mkdir(outputDir, { recursive: true });

function watchBrowserErrors(page, errors, prefix) {
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${prefix}console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`${prefix}page: ${error.message}`));
}

async function assertImageLoaded(locator, expectedPath) {
  await locator.waitFor({ state: 'visible' });
  const result = await locator.evaluate((image, path) => ({
    src: new URL(image.src).pathname,
    complete: image.complete,
    width: image.naturalWidth,
    height: image.naturalHeight,
    expected: path,
  }), expectedPath);
  if (result.src !== expectedPath || !result.complete || result.width <= 0 || result.height <= 0) {
    throw new Error(`Image contract failed for ${expectedPath}: ${JSON.stringify(result)}`);
  }
}

async function verifyGallery(page, viewportName) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Kitchen Meltdown.' }).waitFor();
  const choices = page.locator('.room-choice');
  if (await choices.count() !== 1) throw new Error('Room selector must contain exactly one Kitchen entry');
  if (await page.getByRole('button').count() !== 1) throw new Error('Room selector contains extra actions');
  for (const environment of ['kitchen']) {
    const room = page.locator(`.gallery-room[data-environment="${environment}"]`);
    await assertImageLoaded(room.locator('img'), `/rooms/${environment}/gallery/before.webp`);
  }
  const text = await page.locator('main').innerText();
  if (/100[.,]00×|LEGENDARY CHAOS|LEADERBOARD|WALLET/.test(text)) {
    throw new Error('Obsolete outcomes or unavailable actions remain in room selector');
  }
  await page.locator('.game-rules summary').click();
  await page.getByText('The scene does not change the odds.', { exact: false }).waitFor();
  await page.locator('.game-rules summary').click();
  const boxes = await choices.evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, right: box.right, height: box.height };
  }));
  const width = page.viewportSize().width;
  if (boxes.some(box => box.x < 0 || box.right > width + 1 || box.height < 44)) {
    throw new Error('Room choice overflows or is not touchable');
  }

}

async function verifyRiskDisclosure(page) {
  await page.locator('.paytable summary').click();
  for (const [mode, loss, top] of [['CONTROLLED', '45%', '8×'], ['SEND IT', '65%', '12×'], ['ABSOLUTELY NOT', '80%', '16×']]) {
    const choice = page.getByRole('button', { name: new RegExp(`^${mode}`) });
    await choice.click();
    if (await choice.getAttribute('aria-pressed') !== 'true') throw new Error(`${mode} selection is not exposed`);
    const table = await page.locator('.paytable table').innerText();
    if (!table.includes(loss) || !table.includes(top) || table.includes('100×')) throw new Error(`${mode} odds are incorrect`);
  }
  await page.locator('.paytable summary').click();
}

async function enterPlayWithUniformAftermathPreload(page, environment) {
  const expected = aftermathFiles.map(file => `/rooms/${environment}/aftermath/${file}`);
  const observed = new Set();
  const routePattern = `**/rooms/${environment}/aftermath/*.webp`;
  let releasePreloads = () => {};
  const preloadGate = new Promise(resolve => {
    releasePreloads = resolve;
  });

  await page.route(routePattern, async route => {
    observed.add(new URL(route.request().url()).pathname);
    await preloadGate;
    await route.continue();
  });

  try {
    const room = page.locator(`.gallery-room[data-environment="${environment}"]`);
    await room.locator('.gallery-room__heading').click();
    await page.locator(`.reference-play .room-stage[data-room-stage="${environment}"]`).waitFor();

    const deadline = Date.now() + 5_000;
    while (observed.size < expected.length && Date.now() < deadline) {
      await page.waitForTimeout(25);
    }

    const missing = expected.filter(path => !observed.has(path));
    if (missing.length) {
      throw new Error(`${environment} did not uniformly request every aftermath before launch: missing ${missing.join(', ')}`);
    }

    const shell = page.locator('.reference-play');
    if (await shell.getAttribute('data-aftermath-preload') !== 'loading') {
      throw new Error(`${environment} preload gate became ready before all blocked aftermaths completed`);
    }

    const launch = page.getByRole('button', { name: /DO NOT PRESS/i });
    if (!(await launch.isDisabled())) {
      throw new Error(`${environment} launch became enabled while aftermath preloads were still blocked`);
    }

    releasePreloads();
    await page.locator('.reference-play[data-aftermath-preload="ready"]').waitFor({ timeout: 5_000 });
    if (await launch.isDisabled()) {
      throw new Error(`${environment} launch stayed disabled after every aftermath finished preloading`);
    }
  } finally {
    releasePreloads();
    await page.unroute(routePattern);
  }
}

async function movementDistance(page) {
  let best = { actor: 'none', distance: 0 };
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const moving = page.locator('[data-scene-moving="true"]').first();
    if (await moving.count()) {
      const actor = await moving.getAttribute('data-scene-actor') ?? 'unknown';
      const before = await moving.boundingBox();
      await page.waitForTimeout(120);
      const after = await page.locator(`[data-scene-actor="${actor}"]`).boundingBox();
      if (before && after) {
        const distance = Math.hypot(after.x - before.x, after.y - before.y);
        if (distance > best.distance) best = { actor, distance };
        if (distance >= 10) return best;
      }
    } else {
      await page.waitForTimeout(90);
    }
  }
  return best;
}

async function verifyPlay(page, environment) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await enterPlayWithUniformAftermathPreload(page, environment);
  await assertImageLoaded(page.locator('.room-stage__plate'), `/rooms/${environment}/stage/clean.webp`);

  const expectedObjects = environment === 'kitchen' ? 9 : 11;
  if (await page.locator('.room-object').count() !== expectedObjects) {
    throw new Error(`${environment} must render ${expectedObjects} room-native object layers`);
  }
  if (await page.locator('.cinematic-backdrop').count() !== 0) throw new Error('Legacy CinematicBackdrop is still rendering in production play');
  if (await page.locator('.actor-artwork').count() !== 0) throw new Error('Legacy SVG actor artwork is still rendering in production play');

  await verifyRiskDisclosure(page);
  await page.getByRole('button', { name: /ABSOLUTELY NOT/i }).click();
  await page.getByRole('button', { name: /DO NOT PRESS/i }).click();
  await page.locator('.environment-stage[data-phase="revealing"]').waitFor({ timeout: 5_000 });
  if (await page.locator('[data-result-overlay="true"]').count()) throw new Error('Result leaked before catastrophe completed');

  const movement = await movementDistance(page);
  if (movement.distance < 10) throw new Error(`${environment} room-native prop did not visibly move; best ${movement.actor} ${movement.distance.toFixed(1)}px`);

  await page.locator('.scene-impact[data-vfx-impact]').first().waitFor({ timeout: 5_000 });
  const impact = page.locator('.scene-impact[data-vfx-impact]').first();
  const materials = await impact.getAttribute('data-impact-materials');
  const effect = await impact.getAttribute('data-vfx-effect');
  if (!materials?.includes(':') || !effect) throw new Error(`${environment} VFX is not sourced from a typed physical impact`);
  if (await impact.locator('.scene-particle').count() < 10) throw new Error(`${environment} sourced impact did not produce readable debris/VFX`);

  await page.screenshot({ path: `${outputDir}/${environment}-chaos.png`, fullPage: true });

  const aftermath = page.locator('.authored-aftermath');
  await aftermath.waitFor({ state: 'visible', timeout: 10_000 });
  const aftermathKey = await aftermath.getAttribute('data-authored-aftermath');
  const aftermathSrc = await aftermath.getAttribute('data-aftermath-src');
  if (!aftermathKey || !aftermathStates.has(aftermathKey)) throw new Error(`${environment} result missing authored aftermath key: ${aftermathKey}`);
  if (!aftermathSrc?.startsWith(`/rooms/${environment}/aftermath/`) || !aftermathSrc.endsWith('.webp')) {
    throw new Error(`${environment} result is not using a self-hosted authored aftermath: ${aftermathSrc}`);
  }
  await assertImageLoaded(aftermath, aftermathSrc);
  await page.locator('[data-result-overlay="true"]').waitFor({ state: 'visible', timeout: 2_000 });
  if (await page.locator('.environment-stage').getAttribute('data-aftermath-status') !== 'visible') {
    throw new Error(`${environment} result overlay appeared before authored plate reached visible state`);
  }
  await page.screenshot({ path: `${outputDir}/${environment}-result.png`, fullPage: true });
}

async function verifyMobilePlay(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('.gallery-room[data-environment="kitchen"] .gallery-room__heading').click();
  await page.locator('.reference-play__layout').waitFor();
  const stage = await page.locator('.environment-stage').boundingBox();
  const controls = await page.locator('.control-panel').boundingBox();
  const viewport = page.viewportSize();
  if (!stage || !controls || !viewport) throw new Error('Could not measure mobile play layout');
  if (!(stage.y < controls.y)) throw new Error('Mobile play must keep the room stage before controls');
  if (stage.width > viewport.width + 1 || controls.width > viewport.width + 1) throw new Error('Mobile play escapes viewport width');
  await verifyRiskDisclosure(page);
  await page.screenshot({ path: `${outputDir}/mobile-play.png`, fullPage: true });
}

const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  watchBrowserErrors(desktop, errors, 'desktop: ');
  await verifyGallery(desktop, 'desktop');
  await desktop.screenshot({ path: `${outputDir}/gallery-desktop.png`, fullPage: true });
  await verifyPlay(desktop, 'kitchen');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  watchBrowserErrors(mobile, errors, 'mobile: ');
  await verifyGallery(mobile, 'mobile');
  await mobile.screenshot({ path: `${outputDir}/gallery-mobile.png`, fullPage: true });
  await verifyMobilePlay(mobile);

  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('Room selection, risk disclosure, and scene smoke checks passed. Screenshots saved for visual review.');
} finally {
  await browser.close();
}
