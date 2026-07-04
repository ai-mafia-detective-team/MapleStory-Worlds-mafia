const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const ROOT = '/ui/MafiaLobbyHUD/RoomSettings';
const WHITE = { r: 1, g: 0.88, b: 0.66, a: 1 };
const SOFT_WHITE = { r: 0.92, g: 0.82, b: 0.66, a: 1 };
const GOLD = { r: 1, g: 0.78, b: 0.22, a: 1 };
const CHECK_ON = '1b2a5fa1d9434bbba21c87ba798cd725';

function removeIfExists(path) {
  if (b.find(path)) b.remove(path);
}

function upsertLabel(path, text, pos, size, fontSize, color = WHITE, align = 3) {
  removeIfExists(path);
  b.text(path, text, {
    anchor: 'middle-center',
    pos,
    rect_size: size,
    size: fontSize,
    color,
    bold: true,
    alignment: align,
    overflow: 2,
    display_order: 240,
  });
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: fontSize,
    FontColor: color,
    Bold: true,
    Alignment: align,
    UseOutLine: true,
    OutlineColor: { r: 0.1, g: 0.06, b: 0.03, a: 1 },
    OutlineWidth: 1,
    OrderInLayer: 920,
    OverrideSorting: true,
    SortingLayer: 'UI',
  });
}

function patchTransform(path, pos, size) {
  if (b.find(path)) b.patch(path, { pos, rect_size: size });
}

function patchText(path, fontSize, color, align = 4) {
  if (!b.find(path)) return;
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: fontSize,
    FontColor: color,
    Bold: true,
    Alignment: align,
    UseOutLine: true,
    OutlineColor: { r: 0.1, g: 0.06, b: 0.03, a: 1 },
    OutlineWidth: 1,
  });
}

function patchSpriteTop(path, orderInLayer) {
  if (!b.find(path)) return;
  b.patch(path, { display_order: orderInLayer });
  b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
    Color: { r: 1, g: 1, b: 1, a: 1 },
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: orderInLayer,
    RaycastTarget: false,
    PreserveAspect: true,
  });
}

// Modal frame: close to the supplied reference image while staying inside the
// current center HUD bounds.
b.patch(ROOT, {
  enable: false,
  visible: true,
  display_order: 90,
  pos: [0, -35],
  rect_size: [830, 940],
});

// Existing visual pieces.
patchTransform(`${ROOT}/_1`, [11, 385], [610, 310]);          // top title ornament
patchTransform(`${ROOT}/_2`, [325, 330], [95, 95]);           // close circle
patchTransform(`${ROOT}/_3`, [72, 206], [405, 82]);           // room title input visual
patchTransform(`${ROOT}/_4`, [-225, 112], [72, 72]);          // legacy checkbox fallback
if (b.find(`${ROOT}/_4`)) {
  b.patchComponent(`${ROOT}/_4`, 'MOD.Core.SpriteGUIRendererComponent', {
    ImageRUID: { DataId: CHECK_ON },
  });
  patchSpriteTop(`${ROOT}/_4`, 950);
}
patchTransform(`${ROOT}/_5`, [2, 154], [595, 82]);            // divider/private row
patchTransform(`${ROOT}/_6`, [76, 38], [405, 82]);            // password input visual
patchTransform(`${ROOT}/_6/_6_1`, [-150, -1], [60, 60]);      // lock icon
patchTransform(`${ROOT}/_7`, [0, -16], [595, 82]);            // divider/password row
patchTransform(`${ROOT}/_8`, [208, -62], [100, 100]);         // player 8
patchTransform(`${ROOT}/_9`, [79, -62], [100, 100]);          // player 7
patchTransform(`${ROOT}/_10`, [-50, -62], [100, 100]);        // player 6
patchTransform(`${ROOT}/_14`, [0, -116], [595, 82]);          // divider/player row
patchTransform(`${ROOT}/_11`, [-50, -165], [100, 100]);       // mafia 1
patchTransform(`${ROOT}/_12`, [79, -165], [100, 100]);        // mafia 2
patchTransform(`${ROOT}/_13`, [208, -165], [100, 100]);       // mafia 3
patchTransform(`${ROOT}/_15`, [-154, -262], [215, 126]);      // cancel visual
patchTransform(`${ROOT}/UISprite`, [164, -262], [215, 126]);  // confirm visual

