const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const b = UIBuilder.read('ui/MafiaLobbyHUD.ui');
for (const name of ['RoomSettingsIcon', 'RoomSettings']) {
  const matches = b.entities.filter((e) => (e.jsonString.path || '').includes(name));
  console.log('---', name, 'matches', matches.length);
  for (const e of matches) {
    const js = e.jsonString;
    const comps = js['@components'] || [];
    const tr = comps.find((c) => c['@type'] === 'MOD.Core.UITransformComponent');
    const sr = comps.find((c) => c['@type'] === 'MOD.Core.SpriteGUIRendererComponent');
    const tx = comps.find((c) => c['@type'] === 'MOD.Core.TextComponent');
    const btn = comps.find((c) => c['@type'] === 'MOD.Core.ButtonComponent');
    console.log(JSON.stringify({
      path: js.path,
      enable: js.enable,
      visible: js.visible,
      displayOrder: js.displayOrder,
      components: e.componentNames,
      pos: tr && tr.anchoredPosition,
      size: tr && tr.RectSize,
      image: sr && sr.ImageRUID,
      text: tx && tx.Text,
      button: Boolean(btn),
    }, null, 2));
  }
}
