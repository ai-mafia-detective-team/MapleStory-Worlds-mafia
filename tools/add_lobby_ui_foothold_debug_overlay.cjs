const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const UI_PATH = "ui/MafiaLobbyHUD.ui";
const ROOM = "/ui/MafiaLobbyHUD/RoomBadge1";

const DEBUG_ENTITIES = [
  `${ROOM}/DebugUIFoothold_Line`,
  `${ROOM}/DebugUIFoothold_Left`,
  `${ROOM}/DebugUIFoothold_Right`,
  `${ROOM}/DebugUISpawn_1`,
  `${ROOM}/DebugUIFoothold_Label`,
];

const ui = UIBuilder.read(UI_PATH);

for (const path of DEBUG_ENTITIES) {
  if (ui.find(path)) ui.remove(path);
}

// RoomBadge1 is 565 x 270. These markers are a temporary visual overlay
// for the real world foothold (-5.983, 1.900) -> (-2.674, 1.900).
// Position chosen to sit near the visible floor under the lobby avatar.
ui.polygon(`${ROOM}/DebugUIFoothold_Line`, {
  anchor: "middle-center",
  pos: [0, -78],
  rect_size: [480, 20],
  points: [[-240, -7], [240, -7], [240, 7], [-240, 7]],
  color: { r: 0, g: 1, b: 0.1, a: 0.95 },
});
ui.patch(`${ROOM}/DebugUIFoothold_Line`, { display_order: 9990 });

ui.polygon(`${ROOM}/DebugUIFoothold_Left`, {
  anchor: "middle-center",
  pos: [-240, -78],
  rect_size: [30, 30],
  points: [[-15, -15], [15, -15], [15, 15], [-15, 15]],
  color: { r: 1, g: 0, b: 0, a: 1 },
});
ui.patch(`${ROOM}/DebugUIFoothold_Left`, { display_order: 9991 });

ui.polygon(`${ROOM}/DebugUIFoothold_Right`, {
  anchor: "middle-center",
  pos: [240, -78],
  rect_size: [30, 30],
  points: [[-15, -15], [15, -15], [15, 15], [-15, 15]],
  color: { r: 1, g: 0, b: 0, a: 1 },
});
ui.patch(`${ROOM}/DebugUIFoothold_Right`, { display_order: 9991 });

ui.polygon(`${ROOM}/DebugUISpawn_1`, {
  anchor: "middle-center",
  pos: [0, -52],
  rect_size: [36, 36],
  points: [[0, 18], [18, 0], [0, -18], [-18, 0]],
  color: { r: 1, g: 0.85, b: 0, a: 1 },
});
ui.patch(`${ROOM}/DebugUISpawn_1`, { display_order: 9992 });

ui.text(`${ROOM}/DebugUIFoothold_Label`, "발판/스폰 확인용", {
  anchor: "middle-center",
  pos: [0, -18],
  rect_size: [260, 34],
  size: 22,
  color: { r: 0.2, g: 1, b: 0.2, a: 1 },
  bold: true,
  outline: true,
  outline_color: { r: 0, g: 0, b: 0, a: 1 },
  outline_width: 2,
});
ui.patch(`${ROOM}/DebugUIFoothold_Label`, { display_order: 9993 });

ui.write(UI_PATH, { lint: true, strict: true });

console.log(JSON.stringify({
  added: DEBUG_ENTITIES,
  note: "Temporary UI overlay in RoomBadge1. Real foothold remains in map/map01.map.",
}, null, 2));
