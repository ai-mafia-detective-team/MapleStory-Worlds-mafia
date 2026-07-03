const fs = require("fs");

const lobbyPath = "ui/MafiaLobbyHUD.ui";
const dayPath = "ui/MafiaDayHUD.ui";

const lobby = JSON.parse(fs.readFileSync(lobbyPath, "utf8"));
const day = JSON.parse(fs.readFileSync(dayPath, "utf8"));

const LOBBY_ROOT = "/ui/MafiaLobbyHUD";
const DAY_ROOT = "/ui/MafiaDayHUD";

function parseEntity(e) {
  return typeof e.jsonString === "string" ? JSON.parse(e.jsonString) : e.jsonString;
}

function stringifyEntity(e) {
  if (typeof e.jsonString !== "string") {
    e.jsonString = e.jsonString;
  }
  return e;
}

function cloneEntityWithPath(source, targetPath) {
  const cloned = JSON.parse(JSON.stringify(source));
  const js = parseEntity(cloned);
  const oldPath = js.path || cloned.path;
  const oldName = String(oldPath).split("/").pop();
  const newName = String(targetPath).split("/").pop();
  cloned.path = targetPath;
  js.path = targetPath;
  js.name = newName || oldName;
  if (js.pathConstraints) {
    js.pathConstraints = "/".repeat((targetPath.slice(DAY_ROOT.length).match(/\//g) || []).length + 2);
  }
  cloned.jsonString = js;
  return stringifyEntity(cloned);
}

function isLobbyChatEntity(path) {
  if (!path.startsWith(LOBBY_ROOT)) return false;
  const rel = path.slice(LOBBY_ROOT.length);
  if (rel.startsWith("/CenterPanel/Chat")) return true;
  if (rel.startsWith("/CenterPanel/PhaseChatPlate")) return true;
  if (rel.startsWith("/CenterPanel/LobbyChat")) return true;
  if (rel.startsWith("/CenterPanel/UISprite")) return true;
  return false;
}

function isDayChatEntity(path) {
  if (!path.startsWith(DAY_ROOT)) return false;
  const rel = path.slice(DAY_ROOT.length);
  if (rel.startsWith("/CenterPanel/Chat")) return true;
  if (rel.startsWith("/CenterPanel/PhaseChatPlate")) return true;
  if (rel.startsWith("/CenterPanel/LobbyChat")) return true;
  if (rel.startsWith("/CenterPanel/UISprite")) return true;
  return false;
}

const keepRootScroll = new Map();
for (const sourcePath of [
  `${LOBBY_ROOT}/CenterPanel/UISprite_2`,
  `${LOBBY_ROOT}/CenterPanel/UISprite_3`,
]) {
  const source = lobby.ContentProto.Entities.find((e) => e.path === sourcePath);
  if (!source) continue;
  const suffix = sourcePath.endsWith("_2") ? "UISprite_2" : "UISprite_3";
  const cloned = cloneEntityWithPath(source, `${DAY_ROOT}/${suffix}`);
  keepRootScroll.set(cloned.path, cloned);
}

day.ContentProto.Entities = day.ContentProto.Entities.filter((e) => {
  if (isDayChatEntity(e.path || "")) return false;
  if (e.path === `${DAY_ROOT}/UISprite_2` || e.path === `${DAY_ROOT}/UISprite_3`) return false;
  return true;
});

for (const source of lobby.ContentProto.Entities) {
  const p = source.path || "";
  if (!isLobbyChatEntity(p)) continue;

  // DayHUD script resolves scroll up/down as root children, so skip center-panel copies
  // for those two and provide root-path copies below.
  if (p === `${LOBBY_ROOT}/CenterPanel/UISprite_2`) continue;
  if (p === `${LOBBY_ROOT}/CenterPanel/UISprite_3`) continue;

  day.ContentProto.Entities.push(cloneEntityWithPath(source, p.replace(LOBBY_ROOT, DAY_ROOT)));
}

for (const entity of keepRootScroll.values()) {
  day.ContentProto.Entities.push(entity);
}

// Keep deterministic ordering: existing DayHUD order first, then copied chat layer order by path.
day.ContentProto.Entities.sort((a, b) => {
  const ap = a.path || "";
  const bp = b.path || "";
  return ap.localeCompare(bp);
});

fs.writeFileSync(dayPath, `${JSON.stringify(day, null, 2)}\n`, "utf8");
console.log(`Copied lobby chat UI into ${dayPath}. Entity count=${day.ContentProto.Entities.length}`);
