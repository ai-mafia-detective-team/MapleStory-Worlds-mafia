const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];

for (const path of HUDS) {
  const ui = UIBuilder.load(path);
  ui.patch("CenterPanel/PhaseTitleText", {
    anchor: "top-center", pos: [0, -205], rect_size: [620, 52],
  });
  ui.patch("CenterPanel/PhaseDescriptionText", {
    anchor: "top-center", pos: [0, -255], rect_size: [620, 38],
  });
  ui.patch("CenterPanel/ChatLogText", {
    anchor: "middle-center", pos: [0, -25], rect_size: [640, 450],
  });
  ui.patch("CenterPanel/VoteStatusText", {
    anchor: "middle-center", pos: [0, -275], rect_size: [620, 40],
  });
  ui.patch("CenterPanel/VoteHintText", {
    anchor: "middle-center", pos: [0, -312], rect_size: [620, 30],
  });
  ui.patch("CenterPanel/ChatInput", {
    anchor: "middle-center", pos: [-60, -355], rect_size: [535, 54],
  });
  ui.patch("CenterPanel/ChatSendButton", {
    anchor: "middle-center", pos: [270, -355], rect_size: [110, 54],
  });
  ui.write(path, { lint: true, strict: true });
}

console.log("[MafiaChatLayout] text and composer aligned to revised chat art");
