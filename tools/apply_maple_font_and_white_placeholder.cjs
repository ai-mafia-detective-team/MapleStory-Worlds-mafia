const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];
const TEXT = "MOD.Core.TextComponent";
const INPUT = "MOD.Core.TextInputComponent";

for (const path of HUDS) {
  const ui = UIBuilder.load(path);
  let textCount = 0;

  for (const entity of [...ui.entities]) {
    const entityPath = entity.jsonString.path;
    if (!entityPath || !ui.hasComponent(entityPath, TEXT)) continue;
    ui.patchComponent(entityPath, TEXT, { FontType: 1 });
    textCount += 1;
  }

  const chatInput = "CenterPanel/ChatInput";
  if (ui.find(chatInput)) {
    ui.patchComponent(chatInput, INPUT, {
      PlaceHolder: "채팅을 입력하세요...",
      PlaceHolderColor: { r: 1, g: 1, b: 1, a: 1 },
    });
    ui.patchComponent(chatInput, TEXT, {
      FontType: 1,
      FontColor: { r: 1, g: 1, b: 1, a: 1 },
    });
  }

  ui.write(path, { lint: true, strict: true });
  console.log(`[MapleFont] ${path}: ${textCount} TextComponent(s)`);
}

console.log("[MapleFont] all gameplay HUD text unified; chat placeholder set to white");
