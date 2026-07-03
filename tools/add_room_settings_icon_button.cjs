const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);
const path = '/ui/MafiaLobbyHUD/CenterPanel/RoomSettingsIcon';

if (!b.hasComponent(path, 'MOD.Core.ButtonComponent')) {
  b.addComponent(path, 'MOD.Core.ButtonComponent', UIBuilder._buttonComponent({}));
}

// The icon needs to receive raycasts/clicks.
b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
  RaycastTarget: true,
});

b.write(file);
console.log('[add_room_settings_icon_button] RoomSettingsIcon is clickable');
