const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaDayHUD.ui';
const b = UIBuilder.read(file);

const path = '/ui/MafiaDayHUD/CenterPanel/SkipButton';
const SKIP_RUID = '0bb0e4a8090b488dadffcdda7fb5c79a';
const WHITE = { r: 1, g: 1, b: 1, a: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };

if (b.find(path)) {
  b.remove(path);
}

b.button(path, '스킵', {
  anchor: 'middle-center',
  pos: [0, -450],
  rect_size: [640, 82],
  enable: true,
  font_size: 25,
  color: WHITE,
  display_order: 820,
});

b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
  ImageRUID: { DataId: SKIP_RUID },
  Type: 0,
  Color: WHITE,
  RaycastTarget: true,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 820,
});

b.patchComponent(path, 'MOD.Core.TextComponent', {
  Text: '스킵',
  Font: 1,
  FontSize: 25,
  FontColor: WHITE,
  Bold: true,
  Alignment: 4,
  Overflow: 0,
  DropShadow: true,
  DropShadowColor: { r: 0, g: 0, b: 0, a: 0.9 },
  DropShadowDistance: 1.5,
  DropShadowAngle: 315,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 821,
});

if (b.hasComponent(path, 'MOD.Core.ButtonComponent')) {
  b.patchComponent(path, 'MOD.Core.ButtonComponent', {
    Enable: true,
  });
}

const findings = b.validate();
const errors = findings.filter((finding) => finding.severity === 'error');
if (errors.length > 0) {
  console.error(errors);
  process.exit(1);
}

b.write(file, { lint: false });
console.log('[add_day_skip_button] added MafiaDayHUD CenterPanel/SkipButton');
