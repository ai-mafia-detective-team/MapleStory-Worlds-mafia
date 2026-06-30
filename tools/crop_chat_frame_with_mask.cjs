const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];
const CHAT_RUID = "fc017c293d2a4f65b985860452d860e5";

for (const path of HUDS) {
  const ui = UIBuilder.load(path);

  ui.patch("CenterPanel/PhaseChatPlate", { enable: false });

  if (ui.find("CenterPanel/ChatCropMask")) {
    ui.remove("CenterPanel/ChatCropMask");
  }

  ui.mask("CenterPanel/ChatCropMask", {
    anchor: "top-center",
    pos: [0, -166],
    rect_size: [730, 724],
    alpha: 0,
    shape: 0,
  });
  ui.patch("CenterPanel/ChatCropMask", { display_order: 3 });

  ui.sprite("CenterPanel/ChatCropMask/Frame", {
    anchor: "middle-center",
    pos: [0, 0],
    rect_size: [820, 780],
    image_ruid: CHAT_RUID,
    preserve_aspect: false,
    raycast: false,
  });
  ui.patch("CenterPanel/ChatCropMask/Frame", { display_order: 0 });

  ui.write(path, { lint: true, strict: true });
}

console.log("[MafiaChat] transparent outer pixels cropped with MaskComponent");
