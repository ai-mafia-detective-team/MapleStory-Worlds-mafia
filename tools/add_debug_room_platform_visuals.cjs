const fs = require("node:fs");
const path = require("node:path");
const { MapBuilder } = require("../.agents/skills/msw-general/scripts/map/msw_map_builder.cjs");

const MAP_PATH = "map/map01.map";
const DEBUG_NAMES = [
  "DebugFoothold_Line",
  "DebugFoothold_Left",
  "DebugFoothold_Right",
  "DebugSpawn_1",
];

const start = { x: -5.983, y: 1.900 };
const end = { x: -2.674, y: 1.900 };
const spawn = { x: (start.x + end.x) / 2, y: start.y + 0.08 };
const length = Math.abs(end.x - start.x);
const mid = { x: (start.x + end.x) / 2, y: start.y };

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

function scale(map, name, value) {
  const transform = map.component(name, "MOD.Core.TransformComponent");
  transform.Scale = { x: value[0], y: value[1], z: value[2] };
}

const backupPath = path.join("map", `map01.before-debug-platform-visuals-${timestamp()}.map`);
fs.copyFileSync(MAP_PATH, backupPath);

const map = MapBuilder.read(MAP_PATH);
if (map.getTileMapMode() !== 0) {
  throw new Error("map01 must remain MapleTile (TileMapMode=0)");
}

for (const name of DEBUG_NAMES) {
  if (map.find(name)) map.remove(name);
}

// A thin green bar sitting exactly on top of the invisible foothold.
map.sprite("DebugFoothold_Line", {
  pos: [mid.x, mid.y, 10],
  color: [0.1, 1, 0.25, 0.78],
  order: 99,
});
scale(map, "DebugFoothold_Line", [length, 0.045, 1]);

// Red endpoint markers.
map.sprite("DebugFoothold_Left", {
  pos: [start.x, start.y, 11],
  color: [1, 0.1, 0.1, 1],
  order: 100,
});
scale(map, "DebugFoothold_Left", [0.11, 0.11, 1]);

map.sprite("DebugFoothold_Right", {
  pos: [end.x, end.y, 11],
  color: [1, 0.1, 0.1, 1],
  order: 100,
});
scale(map, "DebugFoothold_Right", [0.11, 0.11, 1]);

// Yellow spawn marker just above the foothold.
map.sprite("DebugSpawn_1", {
  pos: [spawn.x, spawn.y, 12],
  color: [1, 0.82, 0.05, 1],
  order: 101,
});
scale(map, "DebugSpawn_1", [0.14, 0.14, 1]);

map.write(MAP_PATH);

console.log(JSON.stringify({
  backupPath,
  debug: {
    line: { start, end, mid, length },
    spawn,
    entities: DEBUG_NAMES,
  },
}, null, 2));
