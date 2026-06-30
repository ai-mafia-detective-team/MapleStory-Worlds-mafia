const { UIBuilder } = require('./.claude/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const b = UIBuilder.read('ui/MafiaPlayHUD.ui');
b.printEntities();
