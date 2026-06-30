const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const file = "ui/MafiaLobbyHUD.ui";
const b = UIBuilder.read(file);

const WHITE = { r: 1, g: 1, b: 1, a: 1 };
const NAME = { r: 1, g: 0.88, b: 0.55, a: 1 };
const OWN = { r: 0.65, g: 0.88, b: 1, a: 1 };

// Other player's nickname, visually outside the top-left of the other-message bubble.
b.text("/ui/MafiaLobbyHUD/text/NameText", "", {
  anchor: "top-left",
  pos: [-104, 28],
  rect_size: [220, 28],
  size: 18,
  color: NAME,
  bold: true,
  alignment: 3,
  display_order: 2,
});

// Other player's chat message inside the text bubble.
b.text("/ui/MafiaLobbyHUD/text/MessageText", "", {
  anchor: "middle-center",
  pos: [0, -4],
  rect_size: [330, 72],
  size: 18,
  color: WHITE,
  alignment: 3,
  overflow: 2,
  display_order: 1,
});

// Local player's chat message inside the own-message bubble.
b.text("/ui/MafiaLobbyHUD/text1/MessageText", "", {
  anchor: "middle-center",
  pos: [0, -4],
  rect_size: [330, 72],
  size: 18,
  color: OWN,
  alignment: 3,
  overflow: 2,
  display_order: 1,
});

b.write(file);
console.log("[add_lobby_chat_bubble_texts] updated MafiaLobbyHUD chat bubble text children");
