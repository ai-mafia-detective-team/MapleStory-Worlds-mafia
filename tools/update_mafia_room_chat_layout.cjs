const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const UI_FILES = [
  "ui/MafiaPlayHUD.ui",
  "ui/MafiaLobbyHUD.ui",
  "ui/MafiaDayHUD.ui",
];

const SPRITE = "MOD.Core.SpriteGUIRendererComponent";
const ROOM_RUIDS = [
  "917a343177034f38baa4d6af9c6a7074",
  "ad56783e27444a5ea5e2557964d21862",
  "e8d0a46346d7473dafff23d85beb92f5",
  "feaf007aceab440abd39c97c6a96c6a6",
  "43a0d6b6026d4c8bbd776f6a41bb8cbe",
  "34e5c61bff454dbc9342bfa40047a0ce",
  "44eab70856da41b38b296baa646253bc",
  "7ed8cd85d9e048fbbd832b082dc794c7",
];

const ROOM_WIDTH = 560;
const ROOM_HEIGHT = 270;
const CENTER_WIDTH = 800;
const INNER_WIDTH = 740;
const TEXT_WIDTH = 700;
const ROOM_Y = [405, 135, -135, -405];

function patchHud(path) {
  const ui = UIBuilder.load(path);

  for (let i = 1; i <= 8; i += 1) {
    const room = `RoomBadge${i}`;
    const isLeft = i <= 4;
    const row = isLeft ? i - 1 : i - 5;

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

    // The visible room art lives on DungeonBg. Bg stays transparent.
    ui.patchComponent(`${room}/DungeonBg`, SPRITE, {
      ImageRUID: { DataId: ROOM_RUIDS[i - 1] },
      Type: 0,
      PreserveAspect: false,
    });
    ui.patchComponent(`${room}/Bg`, SPRITE, {
      ImageRUID: { DataId: "" },
    });

    ui.patch(`${room}/Text`, {
      rect_size: [ROOM_WIDTH - 40, 42],
    });
  }

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
  ui.patchComponent("CenterPanel/Bg", SPRITE, {
    PreserveAspect: false,
  });

  const plates = [
    ["RoomInfoPlate", INNER_WIDTH, 135],
    ["TimePlate", INNER_WIDTH, 122],
    ["PhaseChatPlate", INNER_WIDTH, 570],
  ];
  for (const [name, width, height] of plates) {
    if (ui.find(`CenterPanel/${name}`)) {
      ui.patch(`CenterPanel/${name}`, { rect_size: [width, height] });
      ui.patchComponent(`CenterPanel/${name}`, SPRITE, { PreserveAspect: false });
    }
  }

  const textWidths = [
    "RoomInfoText", "PlayerCountText", "PhaseTitleText",
    "PhaseDescriptionText", "ChatLogText", "VoteStatusText", "VoteHintText",
  ];
  for (const name of textWidths) {
    const transform = ui.getComponent(`CenterPanel/${name}`, "MOD.Core.UITransformComponent");
    ui.patch(`CenterPanel/${name}`, {
      rect_size: [TEXT_WIDTH, transform.RectSize.y],
    });
  }

  // Chat is the main play surface: widen both the log and the composer.
  ui.patch("CenterPanel/ChatLogText", {
    anchor: "middle-center",
    pos: [0, -55],
    rect_size: [TEXT_WIDTH, 330],
  });
  ui.patch("CenterPanel/ChatInput", {
    anchor: "middle-center",
    pos: [-55, -330],
    rect_size: [600, 54],
  });
  ui.patch("CenterPanel/ChatSendButton", {
    anchor: "middle-center",
    pos: [320, -330],
    rect_size: [100, 54],
  });
  ui.patch("CenterPanel/SkipButton", {
    anchor: "bottom-center",
    pos: [0, 39],
    rect_size: [INNER_WIDTH, 95],
  });

  ui.write(path, { lint: true, strict: true });
  console.log(`[MafiaUILayout] updated ${path}`);
}

for (const path of UI_FILES) patchHud(path);
