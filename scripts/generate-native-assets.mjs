import { access, cp, mkdir } from "node:fs/promises";

const approvedAndroid = "native-assets/android-res";
const approvedIOS = "native-assets/ios-assets.xcassets";
const storeIcon = "icons/icon-1024.png";

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

if (!(await exists(storeIcon))) {
  throw new Error("Approved 1024px store icon snapshot is missing: " + storeIcon);
}

let installed = 0;

if (await exists("android/app/src/main/res")) {
  if (!(await exists(approvedAndroid))) {
    throw new Error("Approved Android native asset snapshot is missing.");
  }
  await mkdir("android/app/src/main/res", { recursive: true });
  await cp(approvedAndroid, "android/app/src/main/res", { recursive: true, force: true });
  console.log("Approved Android icon and splash resources installed.");
  installed += 1;
}

if (await exists("ios/App/App/Assets.xcassets")) {
  if (!(await exists(approvedIOS))) {
    throw new Error("Approved iOS native asset snapshot is missing.");
  }
  await mkdir("ios/App/App/Assets.xcassets", { recursive: true });
  await cp(approvedIOS, "ios/App/App/Assets.xcassets", { recursive: true, force: true });
  console.log("Approved iOS icon and splash resources installed.");
  installed += 1;
}

if (!installed) {
  console.log("No native platform exists yet; approved asset snapshots are ready for the next cap:add run.");
}
