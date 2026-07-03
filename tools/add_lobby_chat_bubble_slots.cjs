const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const OTHER_TEXT = { r: 0.92, g: 0.88, b: 0.78, a: 1 };
const OWN_TEXT = { r: 1.0, g: 0.84, b: 0.42, a: 1 };
const NAME_TEXT = { r: 0.92, g: 0.74, b: 0.42, a: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };
const SCROLL_COVER = { r: 0.025, g: 0.020, b: 0.015, a: 0.98 };
const SCROLL_BAR_RUID = '443a5331b67a4019a8e501ce4a77b0fc';
const SCROLL_THUMB_RUID = '47ea344e991a4ce58405289d9d6ca261';

const CLEANUP_SLOT_COUNT = 10;
const SLOT_COUNT = 8;
const TOP_Y = 188;
const GAP_Y = 48;
const NAME_OFFSET_Y = 23;
const LEFT_X = -176;
const BOX_W = 284;
const BOX_H = 46;
const NAME_H = 20;
const SCROLL_X = 316;
const SCROLL_CENTER_Y = 24;
const SCROLL_COVER_W = 34;
const SCROLL_H = 342;
const SCROLL_TRACK_W = 22;
const SCROLL_TRACK_H = 326;
const SCROLL_THUMB_W = 22;
const SCROLL_THUMB_H = 90;
const SCROLL_HIT_W = 70;

for (const legacy of ['/ui/MafiaLobbyHUD/text', '/ui/MafiaLobbyHUD/text1']) {
  if (b.find(legacy)) b.patch(legacy, { enable: false, visible: false });
}

for (const oldScroll of [
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollRail',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTopCap',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollBottomCap',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumbGlow',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumbCore',
  '/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea',
]) {
  if (b.find(oldScroll)) b.remove(oldScroll);
}

