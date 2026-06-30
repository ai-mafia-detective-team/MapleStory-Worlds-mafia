const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SCROLL = "MOD.Core.ScrollLayoutGroupComponent";

const targets = [
  { file: "ui/MafiaPlayHUD.ui", root: "MafiaPlayHUD" },
  { file: "ui/MafiaDayHUD.ui", root: "MafiaDayHUD" },
];

for (const { file, root } of targets) {
  const b = UIBuilder.read(file);
  const chatScrollPath = `/ui/${root}/CenterPanel/ChatScroll`;

  b.patchComponent(chatScrollPath, SCROLL, {
    ScrollBarVisible: 2,
    ScrollBarThickness: 0,
    ScrollBarHandleColor: { r: 0, g: 0, b: 0, a: 0 },
    ScrollBarBackgroundColor: { r: 0, g: 0, b: 0, a: 0 },
  });

  b.write(file);
  console.log(`[hide_play_day_chat_scrollbars] hidden default scrollbars in ${file}`);
}
