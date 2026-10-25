import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "public");
fs.mkdirSync(out, { recursive: true });
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".html")) {
    fs.copyFileSync(path.join(root, entry.name), path.join(out, entry.name));
  }
}
for (const name of ["css", "js", "icons", "images", "assets", "fonts", "manifest.json", "sw.js"]) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, name), { recursive: true, force: true });
}
console.log("Prepared legacy HTML portal and static assets in public/");
