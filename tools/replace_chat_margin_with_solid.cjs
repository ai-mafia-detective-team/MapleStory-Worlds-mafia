const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const HUDS = ["ui/MafiaPlayHUD.ui", "ui/MafiaLobbyHUD.ui", "ui/MafiaDayHUD.ui"];
const oldCovers = ["ChatMarginLeft", "ChatMarginRight", "ChatMarginTop", "ChatMarginBottom"];
const solids = [
  ["ChatSolidMaskLeft", [-390, -155]],
  ["ChatSolidMaskRight", [390, -155]],
];

for (const path of HUDS) {
  const ui = UIBuilder.load(path);

  for (const name of oldCovers) {
    const target = `CenterPanel/${name}`;
    if (ui.find(target)) ui.patch(target, { enable: false });
  }

  for (const [name, pos] of solids) {
    const target = `CenterPanel/${name}`;
    if (!ui.find(target)) {
      ui.polygon(target, {
        anchor: "top-center",
        pos,
        rect_size: [48, 780],
        points: [[-24, -390], [24, -390], [24, 390], [-24, 390]],
        color: "#17130F",
      });
    } else {
      ui.patch(target, {
        anchor: "top-center",
        pos,
        rect_size: [48, 780],
        enable: true,
      });
      ui.patchComponent(target, "MOD.Core.PolygonGUIRendererComponent", {
        Color: { r: 0.090, g: 0.075, b: 0.059, a: 1 },
      });
    }
    ui.patch(target, { display_order: 100 });
  }

  ui.write(path, { lint: true, strict: true });
}

console.log("[MafiaChatMargins] image covers replaced with opaque polygon masks");
