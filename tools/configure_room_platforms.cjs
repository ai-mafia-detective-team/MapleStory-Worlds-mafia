const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");

const MAP_PATH = "map/map01.map";
const FLOOR_MODEL = "RootDesk/MyDesk/Models/Terrain/RoomFloor.model";
const WALL_HEIGHT = 3.6;

// Room floor coordinates supplied on 2026-06-29.
// Pairs form each room's left/right floor endpoints.
// Y normalization:
// - screenshots 1~4 use screenshot 1's Y
// - screenshots 5~8 use screenshot 5's Y
// - screenshots 9~12 use screenshot 9's Y
// - screenshots 13~16 use screenshot 13's Y
const ROOMS = [
  { left: -5.400, right: -2.427, y: 1.666 },
  { left: 2.497, right: 5.406, y: 1.666 },
  { left: -5.314, right: -2.513, y: 0.039 },
  { left: 2.411, right: 5.288, y: 0.039 },
  { left: -5.433, right: -2.405, y: -1.449 },
  { left: 2.454, right: 5.439, y: -1.449 },
  { left: -5.368, right: -2.437, y: -2.796 },
  { left: 2.422, right: 5.406, y: -2.796 },
];

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

const map = MapBuilder.read(MAP_PATH);
if (map.getTileMapMode() !== 0) throw new Error("map01 must remain MapleTile (TileMapMode=0)");

// Remove previously generated room platform owners and their footholds from every layer.
const oldRoomPlatformIds = new Set(
  map.entities
    .filter((entity) => /^RoomPlatform_\d+$/.test(entity.jsonString.name || ""))
    .map((entity) => entity.id)
);
const oldOwnerIds = new Set([
  ...oldRoomPlatformIds,
  ...map.getFootholds("2").map((f) => f.OwnerId),
]);
for (const entity of [...map.entities]) {
  if (oldOwnerIds.has(entity.id) || /^RoomPlatform_\d+$/.test(entity.jsonString.name || "")) {
    map.remove(entity.jsonString.path);
  }
}

const owners = [];
for (let i = 0; i < ROOMS.length; i += 1) {
  const room = ROOMS[i];
  map.placeModel(`RoomPlatform_${i + 1}`, FLOOR_MODEL, {
    pos: [0, 0, 999.999],
  });
  owners.push(map.lastId());
  map.patchComponent(`RoomPlatform_${i + 1}`, "MOD.Core.CustomFootholdComponent", {
    edgeLists: [[
      { x: room.left, y: room.y + WALL_HEIGHT },
      { x: room.left, y: room.y },
      { x: room.right, y: room.y },
      { x: room.right, y: room.y + WALL_HEIGHT },
    ]],
  });
  map.patchComponent(`RoomPlatform_${i + 1}`, "MOD.Core.SpriteRendererComponent", {
    SortingLayer: "MapLayer4",
  });

  const spawnName = `RoomSpawn_${i + 1}`;
  const spawnPosition = [(room.left + room.right) / 2, room.y + 0.08, 0];
  if (map.find(spawnName)) map.patch(spawnName, { pos: spawnPosition });
  else map.empty(spawnName, { pos: spawnPosition });
}

const footholds = [];
const root = map.find("/maps/map01");
const footholdComponent = map.component(root, "MOD.Core.FootholdComponent");
const byLayer = { ...(footholdComponent.FootholdsByLayer || {}) };
for (const layer of Object.keys(byLayer)) {
  byLayer[layer] = byLayer[layer].filter((f) => !oldOwnerIds.has(f.OwnerId));
}

let nextId = 1;
for (const layer of Object.keys(byLayer)) {
  for (const f of byLayer[layer]) {
    if (f.Id >= nextId) nextId = f.Id + 1;
  }
}
for (let i = 0; i < ROOMS.length; i += 1) {
  const room = ROOMS[i];
  const group = 3 + i;
  const leftWallId = nextId++;
  const floorId = nextId++;
  const rightWallId = nextId++;
  footholds.push(segment({
    id: leftWallId, prev: 0, next: floorId, group, owner: owners[i],
    start: { x: room.left, y: room.y + WALL_HEIGHT },
    end: { x: room.left, y: room.y },
  }));
  footholds.push(segment({
    id: floorId, prev: leftWallId, next: rightWallId, group, owner: owners[i],
    start: { x: room.left, y: room.y },
    end: { x: room.right, y: room.y },
  }));
  footholds.push(segment({
    id: rightWallId, prev: floorId, next: 0, group, owner: owners[i],
    start: { x: room.right, y: room.y },
    end: { x: room.right, y: room.y + WALL_HEIGHT },
  }));
}

byLayer["1"] = [...(byLayer["1"] || []), ...footholds];
byLayer["2"] = [];
map.patchComponent(root.path, "MOD.Core.FootholdComponent", { FootholdsByLayer: byLayer });
map.write(MAP_PATH);

console.log(JSON.stringify({ rooms: ROOMS, footholdCount: footholds.length, owners }, null, 2));