for (let i = 1; i <= CLEANUP_SLOT_COUNT; i += 1) {
  const legacyRoot = `/ui/MafiaLobbyHUD/LobbyChatSlot${i}`;
  const legacyName = `/ui/MafiaLobbyHUD/LobbyChatNameSlot${i}`;
  const legacyFrame = `/ui/MafiaLobbyHUD/LobbyChatFrameSlot${i}`;
  const root = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatSlot${i}`;
  const name = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatNameSlot${i}`;
  const frame = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatFrameSlot${i}`;
  if (b.find(legacyRoot)) b.remove(legacyRoot);
  if (b.find(legacyName)) b.remove(legacyName);
  if (b.find(legacyFrame)) b.remove(legacyFrame);
  if (b.find(root)) b.remove(root);
  if (b.find(name)) b.remove(name);
  if (b.find(frame)) b.remove(frame);
}

for (let i = 1; i <= SLOT_COUNT; i += 1) {
  const legacyRoot = `/ui/MafiaLobbyHUD/LobbyChatSlot${i}`;
  const legacyName = `/ui/MafiaLobbyHUD/LobbyChatNameSlot${i}`;
  const legacyFrame = `/ui/MafiaLobbyHUD/LobbyChatFrameSlot${i}`;
  const root = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatSlot${i}`;
  const name = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatNameSlot${i}`;
  const frame = `/ui/MafiaLobbyHUD/CenterPanel/LobbyChatFrameSlot${i}`;
  if (b.find(legacyRoot)) b.remove(legacyRoot);
  if (b.find(legacyName)) b.remove(legacyName);
  if (b.find(legacyFrame)) b.remove(legacyFrame);
  if (b.find(root)) b.remove(root);
  if (b.find(name)) b.remove(name);
  if (b.find(frame)) b.remove(frame);

  const y = TOP_Y - (i - 1) * GAP_Y;
  b.text(name, '', {
    anchor: 'middle-center',
    pos: [LEFT_X, y + NAME_OFFSET_Y],
    rect_size: [BOX_W, NAME_H],
    enable: false,
    font_size: 19,
    color: NAME_TEXT,
    display_order: 700 + i * 3,
  });
  b.patchComponent(name, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: 19,
    FontColor: NAME_TEXT,
    Bold: true,
    Alignment: 3,
    Overflow: 2,
    DropShadow: true,
    DropShadowColor: { r: 0, g: 0, b: 0, a: 0.9 },
    DropShadowDistance: 1.5,
    DropShadowAngle: 315,
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: 720 + i * 3,
  });

  b.button(root, '', {
    anchor: 'middle-center',
    pos: [LEFT_X, y],
    rect_size: [BOX_W, BOX_H],
    enable: false,
    font_size: 25,
    color: OTHER_TEXT,
    display_order: 702 + i * 4,
  });
  b.patchComponent(root, 'MOD.Core.SpriteGUIRendererComponent', {
    Type: 1,
    Color: TRANSPARENT,
    RaycastTarget: false,
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: 723 + i * 4,
  });
  b.patchComponent(root, 'MOD.Core.TextComponent', {
    Font: 1,
    FontSize: 25,
    FontColor: OTHER_TEXT,
    Bold: true,
    Alignment: 3,
    Overflow: 0,
    UseConstraintX: true,
    ConstraintX: BOX_W - 36,
    UseConstraintY: true,
    ConstraintY: BOX_H,
    LineSpacing: 0.78,
    Padding: { left: 18, right: 18, top: 0, bottom: 0 },
    DropShadow: true,
    DropShadowColor: { r: 0, g: 0, b: 0, a: 0.9 },
    DropShadowDistance: 1.5,
    DropShadowAngle: 315,
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: 724 + i * 4,
  });
  if (b.hasComponent(root, 'MOD.Core.ButtonComponent')) {
    b.patchComponent(root, 'MOD.Core.ButtonComponent', {
      Interactable: false,
    });
  }
}

b.button('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover', '', {
  anchor: 'middle-center',
  pos: [SCROLL_X, SCROLL_CENTER_Y],
  rect_size: [SCROLL_COVER_W, SCROLL_H],
  enable: true,
  font_size: 1,
  color: TRANSPARENT,
  display_order: 760,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover', 'MOD.Core.SpriteGUIRendererComponent', {
  Type: 1,
  Color: SCROLL_COVER,
  RaycastTarget: false,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 760,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover', 'MOD.Core.TextComponent', {
  Text: '',
  FontSize: 1,
  FontColor: TRANSPARENT,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 761,
});
if (b.hasComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover', 'MOD.Core.ButtonComponent')) {
  b.removeComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollCover', 'MOD.Core.ButtonComponent');
}

b.button('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', '', {
  anchor: 'middle-center',
  pos: [SCROLL_X, SCROLL_CENTER_Y],
  rect_size: [SCROLL_TRACK_W, SCROLL_TRACK_H],
  enable: false,
  font_size: 1,
  color: TRANSPARENT,
  display_order: 762,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', 'MOD.Core.SpriteGUIRendererComponent', {
  ImageRUID: { DataId: SCROLL_BAR_RUID },
  Type: 0,
  Color: { r: 1, g: 1, b: 1, a: 1 },
  RaycastTarget: true,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 762,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', 'MOD.Core.TextComponent', {
  Text: '',
  FontSize: 1,
  FontColor: TRANSPARENT,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 763,
});
if (b.hasComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', 'MOD.Core.ButtonComponent')) {
  b.removeComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', 'MOD.Core.ButtonComponent');
}
b.upsertComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollTrack', 'MOD.Core.UITouchReceiveComponent', {
  '@type': 'MOD.Core.UITouchReceiveComponent',
  Enable: true,
});

b.button('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', '', {
  anchor: 'middle-center',
  pos: [SCROLL_X, -104],
  rect_size: [SCROLL_THUMB_W, SCROLL_THUMB_H],
  enable: false,
  font_size: 1,
  color: TRANSPARENT,
  display_order: 770,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', 'MOD.Core.SpriteGUIRendererComponent', {
  ImageRUID: { DataId: SCROLL_THUMB_RUID },
  Type: 0,
  Color: { r: 1, g: 1, b: 1, a: 1 },
  RaycastTarget: true,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 770,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', 'MOD.Core.TextComponent', {
  Text: '',
  FontSize: 1,
  FontColor: TRANSPARENT,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 771,
});
if (b.hasComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', 'MOD.Core.ButtonComponent')) {
  b.removeComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', 'MOD.Core.ButtonComponent');
}
b.upsertComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollThumb', 'MOD.Core.UITouchReceiveComponent', {
  '@type': 'MOD.Core.UITouchReceiveComponent',
  Enable: true,
});

b.button('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', '', {
  anchor: 'middle-center',
  pos: [SCROLL_X, SCROLL_CENTER_Y],
  rect_size: [SCROLL_HIT_W, SCROLL_H],
  enable: false,
  font_size: 1,
  color: TRANSPARENT,
  display_order: 780,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', 'MOD.Core.SpriteGUIRendererComponent', {
  Type: 1,
  Color: TRANSPARENT,
  RaycastTarget: true,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 780,
});
b.patchComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', 'MOD.Core.TextComponent', {
  Text: '',
  FontSize: 1,
  FontColor: TRANSPARENT,
  OverrideSorting: true,
  SortingLayer: 'UI',
  OrderInLayer: 781,
});
if (b.hasComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', 'MOD.Core.ButtonComponent')) {
  b.removeComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', 'MOD.Core.ButtonComponent');
}
b.upsertComponent('/ui/MafiaLobbyHUD/CenterPanel/LobbyChatScrollHitArea', 'MOD.Core.UITouchReceiveComponent', {
  '@type': 'MOD.Core.UITouchReceiveComponent',
  Enable: true,
});

b.write(file);
console.log(`[add_lobby_chat_bubble_slots] added ${SLOT_COUNT} lane-based lobby chat slots`);
