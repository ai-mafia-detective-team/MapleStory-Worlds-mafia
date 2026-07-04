const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = [
  ["ui/MafiaPlayHUD.ui", [0, -25]],
  ["ui/MafiaLobbyHUD.ui", [-2, 19]],
  ["ui/MafiaDayHUD.ui", [0, -25]],
];
const TEXT = "MOD.Core.TextComponent";

for (const [path, pos] of HUDS) {
  const ui = UIBuilder.load(path);

  if (ui.find("CenterPanel/ChatLogText")) ui.remove("CenterPanel/ChatLogText");
  if (ui.find("CenterPanel/ChatScroll")) ui.remove("CenterPanel/ChatScroll");

  ui.scrollLayout("CenterPanel/ChatScroll", {
    anchor: "middle-center",
    pos,
    rect_size: [640, 450],
    layout_type: 1,
    spacing: 0,
    use_scroll: true,
    padding: [12, 22, 10, 10],
    scroll_bar_visible: 1,
    scroll_bar_thickness: 10,
  });
  ui.patch("CenterPanel/ChatScroll", { display_order: 12 });

  ui.text("CenterPanel/ChatScroll/ChatLogText", "아직 등록된 메시지가 없습니다.", {
    anchor: "top-center",
    pos: [0, 0],
    rect_size: [600, 450],
    font_size: 17,
    color: "#DDDDDD",
    alignment: 0,
    overflow: 0,
    raycast: false,
  });
  ui.patchComponent("CenterPanel/ChatScroll/ChatLogText", TEXT, {
    Font: 1,
    FontSize: 17,
    Alignment: 0,
    Overflow: 0,
    FontColor: { r: 0.867, g: 0.867, b: 0.867, a: 1 },
  });

  for (const entity of [...ui.entities]) {
    const entityPath = entity.jsonString.path;
    if (entityPath && ui.hasComponent(entityPath, TEXT)) {
      ui.patchComponent(entityPath, TEXT, { Font: 1 });
    }
  }

  ui.patchComponent("CenterPanel/ChatSendButton", TEXT, {
    Font: 1,
    FontSize: 21,
  });

  ui.write(path, { lint: true, strict: true });
}

console.log("[MafiaChatScroll] scroll view built; send font size set to 21");
