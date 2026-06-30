const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const UI_PATH = "ui/MafiaPlayHUD.ui";
const SPRITE = "MOD.Core.SpriteGUIRendererComponent";

const RUID = {
  backdrop: "841120993e0c41e19e4e5a2f65297eb7",
  centerFrame: "61e2ebc5ae81493cb4dc028c3d9fae31",
  smallPanel: "9b33fc4abb8249b898f7c975916002bb",
  phaseChatCard: "0225e110ff5a4194975a35275e965dbc",
  bronzeButton: "9b33fc4abb8249b898f7c975916002bb",
};

const ui = UIBuilder.load(UI_PATH);

const ROOM_WIDTH = 720;
const ROOM_HEIGHT = 270;
const CENTER_WIDTH = 480;
const ROOM_Y = [405, 135, -135, -405];

// A dark sewer-room image covers the world view behind the HUD. It is only
// visible through transparent pixels and therefore ties every column together.
ui.sprite("Backdrop", {
  anchor: "stretch",
  pos: [0, 0],
  rect_size: [1920, 1080],
  image_ruid: RUID.backdrop,
  raycast: false,
});
ui.patchComponent("Backdrop", SPRITE, {
  Color: { r: 0.2, g: 0.17, b: 0.13, a: 1 },
  PreserveAspect: false,
});

// Four 270px rooms exactly fill the 1080px PC viewport on each side.
for (let i = 1; i <= 8; i += 1) {
  const isLeft = i <= 4;
  const row = isLeft ? i - 1 : i - 5;
  const room = `RoomBadge${i}`;
  ui.patch(room, {
    anchor: isLeft ? "middle-left" : "middle-right",
    pos: [0, ROOM_Y[row]],
    rect_size: [ROOM_WIDTH, ROOM_HEIGHT],
  });
  for (const child of ["Bg", "DungeonBg"]) {
    ui.patch(`${room}/${child}`, {
      anchor: "stretch",
      pos: [0, 0],
      rect_size: [ROOM_WIDTH, ROOM_HEIGHT],
    });
  }
}

// The uploaded central frame is natively 480x1080, so using its source size
// preserves detail and matches the narrow functional column in the reference.
ui.patch("CenterPanel", {
  anchor: "middle-center",
  pos: [0, 0],
  rect_size: [CENTER_WIDTH, 1080],
});
ui.patch("CenterPanel/Bg", {
  anchor: "stretch",
  pos: [0, 0],
  rect_size: [CENTER_WIDTH, 1080],
});

// Sketch layout: room information -> time -> chat -> skip.
ui.sprite("CenterPanel/RoomInfoPlate", {
  anchor: "top-center",
  pos: [0, -33],
  rect_size: [440, 135],
  image_ruid: RUID.smallPanel,
  raycast: false,
});
ui.sprite("CenterPanel/TimePlate", {
  anchor: "top-center",
  pos: [0, -195],
  rect_size: [440, 122],
  image_ruid: RUID.smallPanel,
  raycast: false,
});

// The uploaded frame becomes the central column's base instead of a generic panel.
ui.upsertComponent(
  "CenterPanel/Bg",
  SPRITE,
  UIBuilder._spriteRenderer(null, 1, false, 0, 0, RUID.centerFrame, {
    preserve_aspect: false,
  }),
);

// Uploaded decorative panels are layered behind the existing functional text/widgets.
ui.sprite("CenterPanel/PhaseChatPlate", {
  anchor: "top-center",
  pos: [0, -342],
  rect_size: [440, 570],
  image_ruid: RUID.phaseChatCard,
  raycast: false,
});

// These two uploaded plates have transparent padding that the current MSW importer
// renders as white. Remove them and let the opaque frame/card carry the layout.
for (const path of ["CenterPanel/RoomHeaderPlate", "CenterPanel/VotePlate"]) {
  if (ui.find(path)) ui.remove(path);
}

// The chat composer sits directly below the chat log, matching the reference layout.
ui.patch("CenterPanel/ChatInput", {
  anchor: "middle-center",
  pos: [-50, -330],
  rect_size: [310, 54],
});
ui.patch("CenterPanel/ChatSendButton", {
  anchor: "middle-center",
  pos: [158, -330],
  rect_size: [86, 54],
});

