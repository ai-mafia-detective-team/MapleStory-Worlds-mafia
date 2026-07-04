const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const file = "ui/MafiaLobbyHUD.ui";
const root = "MafiaLobbyHUD";
const names = ["Scroll", "Up", "Down", "Thumb", "ThumbSmall"];

const b = UIBuilder.read(file);

for (const name of names) {
  const path = `/ui/${root}/${name}`;
  if (b.find(path)) {
    b.remove(path);
    console.log(`[remove_lobby_gray_scroll] removed ${path}`);
  } else {
    console.log(`[remove_lobby_gray_scroll] not found ${path}`);
  }
}

b.write(file);
