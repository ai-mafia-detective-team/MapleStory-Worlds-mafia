const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];
const CHAT_RUID = "fc017c293d2a4f65b985860452d860e5";
const masks = [
  "ChatMarginLeft", "ChatMarginRight", "ChatMarginTop", "ChatMarginBottom",
  "ChatSolidMaskLeft", "ChatSolidMaskRight",
];

for (const path of HUDS) {
  const ui = UIBuilder.load(path);
  ui.patchComponent("CenterPanel/PhaseChatPlate", "MOD.Core.SpriteGUIRendererComponent", {
    ImageRUID: { DataId: CHAT_RUID },
    PreserveAspect: false,
    Color: { r: 1, g: 1, b: 1, a: 1 },
  });
  for (const name of masks) {
    const target = `CenterPanel/${name}`;
    if (ui.find(target)) ui.patch(target, { enable: false });
  }
  ui.write(path, { lint: true, strict: true });
}

console.log(`[MafiaChat] clean RUID applied: ${CHAT_RUID}`);
