const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const ROOT = '/ui/MafiaLobbyHUD/RoomSettings';
const NORMAL = '55e6a19fb39c4b37be46ca384b7425a0';
const SELECTED = 'bb32d1d9b7804884a9d42178fc8ed6e6';
const TRANSPARENT = '00000000000000000000000000000000';
const WHITE = { r: 1, g: 1, b: 1, a: 1 };
const GOLD = { r: 1, g: 0.78, b: 0.22, a: 1 };

function removeIfExists(path) {
  if (b.find(path)) b.remove(path);
}

function addButton(path, pos, size, label, fontSize = 34) {
  removeIfExists(path);
  b.button(path, label, {
    anchor: 'middle-center',
    pos,
    rect_size: size,
    image_ruid: TRANSPARENT,
    color: WHITE,
    font_size: fontSize,
    display_order: 40,
  });
  b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
    Color: { r: 1, g: 1, b: 1, a: 0.01 },
  });
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: fontSize,
    Bold: true,
    FontColor: WHITE,
    Alignment: 4,
  });
}

function addInput(path, pos, size, placeholder, limit, contentType = 0) {
  removeIfExists(path);
  b.textInput(path, {
    anchor: 'middle-center',
    pos,
    rect_size: size,
    image_ruid: TRANSPARENT,
    text: '',
    placeholder,
    char_limit: limit,
    content_type: contentType,
    line_type: 0,
    font_size: 28,
    color: WHITE,
    display_order: 35,
  });
  b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
    Color: { r: 1, g: 1, b: 1, a: 0.01 },
  });
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: 28,
    Bold: true,
    FontColor: WHITE,
    Alignment: 3,
  });
}

// Modal should be hidden until RoomSettingsIcon is clicked.
b.patch(ROOT, {
  enable: false,
  visible: true,
  display_order: 80,
  pos: [0, -10],
  rect_size: [760, 875],
});

// Existing visual number buttons: normalize to default states.
for (const [path, ruid] of [
  [`${ROOT}/_8`, SELECTED],
  [`${ROOT}/_9`, NORMAL],
  [`${ROOT}/_10`, NORMAL],
  [`${ROOT}/_11`, NORMAL],
  [`${ROOT}/_12`, SELECTED],
  [`${ROOT}/_13`, NORMAL],
]) {
  if (b.find(path)) {
    b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
      ImageRUID: { DataId: ruid },
    });
  }
}

addInput(`${ROOT}/RoomTitleInput`, [-6, 205], [470, 58], '방 제목을 입력하세요', 20);
addButton(`${ROOT}/PrivateToggleButton`, [-160, 115], [300, 74], '', 1);
addInput(`${ROOT}/PasswordInput`, [78, 38], [350, 58], '비밀번호', 16, 3);

addButton(`${ROOT}/Player6Button`, [-50, -64], [96, 96], '6', 40);
addButton(`${ROOT}/Player7Button`, [79, -64], [96, 96], '7', 40);
addButton(`${ROOT}/Player8Button`, [208, -64], [96, 96], '8', 40);
addButton(`${ROOT}/Mafia1Button`, [-50, -166], [96, 96], '1', 40);
addButton(`${ROOT}/Mafia2Button`, [79, -166], [96, 96], '2', 40);
addButton(`${ROOT}/Mafia3Button`, [208, -166], [96, 96], '3', 40);

addButton(`${ROOT}/CloseButton`, [321, 320], [95, 95], 'X', 42);
addButton(`${ROOT}/CancelButton`, [-154, -261], [197, 112], '취소', 38);
addButton(`${ROOT}/ConfirmButton`, [164, -261], [197, 112], '확인', 38);

// Add text overlays for selected/unselected numeric distinction.
for (const [path, isSelected] of [
  [`${ROOT}/Player6Button`, false],
  [`${ROOT}/Player7Button`, false],
  [`${ROOT}/Player8Button`, true],
  [`${ROOT}/Mafia1Button`, false],
  [`${ROOT}/Mafia2Button`, true],
  [`${ROOT}/Mafia3Button`, false],
]) {
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    FontColor: isSelected ? GOLD : WHITE,
    FontSize: 40,
  });
}

b.write(file);
console.log('[setup_room_settings_modal_ui] RoomSettings modal UI controls added');
