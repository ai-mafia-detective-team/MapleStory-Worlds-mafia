const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");

const MAP_PATH = "map/map01.map";
const DEBUG_NAMES = [
  "DebugFoothold_Line",
  "DebugFoothold_Left",
  "DebugFoothold_Right",
  "DebugSpawn_1",
];

const map = MapBuilder.read(MAP_PATH);

for (const name of DEBUG_NAMES) {
  const entity = map.find(name);
  if (!entity) continue;

  map.patchComponent(name, "MOD.Core.SpriteRendererComponent", {
    SortingLayer: "MapLayer7",
    OrderInLayer: name === "DebugFoothold_Line" ? 900 : 901,
  });
}

// Make the visual markers intentionally chunky for temporary verification.
const lineTransform = map.component("DebugFoothold_Line", "MOD.Core.TransformComponent");
if (lineTransform) lineTransform.Scale = { x: 3.309, y: 0.12, z: 1 };

for (const name of ["DebugFoothold_Left", "DebugFoothold_Right"]) {
  const transform = map.component(name, "MOD.Core.TransformComponent");
  if (transform) transform.Scale = { x: 0.22, y: 0.22, z: 1 };
}

const spawnTransform = map.component("DebugSpawn_1", "MOD.Core.TransformComponent");
if (spawnTransform) spawnTransform.Scale = { x: 0.28, y: 0.28, z: 1 };

map.write(MAP_PATH);
console.log(JSON.stringify({
  updated: DEBUG_NAMES,
  sortingLayer: "MapLayer7",
  lineOrder: 900,
  markerOrder: 901,
}, null, 2));