// Functional controls align over the visual pieces.
patchTransform(`${ROOT}/RoomTitleInput`, [104, 206], [330, 58]);
patchTransform(`${ROOT}/PrivateToggleButton`, [-75, 112], [300, 74]);
if (b.find(`${ROOT}/PrivateToggleButton`)) {
  b.patchComponent(`${ROOT}/PrivateToggleButton`, 'MOD.Core.SpriteGUIRendererComponent', {
    ImageRUID: { DataId: '00000000000000000000000000000000' },
    Color: { r: 1, g: 1, b: 1, a: 0 },
    OverrideSorting: false,
    OrderInLayer: 0,
  });
}
patchTransform(`${ROOT}/PasswordInput`, [104, 38], [330, 58]);
patchTransform(`${ROOT}/Player6Button`, [-50, -62], [96, 96]);
patchTransform(`${ROOT}/Player7Button`, [79, -62], [96, 96]);
patchTransform(`${ROOT}/Player8Button`, [208, -62], [96, 96]);
patchTransform(`${ROOT}/Mafia1Button`, [-50, -165], [96, 96]);
patchTransform(`${ROOT}/Mafia2Button`, [79, -165], [96, 96]);
patchTransform(`${ROOT}/Mafia3Button`, [208, -165], [96, 96]);
patchTransform(`${ROOT}/CloseButton`, [325, 330], [95, 95]);
patchTransform(`${ROOT}/CancelButton`, [-154, -262], [215, 118]);
patchTransform(`${ROOT}/ConfirmButton`, [164, -262], [215, 118]);

patchText(`${ROOT}/RoomTitleInput`, 26, SOFT_WHITE, 3);
patchText(`${ROOT}/PasswordInput`, 26, SOFT_WHITE, 3);
patchText(`${ROOT}/CloseButton`, 38, WHITE, 4);
patchText(`${ROOT}/CancelButton`, 38, WHITE, 4);
patchText(`${ROOT}/ConfirmButton`, 38, GOLD, 4);

for (const path of [
  `${ROOT}/Player6Button`,
  `${ROOT}/Player7Button`,
  `${ROOT}/Player8Button`,
  `${ROOT}/Mafia1Button`,
  `${ROOT}/Mafia2Button`,
  `${ROOT}/Mafia3Button`,
]) {
  patchText(path, 38, WHITE, 4);
  if (b.find(path)) {
    b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
      Color: { r: 1, g: 1, b: 1, a: 0.01 },
    });
  }
}
if (b.find(`${ROOT}/Player8Button`)) {
  b.patchComponent(`${ROOT}/Player8Button`, 'MOD.Core.TextComponent', { FontColor: GOLD });
}
if (b.find(`${ROOT}/Mafia2Button`)) {
  b.patchComponent(`${ROOT}/Mafia2Button`, 'MOD.Core.TextComponent', { FontColor: GOLD });
}

// Clear previous labels and add polished text overlays matching the reference.
for (const name of [
  'TitleLabel',
  'RoomTitleLabel',
  'PrivateLabel',
  'PrivateCheckMark',
  'PasswordLabel',
  'PlayerCountLabel',
  'MafiaCountLabel',
  'PrivateSwitchLabel',
  'PrivateSwitchVisual',
  'PrivateSwitchKnob',
  'PrivateSwitchHotspot',
  'PrivateCheckboxSprite',
]) {
  removeIfExists(`${ROOT}/${name}`);
}

upsertLabel(`${ROOT}/TitleLabel`, '방 설정', [0, 345], [330, 68], 44, WHITE, 4);
upsertLabel(`${ROOT}/RoomTitleLabel`, '방 제목', [-165, 218], [210, 42], 28, WHITE, 3);
b.sprite(`${ROOT}/PrivateCheckboxSprite`, {
  anchor: 'middle-center',
  pos: [-225, 112],
  rect_size: [72, 72],
  image_ruid: CHECK_ON,
  display_order: 300,
});
if (b.find(`${ROOT}/PrivateCheckboxSprite`)) {
  b.patchComponent(`${ROOT}/PrivateCheckboxSprite`, 'MOD.Core.SpriteGUIRendererComponent', {
    ImageRUID: { DataId: CHECK_ON },
  });
  patchSpriteTop(`${ROOT}/PrivateCheckboxSprite`, 1000);
}
upsertLabel(`${ROOT}/PrivateLabel`, '비공개 방', [-60, 112], [250, 42], 28, WHITE, 3);
upsertLabel(`${ROOT}/PasswordLabel`, '비밀번호', [-160, 38], [220, 42], 28, WHITE, 3);
upsertLabel(`${ROOT}/PlayerCountLabel`, '인원', [-155, -62], [165, 42], 28, WHITE, 3);
upsertLabel(`${ROOT}/MafiaCountLabel`, '마피아 인원', [-140, -165], [270, 42], 28, WHITE, 3);

b.write(file);
console.log('[polish_room_settings_modal_layout] polished RoomSettings modal layout');
