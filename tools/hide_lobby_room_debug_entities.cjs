const fs = require("node:fs");
const path = require("node:path");
const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const MAP_PATH = "map/map01.map";
const UI_PATH = "ui/MafiaLobbyHUD.ui";

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

const backupMapPath = path.join("map", `map01.before-hide-lobby-room-debug-${timestamp()}.map`);
const backupUiPath = path.join("ui", `MafiaLobbyHUD.before-hide-lobby-room-debug-${timestamp()}.ui`);
fs.copyFileSync(MAP_PATH, backupMapPath);
fs.copyFileSync(UI_PATH, backupUiPath);

const map = MapBuilder.read(MAP_PATH);
let hiddenMapEntities = 0;
let disabledRenderers = 0;

for (const entity of map.entities) {
  const name = entity.jsonString.name || "";
  if (/^RoomPlatform_\d+$/.test(name) || /^RoomSpawn_\d+$/.test(name)) {
    map.patch(entity.jsonString.path, { visible: false });
    hiddenMapEntities += 1;
    const sprite = (entity.jsonString["@components"] || []).find((c) => c["@type"] === "MOD.Core.SpriteRendererComponent");
    if (sprite) {
      map.patchComponent(entity.jsonString.path, "MOD.Core.SpriteRendererComponent", { Enable: false });
      disabledRenderers += 1;
    }
  }
}
map.write(MAP_PATH);

const ui = UIBuilder.read(UI_PATH);
let hiddenUiMarkers = 0;
for (let i = 1; i <= 8; i += 1) {
  const prefix = `/ui/MafiaLobbyHUD/RoomBadge${i}/`;
  for (const entity of ui.listEntities()) {
    if (entity.path.startsWith(prefix) && entity.name.startsWith("Debug")) {
      ui.patch(entity.path, { enable: false, visible: false });
      hiddenUiMarkers += 1;
    }
  }
}
ui.write(UI_PATH, { lint: true, strict: true });

console.log(JSON.stringify({
  backupMapPath,
  backupUiPath,
  hiddenMapEntities,
  disabledRenderers,
  hiddenUiMarkers,
}, null, 2));
