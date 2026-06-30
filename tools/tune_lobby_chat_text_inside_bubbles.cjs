const { UIBuilder } = require('../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const file = 'ui/MafiaLobbyHUD.ui';
const b = UIBuilder.read(file);

const MAPLE_FONT = 1;
const FONT_SIZE = 25;

const WARM_WHITE = { r: 1, g: 0.94, b: 0.82, a: 1 };
const OWN_BLUE = { r: 0.65, g: 0.88, b: 1, a: 1 };

const messageLabels = [
  {
    path: '/ui/MafiaLobbyHUD/text/MessageText',
    color: WARM_WHITE,
  },
  {
    path: '/ui/MafiaLobbyHUD/text1/MessageText',
    color: OWN_BLUE,
  },
];

for (const { path, color } of messageLabels) {
  // The speech-bubble sprite has a thick decorative border/tail area.
  // Use a narrower text box and move it inward so the text sits on the dark
  // readable center area instead of starting on the ornament edge.
  b.patch(path, {
    pos: [78, -3],
    rect_size: [250, 54],
  });
  b.patchComponent(path, 'MOD.Core.TextComponent', {
    Font: MAPLE_FONT,
    FontSize: FONT_SIZE,
    Bold: true,
    Alignment: 3,
    Overflow: 2,
    FontColor: color,
  });
}

b.write(file);
console.log('[tune_lobby_chat_text_inside_bubbles] moved chat text inside bubbles and fixed FontSize=25');
