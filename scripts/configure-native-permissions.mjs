import { access, readFile, writeFile } from "node:fs/promises";

const locationMessage =
  "Memories Unlocked uses your location only when you ask to unlock a memory or confirm your position on the map.";

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function patchAndroid() {
  const path = "android/app/src/main/AndroidManifest.xml";
  if (!(await exists(path))) return "Android project not present — skipped.";

  let xml = await readFile(path, "utf8");
  const permissions = [
    '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
    '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />'
  ];

  let changed = false;
  for (const line of permissions) {
    if (!xml.includes(line)) {
      xml = xml.replace(/<application\b/, `${line}\n\n    <application`);
      changed = true;
    }
  }

  if (changed) await writeFile(path, xml);
  return changed ? "Android foreground location permissions added." : "Android permissions already configured.";
}

async function patchIOS() {
  const path = "ios/App/App/Info.plist";
  if (!(await exists(path))) return "iOS project not present — skipped.";

  let plist = await readFile(path, "utf8");
  if (plist.includes("<key>NSLocationWhenInUseUsageDescription</key>")) {
    return "iOS foreground location usage description already configured.";
  }

  const entry =
    `\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>${locationMessage}</string>\n`;

  if (!plist.includes("</dict>")) throw new Error("Could not find </dict> in ios/App/App/Info.plist");
  plist = plist.replace("</dict>", `${entry}</dict>`);
  await writeFile(path, plist);
  return "iOS foreground location usage description added.";
}

for (const result of [await patchAndroid(), await patchIOS()]) console.log(result);
