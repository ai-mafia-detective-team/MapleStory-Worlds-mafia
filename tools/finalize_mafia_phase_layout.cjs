const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SPRITE = "MOD.Core.SpriteGUIRendererComponent";
const CHAT_RUID = "fc017c293d2a4f65b985860452d860e5";
const READY_RUID = "ffb351d9365345a5a61181aae6ab1444";
const ROOM_INFO_RUID = "dbe17dcf76014cf7963de76be10ed6a8";
const SKIP_RUID = "0bb0e4a8090b488dadffcdda7fb5c79a";

function setEnabled(ui, path, enabled) {
  if (ui.find(path)) ui.patch(path, { enable: enabled });
}

function setImage(ui, path, ruid) {
  ui.patchComponent(path, SPRITE, {
    ImageRUID: { DataId: ruid },
    Type: 0,
    PreserveAspect: false,
  });
}

function layoutChat(ui) {
  setImage(ui, "CenterPanel/PhaseChatPlate", CHAT_RUID);
  ui.patch("CenterPanel/PhaseChatPlate", {
    anchor: "top-center", pos: [0, -180], rect_size: [740, 760],
  });
  ui.patch("CenterPanel/PhaseTitleText", {
    anchor: "top-center", pos: [0, -205], rect_size: [700, 52],
  });
  ui.patch("CenterPanel/PhaseDescriptionText", {
    anchor: "top-center", pos: [0, -255], rect_size: [700, 38],
  });
  ui.patch("CenterPanel/ChatLogText", {
    anchor: "middle-center", pos: [0, -25], rect_size: [700, 460],
  });
  ui.patch("CenterPanel/VoteStatusText", {
    anchor: "middle-center", pos: [0, -275], rect_size: [700, 40],
  });
  ui.patch("CenterPanel/VoteHintText", {
    anchor: "middle-center", pos: [0, -312], rect_size: [700, 30],
  });
  ui.patch("CenterPanel/ChatInput", {
    anchor: "middle-center", pos: [-55, -355], rect_size: [600, 54],
  });
  ui.patch("CenterPanel/ChatSendButton", {
    anchor: "middle-center", pos: [320, -355], rect_size: [100, 54],
  });
}

function layoutLobby() {
  const ui = UIBuilder.load("ui/MafiaLobbyHUD.ui");
  setImage(ui, "CenterPanel/RoomInfoPlate", ROOM_INFO_RUID);
  ui.patch("CenterPanel/RoomInfoPlate", {
    anchor: "top-center", pos: [0, -25], rect_size: [740, 135],
  });
  ui.patch("CenterPanel/RoomInfoText", {
    anchor: "top-center", pos: [0, -48], rect_size: [700, 48],
  });
  ui.patch("CenterPanel/PlayerCountText", {
    anchor: "top-center", pos: [0, -98], rect_size: [700, 38],
  });
  setEnabled(ui, "CenterPanel/TimePlate", false);
  setEnabled(ui, "CenterPanel/DayText", false);
  setEnabled(ui, "CenterPanel/TimerText", false);
  layoutChat(ui);

  setImage(ui, "CenterPanel/SkipButton", READY_RUID);
  ui.patch("CenterPanel/SkipButton", {
    anchor: "bottom-center", pos: [-190, 39], rect_size: [360, 95],
  });
  ui.patchComponent("CenterPanel/SkipButton", "MOD.Core.TextComponent", {
    Text: "준비",
  });

  if (!ui.find("CenterPanel/InviteButton")) {
    ui.button("CenterPanel/InviteButton", "초대", {
      anchor: "bottom-center",
      pos: [190, 39],
      rect_size: [360, 95],
      image_ruid: READY_RUID,
      font_size: 26,
      color: "#F2E1B8",
    });
  } else {
    ui.patch("CenterPanel/InviteButton", {
      anchor: "bottom-center", pos: [190, 39], rect_size: [360, 95],
    });
    setImage(ui, "CenterPanel/InviteButton", READY_RUID);
  }
  ui.patch("CenterPanel/SkipButton", { display_order: 40 });
  ui.patch("CenterPanel/InviteButton", { display_order: 41 });
  ui.write("ui/MafiaLobbyHUD.ui", { lint: true, strict: true });
}

function layoutDay(path) {
  const ui = UIBuilder.load(path);
  setEnabled(ui, "CenterPanel/RoomInfoPlate", false);
  setEnabled(ui, "CenterPanel/RoomInfoText", false);
  setEnabled(ui, "CenterPanel/PlayerCountText", false);
  setEnabled(ui, "CenterPanel/TimePlate", true);
  setEnabled(ui, "CenterPanel/DayText", true);
  setEnabled(ui, "CenterPanel/TimerText", true);
  ui.patch("CenterPanel/TimePlate", {
    anchor: "top-center", pos: [0, -25], rect_size: [740, 135],
  });
  ui.patch("CenterPanel/DayText", {
    anchor: "top-left", pos: [45, -67], rect_size: [280, 44],
  });
  ui.patch("CenterPanel/TimerText", {
    anchor: "top-right", pos: [-45, -67], rect_size: [280, 44],
  });
  layoutChat(ui);
  setImage(ui, "CenterPanel/SkipButton", SKIP_RUID);
  ui.patch("CenterPanel/SkipButton", {
    anchor: "bottom-center", pos: [0, 39], rect_size: [740, 95],
  });
  ui.write(path, { lint: true, strict: true });
}

layoutLobby();
layoutDay("ui/MafiaDayHUD.ui");
layoutDay("ui/MafiaPlayHUD.ui");
console.log("[MafiaPhaseLayout] lobby/day layouts finalized");
