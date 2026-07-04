const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");

const MAP_PATH = "map/map01.map";

// Reuse an already visible map object sprite RUID from map01, then tint it.
// The previous default marker RUID was not visually useful in this HUD composition.
const VISIBLE_RUID = "a26f5bcb2f624b7ba0de2462601fcae0";

const updates = {
  DebugFoothold_Line: {
    color: { r: 0, g: 1, b: 0.05, a: 1 },
    scale: { x: 3.309, y: 0.08, z: 1 },
    order: 10000,
  },
  DebugFoothold_Left: {
    color: { r: 1, g: 0, b: 0, a: 1 },
    scale: { x: 0.18, y: 0.18, z: 1 },
    order: 10001,
  },
  DebugFoothold_Right: {
    color: { r: 1, g: 0, b: 0, a: 1 },
    scale: { x: 0.18, y: 0.18, z: 1 },
    order: 10001,
  },
  DebugSpawn_1: {
    color: { r: 1, g: 0.9, b: 0, a: 1 },
    scale: { x: 0.24, y: 0.24, z: 1 },
    order: 10002,
  },
};

const map = MapBuilder.read(MAP_PATH);

for (const [name, options] of Object.entries(updates)) {
  if (!map.find(name)) continue;

  map.patchComponent(name, "MOD.Core.SpriteRendererComponent", {
    SpriteRUID: VISIBLE_RUID,
    SortingLayer: "MapLayer7",
    OrderInLayer: options.order,
    Color: options.color,
  });

  const transform = map.component(name, "MOD.Core.TransformComponent");
  transform.Scale = options.scale;
}

map.write(MAP_PATH);
console.log(JSON.stringify({ updated: Object.keys(updates), ruid: VISIBLE_RUID }, null, 2));
