const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

for (const path of [
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea',
]) {
  if (b.find(path)) b.remove(path);
}

function patchTransform(path, pos, size, enable = true) {
  if (!b.find(path)) {
    console.warn(`[restore_lobby_scrollbar] missing ${path}`);
    return;
  }
  b.patch(path, { enable, visible: true });
  b.patchComponent(path, 'MOD.Core.UITransformComponent', {
    anchoredPosition: { x: pos[0], y: pos[1] },
    RectSize: { x: size[0], y: size[1] },
  });
}

function patchSprite(path, order) {
  if (!b.find(path)) return;
  if (b.hasComponent(path, 'MOD.Core.SpriteGUIRendererComponent')) {
    b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
      Color: { r: 1, g: 1, b: 1, a: 1 },
      RaycastTarget: false,
      OverrideSorting: true,
      SortingLayer: 'UI',
      OrderInLayer: order,
    });
  }
}

// Tuned baked lobby scrollbar visual pieces.
patchTransform('/ui/MafiaLobbyHUD/CenterPanel/UISprite', [317.9702, 11], [115.631165, 468], true);
patchTransform('/ui/MafiaLobbyHUD/CenterPanel/UISprite_1', [317.71, -157], [132.46, 100], false);
patchTransform('/ui/MafiaLobbyHUD/UISprite_2', [322.08, 220], [36.87, 36.87], true);
patchTransform('/ui/MafiaLobbyHUD/UISprite_3', [323.08, -204], [36.87, 36.87], true);

patchSprite('/ui/MafiaLobbyHUD/CenterPanel/UISprite', 760);
patchSprite('/ui/MafiaLobbyHUD/CenterPanel/UISprite_1', 770);
patchSprite('/ui/MafiaLobbyHUD/UISprite_2', 771);
patchSprite('/ui/MafiaLobbyHUD/UISprite_3', 772);

b.write(file);
console.log('[restore_lobby_scrollbar] UISprite scrollbar pieces restored');
