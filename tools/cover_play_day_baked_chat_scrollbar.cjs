const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const targets = [
  { file: "ui/MafiaPlayHUD.ui", root: "MafiaPlayHUD" },
  { file: "ui/MafiaDayHUD.ui", root: "MafiaDayHUD" },
];

// Same dark color used by the existing side solid masks.
const DARK_CHAT_BODY = { r: 0.09019608, g: 0.07450981, b: 0.05882353, a: 1 };

for (const { file, root } of targets) {
  const b = UIBuilder.read(file);
  const coverPath = `/ui/${root}/CenterPanel/ChatScrollbarCover`;

  b.polygon(coverPath, {
    anchor: "top-center",
    pos: [335, -340],
    rect_size: [28, 430],
    color: DARK_CHAT_BODY,
    points: [
      [-14, -215],
      [14, -215],
      [14, 215],
      [-14, 215],
    ],
    raycast: false,
    display_order: 40,
  });

  b.write(file);
  console.log(`[cover_baked_scrollbar] added/updated ${coverPath}`);
}
