const crypto = require("node:crypto");
const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const ui = UIBuilder.load("ui/MafiaDayHUD.ui");
const oldRoot = ui.root_path;
const newRoot = "/ui/MafiaPlayHUD";

for (const entity of ui.entities) {
  entity.id = crypto.randomUUID();
  entity.path = entity.path.replace(oldRoot, newRoot);
  entity.jsonString.path = entity.jsonString.path.replace(oldRoot, newRoot);
}

const root = ui.entities.find((entity) => entity.jsonString.path === newRoot);
if (!root) throw new Error("Failed to restore MafiaPlayHUD root");
root.jsonString.name = "MafiaPlayHUD";
ui.group_name = "MafiaPlayHUD";
ui.root_path = newRoot;
ui.root_uuid = root.id;
ui._data.EntryKey = `ui://${root.id}`;
ui._data.ContentProto.Entities = ui.entities;
ui.write("ui/MafiaPlayHUD.ui", { lint: true, strict: true });
console.log("[MafiaPlayHUD] restored from MafiaDayHUD");
