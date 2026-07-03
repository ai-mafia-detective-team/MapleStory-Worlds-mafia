const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaDayHUD.ui';
const b = UIBuilder.read(file);

const path = '/ui/MafiaDayHUD/CenterPanel/SkipCountText';
const WHITE = { r: 1, g: 1, b: 1, a: 1 };

if (b.find(path)) {
  b.remove(path);
}

b.text(path, '0/8', {
  anchor: 'middle-center',
  pos: [220, -440],
  rect_size: [130, 48],
  enable: true,
  font_size: 25,
  color: WHITE,
  display_order: 835,
});

b.patchComponent(path, 'MOD.Core.TextComponent', {
  Text: '0/8',
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
  OrderInLayer: 836,
});

const findings = b.validate();
const errors = findings.filter((finding) => finding.severity === 'error');
if (errors.length > 0) {
  console.error(errors);
  process.exit(1);
}

b.write(file, { lint: false });
console.log('[add_day_skip_count_text] added /ui/MafiaDayHUD/CenterPanel/SkipCountText');
