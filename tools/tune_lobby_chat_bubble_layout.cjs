const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const OTHER_BUBBLE = '/ui/MafiaLobbyHUD/text';
const OTHER_NAME = '/ui/MafiaLobbyHUD/text/NameText';
const OTHER_MESSAGE = '/ui/MafiaLobbyHUD/text/MessageText';
const OWN_BUBBLE = '/ui/MafiaLobbyHUD/text1';
const OWN_MESSAGE = '/ui/MafiaLobbyHUD/text1/MessageText';

const MAPLE_FONT = 1;
const WARM_WHITE = { r: 1, g: 0.94, b: 0.82, a: 1 };
const OWN_BLUE = { r: 0.65, g: 0.88, b: 1, a: 1 };
const NAME_GOLD = { r: 1, g: 0.88, b: 0.55, a: 1 };

function uiTransform(path) {
  const entity = b.find(path);
  if (!entity) throw new Error(`Missing entity: ${path}`);
  return (entity.jsonString['@components'] || []).find((c) => c['@type'] === 'MOD.Core.UITransformComponent');
}

const otherTransform = uiTransform(OTHER_BUBBLE);
const ownTransform = uiTransform(OWN_BUBBLE);

// The first chat should start from the top line of the chat area.
// Keep each bubble's horizontal identity, but align their vertical starting row.
b.patch(OWN_BUBBLE, {
  pos: [ownTransform.anchoredPosition.x, otherTransform.anchoredPosition.y],
});

// Make sure both message labels are actually using the MapleStory UI font and
// have enough size/readability inside the handcrafted speech bubbles.
for (const path of [OTHER_MESSAGE, OWN_MESSAGE]) {
  b.patch(path, {
    pos: [0, -4],
    rect_size: [330, 72],
  });
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: MAPLE_FONT,
    FontSize: 20,
    Bold: true,
    Alignment: 3,
    Overflow: 2,
    FontColor: path === OWN_MESSAGE ? OWN_BLUE : WARM_WHITE,
  });
}

b.patchComponent(OTHER_NAME, 'MOD.Core.TextComponent', {
  Font: MAPLE_FONT,
  FontSize: 18,
  Bold: true,
  Alignment: 3,
  Overflow: 2,
  FontColor: NAME_GOLD,
});

b.write(file);
console.log('[tune_lobby_chat_bubble_layout] aligned first chat row and applied MapleStory font');
