const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const b = UIBuilder.read('ui/MafiaLobbyHUD.ui');
const paths = [
  '/ui/MafiaLobbyHUD/text',
  '/ui/MafiaLobbyHUD/text/NameText',
  '/ui/MafiaLobbyHUD/text/MessageText',
  '/ui/MafiaLobbyHUD/text1',
  '/ui/MafiaLobbyHUD/text1/MessageText',
];

for (const p of paths) {
  const n = b.find(p);
  if (!n) {
    console.log(p, 'MISSING');
    continue;
  }

  const comps = n.jsonString['@components'] || [];
  const tr = comps.find((c) => c['@type'] === 'MOD.Core.UITransformComponent');
  const tx = comps.find((c) => c['@type'] === 'MOD.Core.TextComponent');
  console.log(p, JSON.stringify({
    pos: tr && tr.anchoredPosition,
    size: tr && tr.RectSize,
    font: tx && tx.Font,
    fontSize: tx && tx.FontSize,
    align: tx && tx.Alignment,
    color: tx && tx.FontColor,
    text: tx && tx.Text,
  }));
}
