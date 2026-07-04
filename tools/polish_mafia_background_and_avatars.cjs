const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SPRITE = "MOD.Core.SpriteGUIRendererComponent";
const BACKGROUND_RUID = "b5893936b00e4d9d88607ebef9f15f30";
const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];

for (const path of HUDS) {
  const ui = UIBuilder.load(path);
  ui.patch("CenterPanel/Bg", {
    anchor: "stretch",
    pos: [0, 0],
    rect_size: [800, 1080],
    display_order: 0,
  });
  ui.patchComponent("CenterPanel/Bg", SPRITE, {
    ImageRUID: { DataId: BACKGROUND_RUID },
    Type: 0,
    PreserveAspect: false,
    RaycastTarget: false,
  });
  ui.write(path, { lint: true, strict: true });
}

const lobby = UIBuilder.load("ui/MafiaLobbyHUD.ui");
for (let i = 1; i <= 8; i += 1) {
  lobby.patch(`RoomBadge${i}/PlayerAvatar`, {
    anchor: "middle-center",
    pos: [0, -55],
    rect_size: [110, 165],
  });
}
lobby.write("ui/MafiaLobbyHUD.ui", { lint: true, strict: true });

console.log("[MafiaPolish] background and lobby avatar scale updated");
