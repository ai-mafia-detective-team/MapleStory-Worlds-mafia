'use strict';
/**
 * CreateDialog 완전 재설계 — 기존 요소 전부 제거 후 새 레이아웃으로 재구성
 */
const { UIBuilder } = require('./.claude/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const b = UIBuilder.load('ui/SelectGroup.ui');
const D = 'SelectGroup/CreateDialog';

// ── Step 1: 기존 자식 요소 전부 제거 ────────────────────────────
const toRemove = [
  `${D}/AppearDisplay`, `${D}/BottomDivider`, `${D}/BtnAppearNext`,
  `${D}/BtnAppearPrev`, `${D}/BtnCancel`,    `${D}/BtnCheckNick`,
  `${D}/BtnConfirm`,   `${D}/DimBg`,         `${D}/DlgTitle`,
  `${D}/InputHint`,    `${D}/LblAppear`,      `${D}/LblNick`,
  `${D}/NameInput`,    `${D}/NickStatus`,     `${D}/Panel`,
  `${D}/PanelBorder`,  `${D}/PanelGlow`,      `${D}/Title`,
  `${D}/TitleDivider`, `${D}/TopAccent`,
];
for (const p of toRemove) {
  if (b.find(p)) b.remove(p);
}

// ── Step 2: 배경 레이어 (하단부터) ──────────────────────────────
// 전체 화면 딤 처리
b.sprite(`${D}/DimBg`, {
  anchor: 'stretch',
  color: '#000000',
  alpha: 0.78,
  raycast: true,
});

// 외부 발광 효과 (가장 크고 투명)
b.sprite(`${D}/PanelGlow`, {
  anchor: 'middle-center',
  pos: [0, 0],
  rect_size: [664, 544],
  color: '#3333AA',
  alpha: 0.22,
});

// 패널 테두리
b.sprite(`${D}/PanelBorder`, {
  anchor: 'middle-center',
  pos: [0, 0],
  rect_size: [646, 522],
  color: '#5566BB',
  alpha: 0.80,
});

// 메인 패널 배경 (640×520)
b.sprite(`${D}/Panel`, {
  anchor: 'middle-center',
  pos: [0, 0],
  rect_size: [640, 520],
  color: '#131320',
  alpha: 0.97,
});

// ── Step 3: 헤더 영역 ─────────────────────────────────────────
// 상단 색상 강조선 (패널 상단 끝)
b.sprite(`${D}/TopAccent`, {
  anchor: 'middle-center',
  pos: [0, 254],
  rect_size: [640, 6],
  color: '#6699FF',
  alpha: 1.0,
});

// 다이얼로그 제목
b.text(`${D}/Title`, '캐릭터 생성', {
  anchor: 'middle-center',
  pos: [0, 207],
  rect_size: [400, 52],
  size: 28,
  color: '#FFFFFF',
  bold: true,
  alignment: 4,
});

// 제목 구분선
b.sprite(`${D}/TitleDivider`, {
  anchor: 'middle-center',
  pos: [0, 173],
  rect_size: [590, 2],
  color: '#555599',
  alpha: 0.75,
});

// ── Step 4: 외형 선택 영역 ────────────────────────────────────
// 섹션 레이블
b.text(`${D}/LblAppear`, '외형 선택', {
  anchor: 'middle-center',
  pos: [0, 128],
  rect_size: [200, 28],
  size: 13,
  color: '#8888AA',
  alignment: 4,
});

// 이전 버튼
b.button(`${D}/BtnAppearPrev`, '◀', {
  anchor: 'middle-center',
  pos: [-130, 78],
  rect_size: [60, 55],
  font_size: 18,
  color: '#FFFFFF',
});

// 현재 외형 표시 텍스트 (바인딩 대상)
b.text(`${D}/AppearDisplay`, '외형 1', {
  anchor: 'middle-center',
  pos: [0, 78],
  rect_size: [180, 55],
  size: 20,
  color: '#FFFFFF',
  bold: true,
  alignment: 4,
});

// 다음 버튼
b.button(`${D}/BtnAppearNext`, '▶', {
  anchor: 'middle-center',
  pos: [130, 78],
  rect_size: [60, 55],
  font_size: 18,
  color: '#FFFFFF',
});

// ── Step 5: 닉네임 영역 ───────────────────────────────────────
// 섹션 레이블
b.text(`${D}/LblNick`, '닉네임', {
  anchor: 'middle-center',
  pos: [0, 13],
  rect_size: [200, 28],
  size: 13,
  color: '#8888AA',
  alignment: 4,
});

// 닉네임 입력 필드
b.textInput(`${D}/NameInput`, {
  anchor: 'middle-center',
  pos: [-60, -37],
  rect_size: [230, 55],
  placeholder: '이름 입력 (최대 8자)',
  font_size: 15,
  color: '#FFFFFF',
  char_limit: 8,
});

// 중복확인 버튼
b.button(`${D}/BtnCheckNick`, '중복확인', {
  anchor: 'middle-center',
  pos: [120, -37],
  rect_size: [110, 55],
  font_size: 14,
  color: '#FFFFFF',
});

// 닉네임 상태 메시지 (바인딩 대상)
b.text(`${D}/NickStatus`, '닉네임을 입력하고 중복확인을 해주세요', {
  anchor: 'middle-center',
  pos: [0, -95],
  rect_size: [490, 28],
  size: 13,
  color: '#666688',
  alignment: 4,
});

// ── Step 6: 하단 버튼 영역 ────────────────────────────────────
// 하단 구분선
b.sprite(`${D}/BottomDivider`, {
  anchor: 'middle-center',
  pos: [0, -128],
  rect_size: [590, 2],
  color: '#555599',
  alpha: 0.75,
});

// 확인 버튼
b.button(`${D}/BtnConfirm`, '확  인', {
  anchor: 'middle-center',
  pos: [115, -195],
  rect_size: [200, 65],
  font_size: 18,
  color: '#FFFFFF',
});

// 취소 버튼
b.button(`${D}/BtnCancel`, '취  소', {
  anchor: 'middle-center',
  pos: [-115, -195],
  rect_size: [200, 65],
  font_size: 18,
  color: '#FFFFFF',
});

// ── Step 7: 버튼/입력 배경색 패치 ─────────────────────────────
// 외형 이전/다음 버튼 (짙은 남색)
b.patchComponent(`${D}/BtnAppearPrev`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.18, g: 0.18, b: 0.40, a: 1.0 },
});
b.patchComponent(`${D}/BtnAppearNext`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.18, g: 0.18, b: 0.40, a: 1.0 },
});

// 중복확인 버튼 (중간 남색)
b.patchComponent(`${D}/BtnCheckNick`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.20, g: 0.20, b: 0.55, a: 1.0 },
});

// 닉네임 입력 필드 배경 (어두운 남색)
b.patchComponent(`${D}/NameInput`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.10, g: 0.10, b: 0.22, a: 1.0 },
});

// 확인 버튼 (파란색 강조)
b.patchComponent(`${D}/BtnConfirm`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.20, g: 0.42, b: 0.85, a: 1.0 },
});

// 취소 버튼 (회색)
b.patchComponent(`${D}/BtnCancel`, 'MOD.Core.SpriteGUIRendererComponent', {
  Color: { r: 0.22, g: 0.22, b: 0.35, a: 1.0 },
});

// ── Step 8: 저장 + 바인딩 주입 ───────────────────────────────
b.write('ui/SelectGroup.ui', {
  bind: {
    mlua: 'RootDesk/MyDesk/Select/SelectScreen.mlua',
    props: {
      appearDisplay: `${D}/AppearDisplay`,
      nickStatus:    `${D}/NickStatus`,
    },
  },
});

b.printEntities();
console.log('\n✓ CreateDialog 재설계 완료');
