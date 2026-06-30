const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];
const BG_RUID = "b5893936b00e4d9d88607ebef9f15f30";
const SPRITE = "MOD.Core.SpriteGUIRendererComponent";
const TEXT = "MOD.Core.TextComponent";
const INPUT = "MOD.Core.TextInputComponent";

const covers = [
  ["ChatMarginLeft",  [-351, -180], [38, 760], 4],
  ["ChatMarginRight", [351, -180],  [38, 760], 5],
  ["ChatMarginTop",   [0, -180],    [740, 24], 6],
  ["ChatMarginBottom",[0, -920],    [740, 20], 7],
];

for (const path of HUDS) {
  const ui = UIBuilder.load(path);
  for (const [name, pos, size, order] of covers) {
    const target = `CenterPanel/${name}`;
    if (!ui.find(target)) {
      ui.sprite(target, {
        anchor: "top-center",
        pos,
        rect_size: size,
        image_ruid: BG_RUID,
        raycast: false,
      });
    } else {
      ui.patch(target, { anchor: "top-center", pos, rect_size: size });
      ui.patchComponent(target, SPRITE, {
        ImageRUID: { DataId: BG_RUID },
        PreserveAspect: false,
        RaycastTarget: false,
      });
    }
    ui.patch(target, { display_order: order });
  }

  if (!ui.find("CenterPanel/ChatInput")) {
    ui.textInput("CenterPanel/ChatInput", {
      anchor: "middle-center",
      pos: [-60, -355],
      rect_size: [535, 54],
      image_ruid: "",
      placeholder: "채팅을 입력하세요...",
      font_size: 18,
      color: "#E8D8B5",
      char_limit: 100,
    });
  }
  if (!ui.find("CenterPanel/ChatSendButton")) {
    ui.button("CenterPanel/ChatSendButton", "전송", {
      anchor: "middle-center",
      pos: [270, -355],
      rect_size: [110, 54],
      image_ruid: "",
      font_size: 18,
      color: "#F2E1B8",
    });
  }
  ui.patchComponent("CenterPanel/ChatInput", SPRITE, {
    ImageRUID: { DataId: "" },
    Color: { r: 1, g: 1, b: 1, a: 0 },
    RaycastTarget: true,
  });
  ui.patchComponent("CenterPanel/ChatInput", INPUT, {
    PlaceHolder: "채팅을 입력하세요...",
  });
  ui.patchComponent("CenterPanel/ChatInput", TEXT, {
    FontColor: { r: 0.91, g: 0.85, b: 0.71, a: 1 },
  });
  ui.patchComponent("CenterPanel/ChatSendButton", SPRITE, {
    ImageRUID: { DataId: "" },
    Color: { r: 1, g: 1, b: 1, a: 0 },
    RaycastTarget: true,
  });
  ui.patchComponent("CenterPanel/ChatSendButton", TEXT, {
    Text: "전송",
    FontColor: { r: 0.95, g: 0.88, b: 0.72, a: 1 },
  });
  ui.write(path, { lint: true, strict: true });
}

console.log("[MafiaChatMargins] checker margins covered; composer labels updated");
