const fs = require("fs");

const targets = [
  "ui/MafiaLobbyHUD.ui",
  "ui/MafiaPlayHUD.ui",
  "ui/MafiaDayHUD.ui",
];

const patterns = [
  "ScrollLayoutGroupComponent",
  "ScrollBar",
  "\"name\": \"Scroll\"",
  "\"name\": \"Thumb\"",
  "\"name\": \"ThumbSmall\"",
  "\"name\": \"Up\"",
  "\"name\": \"Down\"",
];

let total = 0;
for (const file of targets) {
  const text = fs.readFileSync(file, "utf8");
  const hits = patterns.filter((pattern) => text.includes(pattern));
  total += hits.length;
  console.log(`${file}: ${hits.length ? hits.join(", ") : "OK"}`);
}

console.log(`total_artifacts=${total}`);
process.exitCode = total === 0 ? 0 : 1;
