const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const SOURCE_FILE = 'ui/MafiaLobbyHUD.ui';
const TARGETS = [
  { file: 'ui/MafiaDayHUD.ui', root: '/ui/MafiaDayHUD' },
  { file: 'ui/MafiaNightHUD.ui', root: '/ui/MafiaNightHUD' },
];

const UI_TRANSFORM = 'MOD.Core.UITransformComponent';
const SPRITE = 'MOD.Core.SpriteGUIRendererComponent';
const TEXT = 'MOD.Core.TextComponent';
const BUTTON = 'MOD.Core.ButtonComponent';
const TOUCH = 'MOD.Core.UITouchReceiveComponent';

const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };
const OTHER_TEXT = { r: 0.92, g: 0.88, b: 0.78, a: 1 };
const OWN_TEXT = { r: 1.0, g: 0.84, b: 0.42, a: 1 };
const NAME_TEXT = { r: 0.92, g: 0.74, b: 0.42, a: 1 };

const SLOT_COUNT = 8;
const CLEANUP_SLOT_COUNT = 10;
const TOP_Y = 188;
const GAP_Y = 48;
const NAME_OFFSET_Y = 23;
const LEFT_X = -176;
const BOX_W = 284;
const BOX_H = 46;
const NAME_H = 20;

const source = UIBuilder.read(SOURCE_FILE);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getSourceSprite(relPath) {
  const path = `/ui/MafiaLobbyHUD${relPath}`;
  const tr = source.getComponent(path, UI_TRANSFORM);
  const sp = source.getComponent(path, SPRITE);
  if (!tr || !sp) {
    throw new Error(`Missing source sprite data: ${path}`);
  }
  return {
    pos: [tr.anchoredPosition.x, tr.anchoredPosition.y],
    size: [tr.RectSize.x, tr.RectSize.y],
    pivot: clone(tr.Pivot),
    imageRuid: clone(sp.ImageRUID),
    color: clone(sp.Color),
    type: sp.Type,
    order: sp.OrderInLayer,
    raycastTarget: sp.RaycastTarget,
  };
}

const sourceScrollTrack = getSourceSprite('/CenterPanel/UISprite');
const sourceScrollThumb = getSourceSprite('/CenterPanel/UISprite_1');
const sourceScrollUp = getSourceSprite('/UISprite_2');
const sourceScrollDown = getSourceSprite('/UISprite_3');

function setTextStyle(builder, path, style) {
  builder.patchComponent(path, TEXT, {
    Text: style.text ?? '',
    Font: 1,
    FontSize: style.fontSize,
    FontColor: style.color,
    Bold: style.bold ?? true,
    Alignment: style.alignment,
    Overflow: style.overflow,
    UseConstraintX: style.useConstraintX ?? false,
    ConstraintX: style.constraintX ?? 0,
    UseConstraintY: style.useConstraintY ?? false,
    ConstraintY: style.constraintY ?? 0,
    LineSpacing: style.lineSpacing ?? 1,
    Padding: style.padding ?? { left: 0, right: 0, top: 0, bottom: 0 },
    DropShadow: true,
    DropShadowColor: { r: 0, g: 0, b: 0, a: 0.9 },
    DropShadowDistance: 1.5,
    DropShadowAngle: 315,
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: style.order,
  });
}

function upsertImageEntity(builder, path, data, options) {
  builder.button(path, '', {
    anchor: 'middle-center',
    pos: data.pos,
    rect_size: data.size,
    enable: options.enable ?? true,
    font_size: 1,
    color: TRANSPARENT,
    display_order: options.order ?? data.order ?? 770,
  });
  builder.patchComponent(path, SPRITE, {
    ImageRUID: clone(data.imageRuid),
    Type: data.type ?? 0,
    Color: clone(data.color) ?? { r: 1, g: 1, b: 1, a: 1 },
    RaycastTarget: options.raycastTarget ?? true,
    OverrideSorting: true,
    SortingLayer: 'UI',
    OrderInLayer: options.order ?? data.order ?? 770,
  });
  setTextStyle(builder, path, {
    fontSize: 1,
    color: TRANSPARENT,
    alignment: 4,
    overflow: 0,
    bold: false,
    order: (options.order ?? data.order ?? 770) + 1,
  });
  if (!options.keepButton && builder.hasComponent(path, BUTTON)) {
    builder.removeComponent(path, BUTTON);
  }
  if (options.touchReceive) {
    builder.upsertComponent(path, TOUCH, {
      '@type': TOUCH,
      Enable: true,
    });
  } else if (builder.hasComponent(path, TOUCH)) {
    builder.removeComponent(path, TOUCH);
  }
}

