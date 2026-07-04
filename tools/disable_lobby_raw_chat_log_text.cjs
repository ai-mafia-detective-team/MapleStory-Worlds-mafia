const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const file = "ui/MafiaLobbyHUD.ui";
const b = UIBuilder.read(file);
const path = "/ui/MafiaLobbyHUD/CenterPanel/ChatScroll/ChatLogText";

if (b.find(path)) {
  b.patch(path, { enable: false });
  b.patchComponent(path, "MOD.Core.TextComponent", { Text: "" });
  console.log(`[disable_lobby_raw_chat_log_text] disabled ${path}`);
}

b.write(file);
