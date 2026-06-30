const { UIBuilder } = require('./.claude/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

async function main() {
  const b = new UIBuilder();

  // INPLAY UIGroup - phase indicator HUD (낮/밤 표시)
  b.group('INPLAYGroup', {
    anchorMin: { x: 0, y: 0 },
    anchorMax: { x: 1, y: 1 },
    anchoredPosition: { x: 0, y: 0 },
    sizeDelta: { x: 0, y: 0 },
    displayOrder: 5,
  });

  // 낮/밤 상태 텍스트 (우상단)
  b.text('PhaseLabel', 'INPLAYGroup', {
    text: '[낮]',
    fontSize: 28,
    color: { r: 1, g: 0.95, b: 0.6, a: 1 },
    anchor: 'topRight',
    anchoredPosition: { x: -30, y: -30 },
    sizeDelta: { x: 120, y: 48 },
    alignment: 4,
  });

  await b.write('ui/INPLAY.ui');

  console.log('✅ INPLAY.ui 생성 완료');
}

main().catch(console.error);
