const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaNightHUD.ui';
const b = UIBuilder.read(file);

const card = '/ui/MafiaNightHUD/Police/Police_4/UISprite_7';
const avatar = `${card}/NightAvatar`;
const name = `${card}/NightNameText`;
const WHITE = { r: 1, g: 1, b: 1, a: 1 };
const TRANSPARENT = { r: 1, g: 1, b: 1, a: 0 };

if (!b.find(card)) {
  throw new Error(`Missing police slot 7 card: ${card}`);
}

if (!b.find(avatar)) {
  b.avatar(avatar, {
    anchor: 'middle-center',
    pos: [0, 15.484],
    rect_size: [220, 157.978333],
    preserve_avatar: 0,
    flip_x: false,
    play_rate: 1,
    raycast: true,
    enable: false,
  });
}

if (!b.find(name)) {
  b.text(name, '', {
    anchor: 'middle-center',
    pos: [-31.1234, -90.2802],
    rect_size: [112.56208, 37.806366],
    enable: true,
    font_size: 20,
    color: WHITE,
    display_order: 1,
  });
}

b.patchComponent(name, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: TRANSPARENT,
  RaycastTarget: false,
});
b.patchComponent(name, 'MOD.Core.TextComponent', {
  Text: '',
  Font: 1,
  FontSize: 20,
  FontColor: WHITE,
  Bold: true,
  Alignment: 4,
  Overflow: 0,
  UseConstraintX: true,
  ConstraintX: 100,
  UseConstraintY: true,
  ConstraintY: 100,
  DropShadow: true,
  DropShadowColor: { r: 0, g: 0, b: 0, a: 0.9 },
  DropShadowDistance: 1.5,
  DropShadowAngle: 315,
});

const findings = b.validate();
const errors = findings.filter((finding) => finding.severity === 'error');
if (errors.length > 0) {
  console.error(errors);
  process.exit(1);
}

b.write(file, { lint: false });
console.log('[repair_night_police_slot7_structure] repaired Police slot 7 NightAvatar/NightNameText');
