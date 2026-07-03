const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const UI_PATH = "ui/MafiaLobbyHUD.ui";
const ROOM = "/ui/MafiaLobbyHUD/RoomBadge1";

const TEXT_DEBUG = [
  `${ROOM}/DebugUITextFoothold_Line`,
  `${ROOM}/DebugUITextFoothold_Left`,
  `${ROOM}/DebugUITextFoothold_Right`,
  `${ROOM}/DebugUITextSpawn_1`,
];

const ui = UIBuilder.read(UI_PATH);

for (const path of TEXT_DEBUG) {
  if (ui.find(path)) ui.remove(path);
}

function addDebugText(path, text, pos, size, color, rectSize) {
  ui.text(path, text, {
    anchor: "middle-center",
    pos,
    rect_size: rectSize,
    size,
    color,
    bold: true,
    alignment: 4,
    outline: true,
    outline_color: { r: 0, g: 0, b: 0, a: 1 },
    outline_width: 2,
  });
  ui.patch(path, { display_order: 10000 });
}

// Text-based debug overlay. It is intentionally loud and temporary.
addDebugText(
  `${ROOM}/DebugUITextFoothold_Line`,
  "━━━━━━━━━━━━━━━━━━━━",
  [0, -78],
  26,
  { r: 0, g: 1, b: 0.1, a: 1 },
  [520, 34],
);

addDebugText(
  `${ROOM}/DebugUITextFoothold_Left`,
  "●",
  [-252, -78],
  30,
  { r: 1, g: 0, b: 0, a: 1 },
  [60, 50],
);

addDebugText(
  `${ROOM}/DebugUITextFoothold_Right`,
  "●",
  [252, -78],
  30,
  { r: 1, g: 0, b: 0, a: 1 },
  [60, 50],
);

addDebugText(
  `${ROOM}/DebugUITextSpawn_1`,
  "◆",
  [0, -52],
  34,
  { r: 1, g: 0.85, b: 0, a: 1 },
  [70, 60],
);

ui.write(UI_PATH, { lint: true, strict: true });

console.log(JSON.stringify({
  added: TEXT_DEBUG,
  note: "Text-based debug overlay: green line = foothold, red dots = endpoints, yellow diamond = spawn.",
}, null, 2));
