const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const CHAT_SCROLL_TRACK_RUID = 'ada6747106934c9e8d98e2e100401400';
const CHAT_SCROLL_THUMB_RUID = 'b18a59d4fffc4ecb899fddc77fcea34c';
const CHAT_SCROLL_UP_RUID = 'b2e79f3abf6d4239898ec23fcbfb3f98';
const CHAT_SCROLL_DOWN_RUID = 'd7647c65e8334272922bb6f046f5a861';

function patchTransform(path, pos, size, enable = true) {
  if (!b.find(path)) {
    console.warn(`[tune_lobby_interaction_ui] missing ${path}`);
    return;
  }
  b.patch(path, { enable, visible: true });
  b.patchComponent(path, 'MOD.Core.UITransformComponent', {
    anchoredPosition: { x: pos[0], y: pos[1] },
    RectSize: { x: size[0], y: size[1] },
  });
}

function patchSprite(path, ruid, order, raycast = false) {
  if (!b.find(path)) return;
  if (b.hasComponent(path, 'MOD.Core.SpriteGUIRendererComponent')) {
    b.patchComponent(path, 'MOD.Core.SpriteGUIRendererComponent', {
      ImageRUID: { DataId: ruid },
      Color: { r: 1, g: 1, b: 1, a: 1 },
      RaycastTarget: raycast,
      OverrideSorting: true,
      SortingLayer: 'UI',
      OrderInLayer: order,
    });
  }
  if (b.hasComponent(path, 'MOD.Core.ButtonComponent')) {
    b.patchComponent(path, 'MOD.Core.ButtonComponent', {
      OverrideSorting: true,
      SortingLayer: 'UI',
      OrderInLayer: order + 1,
    });
  }
}

// Lobby chat scrollbar arrow buttons: move slightly toward the chat panel.
patchTransform('/ui/MafiaLobbyHUD/UISprite_2', [322.08, 220], [36.87, 36.87], true);
patchTransform('/ui/MafiaLobbyHUD/UISprite_3', [323.08, -204], [36.87, 36.87], true);
patchSprite('/ui/MafiaLobbyHUD/UISprite_2', CHAT_SCROLL_UP_RUID, 771, false);
patchSprite('/ui/MafiaLobbyHUD/UISprite_3', CHAT_SCROLL_DOWN_RUID, 772, false);

// Invite popup scrollbar: reuse the same visual language as the lobby chat scrollbar.
patchTransform('/ui/MafiaLobbyHUD/Invite/_2/_2_5', [253, -4], [82, 392], true);
patchSprite('/ui/MafiaLobbyHUD/Invite/_2/_2_5', CHAT_SCROLL_TRACK_RUID, 860, false);

patchTransform('/ui/MafiaLobbyHUD/Invite/_2/_2_6', [253, 182], [38, 38], true);
patchSprite('/ui/MafiaLobbyHUD/Invite/_2/_2_6', CHAT_SCROLL_UP_RUID, 880, true);

patchTransform('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollDown', [253, -190], [38, 38], true);
patchSprite('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollDown', CHAT_SCROLL_DOWN_RUID, 881, true);

if (!b.find('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollThumb')) {
  b.sprite('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollThumb', {
    anchor: 'middle-center',
    pos: [253, 84],
    rect_size: [72, 78],
    image_ruid: CHAT_SCROLL_THUMB_RUID,
    display_order: 882,
  });
}
patchTransform('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollThumb', [253, 84], [72, 78], false);
patchSprite('/ui/MafiaLobbyHUD/Invite/_2/InviteScrollThumb', CHAT_SCROLL_THUMB_RUID, 882, false);

b.write(file);
console.log('[tune_lobby_interaction_ui] lobby arrows and invite scrollbar tuned');
