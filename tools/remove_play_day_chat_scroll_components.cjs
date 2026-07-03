const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SCROLL = "MOD.Core.ScrollLayoutGroupComponent";

const targets = [
  { file: "ui/MafiaPlayHUD.ui", root: "MafiaPlayHUD" },
  { file: "ui/MafiaDayHUD.ui", root: "MafiaDayHUD" },
];

for (const { file, root } of targets) {
  const b = UIBuilder.read(file);
  const chatScrollPath = `/ui/${root}/CenterPanel/ChatScroll`;

  if (b.hasComponent(chatScrollPath, SCROLL)) {
    b.removeComponent(chatScrollPath, SCROLL);
    console.log(`[remove_chat_scroll] removed ScrollLayoutGroupComponent from ${chatScrollPath}`);
  } else {
    console.log(`[remove_chat_scroll] no ScrollLayoutGroupComponent on ${chatScrollPath}`);
  }

  b.write(file);
}
