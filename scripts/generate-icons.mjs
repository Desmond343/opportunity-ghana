import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// SVG Definition of the official Opportunity Ghana emblem matching the provided artwork
const generateLogoSvg = (paddingRatio = 0.08, bgCornerRadius = 96) => {
  // 512x512 canvas
  const size = 512;
  const contentScale = 1 - paddingRatio * 2;
  const translateOffset = size * paddingRatio;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Shadow for subtle depth matching app icon design -->
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.08" />
    </filter>
    <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#E5A100" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Clean app icon background with rounded corners -->
  ${bgCornerRadius > 0 
    ? `<rect width="512" height="512" rx="${bgCornerRadius}" fill="#FFFFFF"/>`
    : `<rect width="512" height="512" fill="#FFFFFF"/>`
  }

  <!-- Emblem Group with Safe Padding -->
  <g transform="translate(${translateOffset}, ${translateOffset}) scale(${contentScale})">

    <!-- 1. The Large Outer Green 'C' Ring -->
    <!-- Center around (256, 265), Outer R ~180, Inner R ~118 -->
    <!-- Curves clockwise from (380, 160) around left through (76, 265) to bottom (285, 445) -->
    <path d="
      M 378,160 
      C 355,108 309,78 256,78 
      C 152.8,78 69.3,161.5 69.3,264.7 
      C 69.3,367.9 152.8,451.4 256,451.4 
      C 275.5,451.4 294.4,448.4 312,442.8
      L 312,442.8
      C 264,450 186,420 162,374
      C 186,336 215,300 248,274
      C 178,284 135,264 135,264
      C 135,197.8 189.2,143.7 256,143.7 
      C 287.5,143.7 316.1,155.8 337.5,175.5 
      Z
    " fill="#006B3F" filter="url(#softGlow)"/>

    <!-- 2. The Right Green Ring Wing (Encasing the swooshes on the right) -->
    <path d="
      M 388,172
      C 426,220 442,280 432,342
      C 418,406 364,451 306,451
      C 350,440 404,395 410,335
      C 416,275 398,220 372,175
      Z
    " fill="#006B3F"/>

    <path d="
      M 374,170
      C 420,230 435,300 405,372
      C 375,444 305,450 305,450
      C 370,442 422,382 428,310
      C 432,250 405,196 374,170
      Z
    " fill="#006B3F"/>

    <!-- 3. Dynamic Tri-Color Swooshes / Ribbons emerging from bottom -->
    <!-- Red Swoosh (Bottom & Left Ribbon) -->
    <path d="
      M 168,443
      C 186,410 216,368 250,332
      C 275,305 306,280 340,260
      C 310,285 272,318 238,358
      C 205,398 178,435 168,443
      Z
    " fill="#CE1126"/>

    <!-- Main Bold Red Swoosh Curve -->
    <path d="
      M 166,442
      C 190,410 230,360 280,312
      C 328,266 380,230 418,180
      C 418,225 392,275 348,322
      C 298,375 242,425 214,445
      Z
    " fill="#CE1126"/>

    <!-- White Spacer Curve 1 -->
    <path d="
      M 214,446
      C 242,426 298,376 348,323
      C 362,308 376,290 388,272
      L 394,279
      C 382,298 367,317 352,333
      C 300,387 244,438 217,454
      Z
    " fill="#FFFFFF"/>

    <!-- Vibrant Yellow / Gold Middle Ribbon -->
    <path d="
      M 218,452
      C 244,434 298,382 352,328
      C 382,298 410,258 424,216
      C 424,242 410,282 380,324
      C 332,388 274,444 246,455
      Z
    " fill="#FCD116"/>

    <!-- White Spacer Curve 2 -->
    <path d="
      M 246,455
      C 274,444 332,388 380,324
      C 392,306 402,286 409,266
      L 415,271
      C 408,292 397,313 384,332
      C 334,398 276,452 249,460
      Z
    " fill="#FFFFFF"/>

    <!-- Deep Green Right Accent Ribbon -->
    <path d="
      M 249,460
      C 278,450 336,396 384,332
      C 406,302 422,266 428,230
      C 434,280 416,340 376,392
      C 336,444 286,462 258,462
      Z
    " fill="#006B3F"/>

    <!-- 4. Graduate Silhouette: Torso and Reaching Arm -->
    <path d="
      M 194,354
      C 214,302 242,254 278,228
      C 302,210 326,200 354,194
      C 376,189 392,165 402,150
      C 390,178 368,206 338,228
      C 298,258 262,306 242,364
      C 220,366 204,362 194,354
      Z
    " fill="#006B3F"/>

    <!-- Body fill solidifying the scholar torso -->
    <path d="
      M 218,340
      C 240,290 270,248 308,224
      C 330,210 358,198 388,180
      C 370,212 342,242 308,272
      C 270,306 242,342 230,360
      Z
    " fill="#006B3F"/>

    <!-- 5. Head of the Graduate (circle) -->
    <!-- Positioned at x=278, y=190, R=30 -->
    <circle cx="278" cy="190" r="30" fill="#006B3F" />

    <!-- 6. Mortarboard (Graduation Cap) -->
    <!-- Diamond/rhombus angled slightly up-right: center around (272, 148) -->
    <path d="
      M 214,170
      L 272,132
      L 334,164
      L 276,202
      Z
    " fill="#006B3F" filter="url(#softGlow)"/>

    <!-- Under-cap skullcap band -->
    <path d="
      M 252,192
      C 252,192 262,206 280,204
      C 298,202 304,188 304,188
      L 298,178
      L 256,184
      Z
    " fill="#006B3F"/>

    <!-- Graduation Cap Button and Tassel dangling to the left -->
    <circle cx="274" cy="167" r="4.5" fill="#006B3F" />
    <!-- Tassel string curving down-left -->
    <path d="
      M 274,167
      C 254,172 234,182 226,200
      L 223,215
    " stroke="#006B3F" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Tassel fringe/brush -->
    <path d="
      M 223,212
      L 220,226
      C 220,228 226,229 228,226
      L 225,212
      Z
    " fill="#006B3F"/>

    <!-- 7. The Golden Star of Ghana -->
    <!-- Placed at top-right (approx cx=418, cy=112), size ~64px, warm gold with soft gradient & glow -->
    <!-- Golden 5-pointed star rotated ~15deg -->
    <g transform="translate(418, 112) rotate(16)" filter="url(#starGlow)">
      <polygon points="
        0,-36 
        10.5,-11.2 
        37,-11.2 
        15.5,4.4 
        23.8,29.1 
        0,13.8 
        -23.8,29.1 
        -15.5,4.4 
        -37,-11.2 
        -10.5,-11.2
      " fill="#FFC72C" stroke="#F5B800" stroke-width="1.5" stroke-linejoin="round"/>
    </g>

  </g>
</svg>`;
};

async function buildIcons() {
  console.log('Generating Opportunity Ghana PWA Brand Icons...');

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Generate master SVG
  const masterSvg = generateLogoSvg(0.06, 96);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg);
  console.log('Created /public/icon.svg');

  // 2. Generate icon-512.png (512x512)
  await sharp(Buffer.from(masterSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created /public/icon-512.png');

  // 3. Generate icon-192.png (192x192)
  await sharp(Buffer.from(masterSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created /public/icon-192.png');

  // 4. Generate apple-touch-icon.png (180x180)
  // Apple standard requires square or subtle 22% squircle radius, iOS handles squircle clipping
  const appleSvg = generateLogoSvg(0.06, 0); // Apple clips icons automatically
  await sharp(Buffer.from(appleSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created /public/apple-touch-icon.png');

  // 5. Generate icon-maskable-512.png (512x512 with safe-zone margin ~16%)
  // Android adaptive icons crop with circle/squircle; safe zone is the inner 80% circle
  const maskableSvg = generateLogoSvg(0.16, 0); // Flat background with 16% safe zone padding
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('Created /public/icon-maskable-512.png');

  // 6. Generate favicon-32x32.png and favicon.ico
  await sharp(Buffer.from(masterSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  
  await sharp(Buffer.from(masterSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
  await sharp(Buffer.from(masterSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  
  // Also copy 32x32 as favicon.ico for older browsers
  fs.copyFileSync(path.join(publicDir, 'favicon.png'), path.join(publicDir, 'favicon.ico'));
  console.log('Created favicons (/public/favicon.ico, /public/favicon.png, etc.)');

  console.log('All Opportunity Ghana PWA icons generated successfully!');
}

buildIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
