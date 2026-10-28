import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const root = process.cwd();
const out = join(root, "www");
const copiedDirectories = new Set(["assets", "icons", "vendor"]);
const allowedExtensions = new Set([".html", ".css", ".js", ".json"]);
const excludedFiles = new Set([
  "package.json",
  "package-lock.json",
  "capacitor.config.json"
]);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of await readdir(root)) {
  if (entry === "www" || entry === "node_modules" || entry === "android" || entry === "ios" || entry === "scripts" || entry.startsWith(".")) continue;
  const source = join(root, entry);
  const info = await stat(source);

  if (info.isDirectory()) {
    if (copiedDirectories.has(entry)) {
      await cp(source, join(out, entry), { recursive: true });
    }
    continue;
  }

  if (!excludedFiles.has(entry) && allowedExtensions.has(extname(entry).toLowerCase())) {
    await cp(source, join(out, entry));
  }
}

console.log("Native web bundle prepared in www/");
