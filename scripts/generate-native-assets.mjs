import { access, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const source = "icons/icon-512.png";
const generatedDir = "assets";
const generatedIcon = "assets/icon.png";
const storeIcon = "icons/icon-1024.png";
const splash = "assets/splash.png";
const background = "#fbf7ef";

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

if (!(await exists(source))) {
  throw new Error("Approved source icon not found: " + source);
}

await mkdir(generatedDir, { recursive: true });

await sharp(source)
  .resize(1024, 1024, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .png()
  .toFile(generatedIcon);

await sharp(generatedIcon).toFile(storeIcon);

const logo = await sharp(generatedIcon)
  .resize(620, 620, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 2732, height: 2732, channels: 4, background }
})
  .composite([{ input: logo, gravity: "centre" }])
  .png()
  .toFile(splash);

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const common = [
  "@capacitor/assets",
  "generate",
  "--assetPath", "assets",
  "--iconBackgroundColor", background,
  "--iconBackgroundColorDark", "#10244a",
  "--splashBackgroundColor", background,
  "--splashBackgroundColorDark", "#10244a"
];

const platforms = [];
if (await exists("android")) platforms.push("--android");
if (await exists("ios/App")) platforms.push("--ios");

for (const platform of platforms) {
  execFileSync(npx, [...common, platform], { stdio: "inherit" });
}

console.log("Approved icon prepared at", storeIcon);
console.log(platforms.length ? "Native icon/splash resources generated." : "No native platform exists yet; source assets prepared only.");
