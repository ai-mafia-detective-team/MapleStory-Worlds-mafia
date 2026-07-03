const fs = require("fs");
const path = require("path");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const lobbyFile = "ui/MafiaLobbyHUD.ui";
const dayFile = "ui/MafiaDayHUD.ui";
const backupDir = ".codex-backups";
const backupPath = path.join(
  backupDir,
  `MafiaLobbyHUD.before-uibuilder-chat-restore.${new Date().toISOString().replace(/[:.]/g, "-")}.ui`
);

const CENTER_NAMES = new Set([
  "ChatCropMask",
  "Frame",
  "PhaseChatPlate",
  "ChatInput",
  "ChatScroll",
  "ChatLogText",
  "ChatSendButton",
  "ChatMarginLeft",
  "ChatMarginRight",
  "ChatSolidMaskLeft",
  "ChatSolidMaskRight",
  "UISprite",
  "UISprite_1",
  "ChatMarginTop",
  "ChatMarginBottom",
  "LobbyChatNameSlot1",
  "LobbyChatSlot1",
  "LobbyChatSlot2",
  "LobbyChatNameSlot2",
  "LobbyChatSlot3",
  "LobbyChatSlot4",
  "LobbyChatNameSlot3",
  "LobbyChatSlot5",
  "LobbyChatSlot6",
  "LobbyChatNameSlot4",
  "LobbyChatSlot7",
  "LobbyChatSlot8",
  "LobbyChatNameSlot5",
  "LobbyChatNameSlot6",
  "LobbyChatNameSlot7",
  "LobbyChatNameSlot8",
]);
const ROOT_NAMES = new Set(["UISprite_2", "UISprite_3"]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function entityPath(entity) {
  return entity.jsonString?.path || entity.path || "";
}

function entityName(entity) {
  const p = entityPath(entity);
  return entity.jsonString?.name || p.split("/").pop();
}

function isCenterChat(path, name, root) {
  return path.startsWith(`${root}/CenterPanel/`) && CENTER_NAMES.has(name);
}

function isRootScroll(path, name, root) {
  return path === `${root}/${name}` && ROOT_NAMES.has(name);
}

function isSource(entity) {
  const p = entityPath(entity);
  const n = entityName(entity);
  return isCenterChat(p, n, "/ui/MafiaDayHUD") || isRootScroll(p, n, "/ui/MafiaDayHUD");
}

function isLobbyChat(entity) {
  const p = entityPath(entity);
  const n = entityName(entity);
  return isCenterChat(p, n, "/ui/MafiaLobbyHUD") || isRootScroll(p, n, "/ui/MafiaLobbyHUD");
}

function sortParentsFirst(a, b) {
  const pa = entityPath(a);
  const pb = entityPath(b);
  const da = pa.split("/").length;
  const db = pb.split("/").length;
  if (da !== db) return da - db;
  const oa = a.jsonString?.displayOrder ?? 0;
  const ob = b.jsonString?.displayOrder ?? 0;
  if (oa !== ob) return oa - ob;
  return pa.localeCompare(pb);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(lobbyFile, backupPath);

const source = UIBuilder.read(dayFile).entities.filter(isSource).sort(sortParentsFirst);
if (source.length < 20) {
  throw new Error(`Not enough DayHUD chat source entities: ${source.length}`);
}

const lobby = UIBuilder.read(lobbyFile);
for (const entity of [...lobby.entities].filter(isLobbyChat).sort(sortParentsFirst).reverse()) {
  lobby.remove(entityPath(entity));
}

for (const entity of source) {
  const js = entity.jsonString;
  const targetPath = js.path.replace("/ui/MafiaDayHUD", "/ui/MafiaLobbyHUD");
  const components = clone(js["@components"] || []);
  const compNames = components.map((component) => component["@type"]).filter(Boolean).join(",") || entity.componentNames;
  const origin = clone(js.origin) || { type: "Model", entry_id: "UIEmpty", sub_entity_id: null, root_entity_id: null, replaced_model_id: null };
  const modelId = js.modelId || "uiempty";

  lobby._add(targetPath, compNames, origin.entry_id || "UIEmpty", modelId, components, js.enable !== false, false, {});
  lobby.patch(targetPath, {
    display_order: js.displayOrder ?? 0,
    enable: js.enable !== false,
    visible: js.visible !== false,
  });
}

lobby.write(lobbyFile, { lint: false, strict: false });
console.log(`[restore_lobby_chat_with_uibuilder] restored ${source.length} entities to ${lobbyFile}`);
console.log(`[restore_lobby_chat_with_uibuilder] backup ${backupPath}`);
