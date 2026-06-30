const path = require("path");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const files = [
  "../ui/MafiaLobbyHUD.ui",
  "../ui/MafiaDayHUD.ui",
  "../ui/MafiaPlayHUD.ui",
];

const coverSpecs = [
  ["ChatMarginLeft", [-330, -155], [32, 780], 100],
  ["ChatMarginRight", [330, -155], [32, 780], 101],
  ["ChatMarginTop", [0, -155], [820, 24], 102],
  ["ChatMarginBottom", [0, -915], [820, 20], 103],
];

for (const relative of files) {
  const file = path.resolve(__dirname, relative);
  const ui = UIBuilder.read(file);

  ui.patch("CenterPanel/PhaseChatPlate", {
    pos: [0, -155],
    rect_size: [820, 780],
  });

  for (const [name, position, size, displayOrder] of coverSpecs) {
    ui.patch(`CenterPanel/${name}`, {
      pos: position,
      rect_size: size,
      display_order: displayOrder,
    });
  }

  ui.patch("CenterPanel/ChatInput", {
    position: [-65, -350],
    size: [560, 54],
    displayOrder: 30,
  });
  ui.patchComponent("CenterPanel/ChatInput", "MOD.Core.TextInputComponent", {
    Text: "",
    PlaceHolder: "채팅을 입력하세요...",
    PlaceHolderColor: { r: 0.91, g: 0.85, b: 0.71, a: 1 },
    CharacterLimit: 100,
  });

  ui.patch("CenterPanel/ChatSendButton", {
    position: [285, -350],
    size: [115, 54],
    displayOrder: 31,
  });
  ui.patchComponent("CenterPanel/ChatSendButton", "MOD.Core.TextComponent", {
    Text: "전송",
  });

  ui.write(file, { strict: true });
  console.log(`updated ${path.basename(file)}`);
}
