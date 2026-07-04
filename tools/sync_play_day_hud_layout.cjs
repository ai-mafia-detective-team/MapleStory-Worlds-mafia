const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const SOURCE_FILE = "ui/MafiaPlayHUD.ui";
const TARGET_FILE = "ui/MafiaDayHUD.ui";
const SOURCE_ROOT = "/ui/MafiaPlayHUD";
const TARGET_ROOT = "/ui/MafiaDayHUD";
const UI_TRANSFORM = "MOD.Core.UITransformComponent";

const source = UIBuilder.read(SOURCE_FILE);
const target = UIBuilder.read(TARGET_FILE);

const layoutFields = [
  "anchoredPosition",
  "RectSize",
  "AlignmentOption",
  "AnchorsMin",
  "AnchorsMax",
  "OffsetMin",
  "OffsetMax",
  "Pivot",
  "UIScale",
  "UIRotation",
  "UIMode",
  "ActivePlatform",
];

function cloneValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

let patched = 0;
let skipped = 0;

for (const entity of source.listEntities()) {
  const sourcePath = entity.path;
  const relativePath = sourcePath === SOURCE_ROOT ? "" : sourcePath.slice(SOURCE_ROOT.length + 1);
  const targetPath = relativePath ? `${TARGET_ROOT}/${relativePath}` : TARGET_ROOT;

  if (!target.find(targetPath)) {
    skipped += 1;
    continue;
  }

  let sourceTransform;
  try {
    sourceTransform = source.getComponent(sourcePath, UI_TRANSFORM);
    target.getComponent(targetPath, UI_TRANSFORM);
  } catch {
    skipped += 1;
    continue;
  }

  const patch = {};
  for (const field of layoutFields) {
    if (sourceTransform[field] !== undefined) {
      patch[field] = cloneValue(sourceTransform[field]);
    }
  }

  target.patchComponent(targetPath, UI_TRANSFORM, patch);
  patched += 1;
}

target.write(TARGET_FILE);

console.log(`[sync_play_day_hud_layout] ${TARGET_FILE} layout synced from ${SOURCE_FILE}`);
console.log(`[sync_play_day_hud_layout] patched=${patched}, skipped=${skipped}`);
