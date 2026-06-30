const crypto = require("node:crypto");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SOURCE = "ui/MafiaPlayHUD.ui";
const UI_GROUP = "MOD.Core.UIGroupComponent";
const TEXT = "MOD.Core.TextComponent";

function cloneUi(newName) {
  const ui = UIBuilder.load(SOURCE);
  const oldRoot = ui.root_path;
  const newRoot = `/ui/${newName}`;

  // UIBuilder intentionally blocks root renaming. Rebase the loaded builder in
  // memory, regenerate every UUID, then let UIBuilder validate/write the result.
  for (const entity of ui.entities) {
    entity.id = crypto.randomUUID();
    entity.path = entity.path.replace(oldRoot, newRoot);
    entity.jsonString.path = entity.jsonString.path.replace(oldRoot, newRoot);
  }

  const root = ui.entities.find((entity) => entity.jsonString.path === newRoot);
  if (!root) throw new Error(`Failed to locate cloned UI root: ${newRoot}`);
  root.jsonString.name = newName;

  ui.group_name = newName;
  ui.root_path = newRoot;
  ui.root_uuid = root.id;
  ui._data.EntryKey = `ui://${root.id}`;
  ui._data.ContentProto.Entities = ui.entities;

  // Phase switching will be wired later; prevent duplicate full-screen HUDs now.
  ui.patchComponent(newName, UI_GROUP, { DefaultShow: false });
  return ui;
}

function setText(ui, path, value) {
  ui.patchComponent(path, TEXT, { Text: value });
}

const day = cloneUi("MafiaDayHUD");
day.write("ui/MafiaDayHUD.ui", { lint: true, strict: true });

const lobby = cloneUi("MafiaLobbyHUD");
lobby.patchComponent("MafiaLobbyHUD", UI_GROUP, { DefaultShow: true });
setText(lobby, "CenterPanel/RoomInfoText", "커닝시티 마피아");
setText(lobby, "CenterPanel/PlayerCountText", "대기 인원 1/8");
setText(lobby, "CenterPanel/DayText", "방 번호 0421");
setText(lobby, "CenterPanel/TimerText", "게임 시작 대기");
setText(lobby, "CenterPanel/PhaseTitleText", "대기실 채팅");
setText(lobby, "CenterPanel/PhaseDescriptionText", "참가자를 기다리며 자유롭게 대화할 수 있습니다.");
setText(lobby, "CenterPanel/ChatLogText", "대기실에 입장했습니다.\n준비가 되면 아래 준비 버튼을 눌러주세요.");
setText(lobby, "CenterPanel/VoteStatusText", "준비 현황 0/8");
setText(lobby, "CenterPanel/VoteHintText", "모든 플레이어가 준비하면 게임을 시작합니다.");
setText(lobby, "CenterPanel/SkipButton", "준비");

for (let i = 1; i <= 8; i += 1) {
  setText(lobby, `RoomBadge${i}/Text`, `${i}번 자리 · 대기 중`);
}

lobby.write("ui/MafiaLobbyHUD.ui", { lint: true, strict: true });
require("./add_lobby_avatar_slots.cjs");