// Keep controls interactive, while using the user's bronze button art.
for (const buttonPath of ["CenterPanel/SkipButton", "CenterPanel/ChatSendButton"]) {
  ui.patchComponent(buttonPath, SPRITE, {
    ImageRUID: { DataId: RUID.bronzeButton },
    Type: 0,
    PreserveAspect: false,
  });
}

ui.patchComponent("CenterPanel/ChatInput", SPRITE, {
  ImageRUID: { DataId: RUID.bronzeButton },
  Type: 0,
  PreserveAspect: false,
});
ui.patchComponent("CenterPanel/ChatInput", "MOD.Core.TextComponent", {
  FontColor: { r: 0.94, g: 0.88, b: 0.72, a: 1 },
});
ui.patchComponent("CenterPanel/ChatInput", "MOD.Core.TextInputComponent", {
  PlaceHolderColor: { r: 0.82, g: 0.76, b: 0.64, a: 0.75 },
});

// Explicit sibling order: artwork first, then every interactive/text element.
ui.patch("CenterPanel/Bg", { display_order: 0 });
ui.patch("CenterPanel/RoomInfoPlate", { display_order: 1 });
ui.patch("CenterPanel/TimePlate", { display_order: 2 });
ui.patch("CenterPanel/PhaseChatPlate", { display_order: 3 });
ui.patch("Backdrop", { display_order: 0 });
ui.patch("CenterPanel", { display_order: 20 });
for (let i = 1; i <= 8; i += 1) {
  ui.patch(`RoomBadge${i}`, { display_order: 10 + i });
}

for (const textPath of [
  "RoomInfoText",
  "PlayerCountText",
  "PhaseTitleText",
  "PhaseDescriptionText",
  "ChatLogText",
  "VoteStatusText",
  "VoteHintText",
]) {
  ui.patch(`CenterPanel/${textPath}`, {
    rect_size: [440, ui.getComponent(`CenterPanel/${textPath}`, "MOD.Core.UITransformComponent").RectSize.y],
  });
}
ui.patch("CenterPanel/DayText", { rect_size: [160, 44] });
ui.patch("CenterPanel/TimerText", { rect_size: [150, 44] });
ui.patch("CenterPanel/RoomInfoText", {
  anchor: "top-center", pos: [0, -58], rect_size: [400, 48],
});
ui.patch("CenterPanel/PlayerCountText", {
  anchor: "top-center", pos: [0, -112], rect_size: [400, 38],
});
ui.patch("CenterPanel/DayText", {
  anchor: "top-left", pos: [32, -236], rect_size: [160, 44],
});
ui.patch("CenterPanel/TimerText", {
  anchor: "top-right", pos: [-32, -236], rect_size: [150, 44],
});
ui.patch("CenterPanel/PhaseTitleText", {
  anchor: "top-center", pos: [0, -370], rect_size: [400, 52],
});
ui.patch("CenterPanel/PhaseDescriptionText", {
  anchor: "top-center", pos: [0, -426], rect_size: [400, 38],
});
ui.patch("CenterPanel/ChatLogText", {
  anchor: "middle-center", pos: [0, -65], rect_size: [400, 280],
});
ui.patch("CenterPanel/VoteStatusText", {
  anchor: "middle-center", pos: [0, -228], rect_size: [400, 44],
});
ui.patch("CenterPanel/VoteHintText", {
  anchor: "middle-center", pos: [0, -278], rect_size: [400, 34],
});
ui.patch("CenterPanel/SkipButton", {
  anchor: "bottom-center", pos: [0, 39], rect_size: [440, 95],
});

const foreground = [
  "RoomInfoText",
  "PlayerCountText",
  "DayText",
  "TimerText",
  "PhaseTitleText",
  "PhaseDescriptionText",
  "ChatLogText",
  "VoteStatusText",
  "VoteHintText",
  "ChatInput",
  "ChatSendButton",
  "SkipButton",
];
foreground.forEach((name, index) => {
  ui.patch(`CenterPanel/${name}`, { display_order: 10 + index });
});

ui.write(UI_PATH, { lint: true, strict: true });
