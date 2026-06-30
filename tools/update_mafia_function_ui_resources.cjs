const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SPRITE = "MOD.Core.SpriteGUIRendererComponent";
const RUID = {
  chat: "7a1622bf3dff49b7b3a8fe68e5299bc3",
  ready: "ffb351d9365345a5a61181aae6ab1444",
  roomInfo: "dbe17dcf76014cf7963de76be10ed6a8",
  skip: "0bb0e4a8090b488dadffcdda7fb5c79a",
};

const HUDS = [
  { path: "ui/MafiaPlayHUD.ui", actionRuid: RUID.skip },
  { path: "ui/MafiaDayHUD.ui", actionRuid: RUID.skip },
  { path: "ui/MafiaLobbyHUD.ui", actionRuid: RUID.ready },
];

function setImage(ui, path, ruid) {
  ui.patchComponent(path, SPRITE, {
    ImageRUID: { DataId: ruid },
    Type: 0,
    PreserveAspect: false,
  });
}

for (const hud of HUDS) {
  const ui = UIBuilder.load(hud.path);

  setImage(ui, "CenterPanel/PhaseChatPlate", RUID.chat);
  setImage(ui, "CenterPanel/RoomInfoPlate", RUID.roomInfo);
  setImage(ui, "CenterPanel/SkipButton", hud.actionRuid);

  // Lobby ready/ready-complete intentionally shares one layout image.
  // MafiaUIFlow continues to change only the button's TextComponent text.
  ui.write(hud.path, { lint: true, strict: true });
  console.log(`[MafiaFunctionUI] updated ${hud.path}`);
}
