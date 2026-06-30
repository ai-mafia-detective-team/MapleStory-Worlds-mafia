const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SCROLL = "MOD.Core.ScrollLayoutGroupComponent";

const targets = [
  { file: "ui/MafiaLobbyHUD.ui", root: "MafiaLobbyHUD" },
  { file: "ui/MafiaPlayHUD.ui", root: "MafiaPlayHUD" },
  { file: "ui/MafiaDayHUD.ui", root: "MafiaDayHUD" },
];

for (const { file, root } of targets) {
  const b = UIBuilder.read(file);
  const chatScrollPath = `/ui/${root}/CenterPanel/ChatScroll`;

  if (b.hasComponent(chatScrollPath, SCROLL)) {
    b.removeComponent(chatScrollPath, SCROLL);
    console.log(`[remove_all_chat_scroll] removed ${SCROLL} from ${chatScrollPath}`);
  } else {
    console.log(`[remove_all_chat_scroll] already removed: ${chatScrollPath}`);
  }

  // Old handcrafted scrollbar pieces from early layout drafts.
  for (const name of ["Scroll", "Up", "Down", "Thumb", "ThumbSmall"]) {
    const path = `/ui/${root}/${name}`;
    if (b.find(path)) {
      b.remove(path);
      console.log(`[remove_all_chat_scroll] removed legacy piece ${path}`);
    }
  }

  b.write(file);
}