function applySlots(builder, root) {
  for (const legacy of [`${root}/text`, `${root}/text1`]) {
    if (builder.find(legacy)) builder.patch(legacy, { enable: false, visible: false });
  }

  for (let i = 1; i <= CLEANUP_SLOT_COUNT; i += 1) {
    for (const prefix of ['', '/CenterPanel']) {
      for (const name of ['LobbyChatSlot', 'LobbyChatNameSlot', 'LobbyChatFrameSlot']) {
        const path = `${root}${prefix}/${name}${i}`;
        if (builder.find(path)) builder.remove(path);
      }
    }
  }

  for (let i = 1; i <= SLOT_COUNT; i += 1) {
    const y = TOP_Y - (i - 1) * GAP_Y;
    const name = `${root}/CenterPanel/LobbyChatNameSlot${i}`;
    const slot = `${root}/CenterPanel/LobbyChatSlot${i}`;

    builder.text(name, '', {
      anchor: 'middle-center',
      pos: [LEFT_X, y + NAME_OFFSET_Y],
      rect_size: [BOX_W, NAME_H],
      enable: false,
      font_size: 19,
      color: NAME_TEXT,
      display_order: 700 + i * 3,
    });
    setTextStyle(builder, name, {
      fontSize: 19,
      color: NAME_TEXT,
      alignment: 3,
      overflow: 2,
      order: 720 + i * 3,
    });

    builder.button(slot, '', {
      anchor: 'middle-center',
      pos: [LEFT_X, y],
      rect_size: [BOX_W, BOX_H],
      enable: false,
      font_size: 25,
      color: OTHER_TEXT,
      display_order: 702 + i * 4,
    });
    builder.patchComponent(slot, SPRITE, {
      Type: 1,
      Color: TRANSPARENT,
      RaycastTarget: false,
      OverrideSorting: true,
      SortingLayer: 'UI',
      OrderInLayer: 723 + i * 4,
    });
    setTextStyle(builder, slot, {
      fontSize: 25,
      color: OTHER_TEXT,
      alignment: 3,
      overflow: 0,
      useConstraintX: true,
      constraintX: BOX_W - 36,
      useConstraintY: true,
      constraintY: BOX_H,
      lineSpacing: 0.78,
      padding: { left: 18, right: 18, top: 0, bottom: 0 },
      order: 724 + i * 4,
    });
    if (builder.hasComponent(slot, BUTTON)) {
      builder.patchComponent(slot, BUTTON, { Interactable: false });
    }
  }
}

function applyScrollbar(builder, root) {
  upsertImageEntity(builder, `${root}/CenterPanel/UISprite`, sourceScrollTrack, {
    order: sourceScrollTrack.order ?? 760,
    keepButton: false,
    touchReceive: true,
    raycastTarget: true,
    enable: true,
  });
  upsertImageEntity(builder, `${root}/CenterPanel/UISprite_1`, sourceScrollThumb, {
    order: sourceScrollThumb.order ?? 770,
    keepButton: false,
    touchReceive: true,
    raycastTarget: true,
    enable: false,
  });
  upsertImageEntity(builder, `${root}/UISprite_2`, sourceScrollUp, {
    order: sourceScrollUp.order ?? 772,
    keepButton: true,
    touchReceive: false,
    raycastTarget: true,
    enable: true,
  });
  upsertImageEntity(builder, `${root}/UISprite_3`, sourceScrollDown, {
    order: sourceScrollDown.order ?? 772,
    keepButton: true,
    touchReceive: false,
    raycastTarget: true,
    enable: true,
  });

  const rawLog = `${root}/CenterPanel/ChatScroll/ChatLogText`;
  if (builder.find(rawLog)) builder.patch(rawLog, { enable: false, visible: false });
}

for (const target of TARGETS) {
  const builder = UIBuilder.read(target.file);
  applySlots(builder, target.root);
  applyScrollbar(builder, target.root);
  builder.write(target.file, { lint: false });
  console.log(`[apply_lobby_chat_to_phase_huds] applied lobby chat UI to ${target.root}`);
}
