const fs = require("node:fs");
const path = require("node:path");
const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const MAP_PATH = "map/map01.map";
const UI_PATH = "ui/MafiaLobbyHUD.ui";
const FLOOR_MODEL = "RootDesk/MyDesk/Models/Terrain/RoomFloor.model";
const WALL_HEIGHT = 4.6;

// Previous world layout was row-major: 1/2, 3/4, 5/6, 7/8.
// MafiaLobbyHUD is column-major on screen: left 1~4, right 5~8.
const LEGACY_WORLD_ROOMS = {
  1: { left: -5.400, right: -2.427, y: 1.666 },
  2: { left: 2.497, right: 5.406, y: 1.666 },
  3: { left: -5.314, right: -2.513, y: 0.039 },
  4: { left: 2.411, right: 5.288, y: 0.039 },
  5: { left: -5.433, right: -2.405, y: -1.449 },
  6: { left: 2.454, right: 5.439, y: -1.449 },
  7: { left: -5.368, right: -2.437, y: -2.796 },
  8: { left: 2.422, right: 5.406, y: -2.796 },
};

const LOBBY_TO_LEGACY_BASE = {
  1: 1,
  2: 3,
  3: 5,
  4: 7,
  5: 2,
  6: 4,
  7: 6,
  8: 8,
};

// Calibration: user's latest actual world-coordinate test for RoomBadge1.
const CALIBRATION_ROOM1_WORLD = {
  left: -5.983,
  right: -2.674,
  y: 1.900,
};

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function attribute() {
  return {
    walk: 1,
    force: 0,
    drag: 1,
    isBlockVertical: false,
    isDynamic: false,
    isCustomFoothold: true,
    inertiaOption: 0,
  };
}

function segment({ id, prev, next, group, owner, start, end }) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    Length: length,
    NextFootholdId: next,
    PreviousFootholdId: prev,
    groupID: group,
    layer: 1,
    sortingLayerName: "MapLayer4",
    attribute: attribute(),
    OwnerId: owner,
    Id: id,
    StartPoint: start,
    EndPoint: end,
    Variance: { x: dx / length, y: dy / length },
  };
}

function firstChildByNamePrefix(ui, roomIndex, prefix) {
  const parentPath = `/ui/MafiaLobbyHUD/RoomBadge${roomIndex}/`;
  const matches = ui.listEntities()
    .filter((entity) => entity.path.startsWith(parentPath) && entity.name.startsWith(prefix));
  if (matches.length === 0) throw new Error(`RoomBadge${roomIndex} has no ${prefix}`);
  return matches[0];
}

function center(room) {
  return (room.left + room.right) / 2;
}

function calculateRoomsFromLobbyBadges(ui) {
  const room1Left = firstChildByNamePrefix(ui, 1, "DebugUIFoothold_Left").pos;
  const room1Right = firstChildByNamePrefix(ui, 1, "DebugUIFoothold_Right").pos;
  const scale = (CALIBRATION_ROOM1_WORLD.right - CALIBRATION_ROOM1_WORLD.left) /
    (room1Right[0] - room1Left[0]);
  const centerShift = center(CALIBRATION_ROOM1_WORLD) - center(LEGACY_WORLD_ROOMS[1]);
  const yShift = CALIBRATION_ROOM1_WORLD.y - LEGACY_WORLD_ROOMS[1].y;
  const room1MarkerY = (room1Left[1] + room1Right[1]) / 2;

  const rooms = [];
  for (let i = 1; i <= 8; i += 1) {
    const base = LEGACY_WORLD_ROOMS[LOBBY_TO_LEGACY_BASE[i]];
    const leftMarker = firstChildByNamePrefix(ui, i, "DebugUIFoothold_Left").pos;
    const rightMarker = firstChildByNamePrefix(ui, i, "DebugUIFoothold_Right").pos;
    const spawnMarker = firstChildByNamePrefix(ui, i, "DebugUISpawn").pos;

    const markerCenterX = (leftMarker[0] + rightMarker[0]) / 2;
    const markerWidth = rightMarker[0] - leftMarker[0];
    const baseCenter = center(base) + centerShift;
    const worldCenter = baseCenter + markerCenterX * scale;
    const worldWidth = markerWidth * scale;
    const floorY = base.y + yShift + (((leftMarker[1] + rightMarker[1]) / 2) - room1MarkerY) * scale;

    rooms.push({
      index: i,
      left: Number((worldCenter - worldWidth / 2).toFixed(3)),
      right: Number((worldCenter + worldWidth / 2).toFixed(3)),
      y: Number(floorY.toFixed(3)),
      spawnX: Number((baseCenter + spawnMarker[0] * scale).toFixed(3)),
      spawnY: Number((floorY + 0.08).toFixed(3)),
    });
  }
  return rooms;
}

