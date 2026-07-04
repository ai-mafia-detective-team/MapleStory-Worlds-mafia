const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

function patchSpriteRaycast(path, raycast) {
  if (!b.find(path)) return;
  if (!b.hasComponent(path, 'MOD.Core.SpriteGUIRendererComponent')) return;
  b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
    RaycastTarget: raycast,
  });
}

function patchTextInput(path) {
  if (!b.find(path)) {
    console.warn(`[tune_room_password_input_ui] missing ${path}`);
    return;
  }

  b.patch(path, { enable: true, visible: true });

  if (b.hasComponent(path, 'MOD.Core.TextInputComponent')) {
    b.patchComponent(path, 'MOD.Core.TextInputComponent', {
      Enable: true,
      CharacterLimit: 16,
      ContentType: 3,
      LineType: 0,
      PlaceHolder: '비밀번호',
      PlaceHolderColor: { r: 0.1953125, g: 0.1953125, b: 0.1953125, a: 0.5 },
    });
  }

  if (b.hasComponent(path, 'MOD.Core.SpriteGUIRendererComponent')) {
    b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
      RaycastTarget: true,
      Color: { r: 1, g: 1, b: 1, a: 0.01 },
    });
  }
}

// Decorative frames/lock icon around the password field should not steal input focus.
patchSpriteRaycast('/ui/MafiaLobbyHUD/RoomSettings/_6', false);
patchSpriteRaycast('/ui/MafiaLobbyHUD/RoomSettings/_6/_6_1', false);

patchTextInput('/ui/MafiaLobbyHUD/RoomSettings/PasswordInput');

b.write(file);
console.log('[tune_room_password_input_ui] password input raycast and default state tuned');
