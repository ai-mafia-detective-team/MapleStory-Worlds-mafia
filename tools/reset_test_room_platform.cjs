const fs = require("node:fs");
const path = require("node:path");
const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");

const MAP_PATH = "map/map01.map";
const FLOOR_MODEL = "RootDesk/MyDesk/Models/Terrain/RoomFloor.model";

// Test foothold requested on 2026-07-02.
// Use the first screenshot's Y as the horizontal platform height.
const TEST_ROOM = {
  name: "RoomPlatform_1",
  spawnName: "RoomSpawn_1",
  left: -5.983,
  right: -2.674,
  y: 1.900,
  spawnYOffset: 0.08,
};

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

function segment({ id, group, owner, start, end }) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    Length: length,
    NextFootholdId: 0,
    PreviousFootholdId: 0,
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

const backupPath = path.join("map", `map01.before-test-room-platform-${timestamp()}.map`);
fs.copyFileSync(MAP_PATH, backupPath);

const map = MapBuilder.read(MAP_PATH);
if (map.getTileMapMode() !== 0) {
  throw new Error("map01 must remain MapleTile (TileMapMode=0)");
}

const oldRoomPlatformIds = new Set(
  map.entities
    .filter((entity) => /^RoomPlatform_\d+$/.test(entity.jsonString.name || ""))
    .map((entity) => entity.id)
);

for (const entity of [...map.entities]) {
  const name = entity.jsonString.name || "";
  if (/^RoomPlatform_\d+$/.test(name) || /^RoomSpawn_\d+$/.test(name)) {
    map.remove(entity.jsonString.path);
  }
}

map.placeModel(TEST_ROOM.name, FLOOR_MODEL, {
  pos: [0, 0, 999.999],
});
const platformOwnerId = map.lastId();
map.patchComponent(TEST_ROOM.name, "MOD.Core.CustomFootholdComponent", {
  edgeLists: [[
    { x: TEST_ROOM.left, y: TEST_ROOM.y },
    { x: TEST_ROOM.right, y: TEST_ROOM.y },
  ]],
});
map.patchComponent(TEST_ROOM.name, "MOD.Core.SpriteRendererComponent", {
  SortingLayer: "MapLayer4",
});

const spawnPosition = [
  (TEST_ROOM.left + TEST_ROOM.right) / 2,
  TEST_ROOM.y + TEST_ROOM.spawnYOffset,
  0,
];
map.empty(TEST_ROOM.spawnName, { pos: spawnPosition });

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

const testFoothold = segment({
  id: nextId,
  group: 3,
  owner: platformOwnerId,
  start: { x: TEST_ROOM.left, y: TEST_ROOM.y },
  end: { x: TEST_ROOM.right, y: TEST_ROOM.y },
});

byLayer["1"] = [...(byLayer["1"] || []), testFoothold];
byLayer["2"] = [];
map.patchComponent(root.path, "MOD.Core.FootholdComponent", { FootholdsByLayer: byLayer });
map.write(MAP_PATH);

console.log(JSON.stringify({
  backupPath,
  removedRoomPlatforms: oldRoomPlatformIds.size,
  created: {
    platform: TEST_ROOM.name,
    spawn: TEST_ROOM.spawnName,
    start: testFoothold.StartPoint,
    end: testFoothold.EndPoint,
    spawnPosition,
    platformOwnerId,
  },
}, null, 2));