const backupMapPath = path.join("map", `map01.before-lobby-room-bounds-${timestamp()}.map`);
const backupUiPath = path.join("ui", `MafiaLobbyHUD.before-lobby-room-bounds-${timestamp()}.ui`);
fs.copyFileSync(MAP_PATH, backupMapPath);
fs.copyFileSync(UI_PATH, backupUiPath);

const ui = UIBuilder.read(UI_PATH);
const rooms = calculateRoomsFromLobbyBadges(ui);
const map = MapBuilder.read(MAP_PATH);
if (map.getTileMapMode() !== 0) throw new Error("map01 must remain MapleTile (TileMapMode=0)");

const oldRoomPlatformIds = new Set(
  map.entities
    .filter((entity) => /^RoomPlatform_\d+$/.test(entity.jsonString.name || ""))
    .map((entity) => entity.id),
);

for (const entity of [...map.entities]) {
  const name = entity.jsonString.name || "";
  if (/^RoomPlatform_\d+$/.test(name) ||
      /^RoomSpawn_\d+$/.test(name) ||
      /^DebugFoothold_/.test(name) ||
      /^DebugSpawn_/.test(name)) {
    map.remove(entity.jsonString.path);
  }
}

const owners = [];
for (const room of rooms) {
  const platformName = `RoomPlatform_${room.index}`;
  const spawnName = `RoomSpawn_${room.index}`;
  map.placeModel(platformName, FLOOR_MODEL, { pos: [0, 0, 999.999] });
  owners[room.index] = map.lastId();
  map.patchComponent(platformName, "MOD.Core.CustomFootholdComponent", {
    edgeLists: [[
      { x: room.left, y: room.y + WALL_HEIGHT },
      { x: room.left, y: room.y },
      { x: room.right, y: room.y },
      { x: room.right, y: room.y + WALL_HEIGHT },
    ]],
  });
  map.patchComponent(platformName, "MOD.Core.SpriteRendererComponent", {
    SortingLayer: "MapLayer4",
  });
  map.empty(spawnName, { pos: [room.spawnX, room.spawnY, 0] });
}

const root = map.find("/maps/map01");
const footholdComponent = map.component(root, "MOD.Core.FootholdComponent");
const byLayer = { ...(footholdComponent.FootholdsByLayer || {}) };
for (const layer of Object.keys(byLayer)) {
  byLayer[layer] = byLayer[layer].filter((f) => !oldRoomPlatformIds.has(f.OwnerId));
}

let nextId = 1;
for (const layer of Object.keys(byLayer)) {
  for (const f of byLayer[layer]) {
    if (f.Id >= nextId) nextId = f.Id + 1;
  }
}

const newFootholds = [];
for (const room of rooms) {
  const group = 30 + room.index;
  const leftWallId = nextId++;
  const floorId = nextId++;
  const rightWallId = nextId++;
  const owner = owners[room.index];
  newFootholds.push(segment({
    id: leftWallId,
    prev: 0,
    next: floorId,
    group,
    owner,
    start: { x: room.left, y: room.y + WALL_HEIGHT },
    end: { x: room.left, y: room.y },
  }));
  newFootholds.push(segment({
    id: floorId,
    prev: leftWallId,
    next: rightWallId,
    group,
    owner,
    start: { x: room.left, y: room.y },
    end: { x: room.right, y: room.y },
  }));
  newFootholds.push(segment({
    id: rightWallId,
    prev: floorId,
    next: 0,
    group,
    owner,
    start: { x: room.right, y: room.y },
    end: { x: room.right, y: room.y + WALL_HEIGHT },
  }));
}

byLayer["1"] = [...(byLayer["1"] || []), ...newFootholds];
byLayer["2"] = [];
map.patchComponent(root.path, "MOD.Core.FootholdComponent", { FootholdsByLayer: byLayer });
map.write(MAP_PATH);

// Keep the badge marker entities for future re-adjustment, but hide them for normal play.
for (let i = 1; i <= 8; i += 1) {
  const prefix = `/ui/MafiaLobbyHUD/RoomBadge${i}/`;
  for (const entity of ui.listEntities()) {
    if (entity.path.startsWith(prefix) && entity.name.startsWith("Debug")) {
      ui.patch(entity.path, { enable: false, visible: false });
    }
  }
}
ui.write(UI_PATH, { lint: true, strict: true });

console.log(JSON.stringify({
  backupMapPath,
  backupUiPath,
  wallHeight: WALL_HEIGHT,
  rooms,
  footholdCount: newFootholds.length,
}, null, 2));
