// RoomBadge1~8에 던전 배경 이미지 추가
// Bg는 투명 처리(위치 변경 없이) → 던전 배경이 보이도록
const { UIBuilder } = require('./.claude/skills/msw-ui-system/scripts/msw_ui_builder.cjs');

const UI_PATH = 'ui/MafiaPlayHUD.ui';
const b = UIBuilder.read(UI_PATH);

const RUIDS = [
    '841120993e0c41e19e4e5a2f65297eb7',  // 방1
    '0e6b5b9b85dc4f35a5c466fdf86b43a2',  // 방2
    '97459cdd4cdc497e85e44c1c2a2b9a6c',  // 방3
    '6e03242875724f3dbabf489626f926f1',  // 방4
    'a8d2a0caf35544e7a33b11ea223f6e32',  // 방5
    'c5e58bc64ff140e59101414ff64b241c',  // 방6
    '2fdf0049fd1f4c20bfbeb46f4702f9ee',  // 방7
    '3da3b8a0f6894975bf1f5712566c4537',  // 방8
];

const ROOM_W = 640;
const ROOM_H = 250;
const Y_CENTERS = [385, 125, -135, -395];

for (let i = 0; i < 8; i++) {
    const name = `RoomBadge${i + 1}`;
    const isLeft = i < 4;
    const anchor = isLeft ? 'middle-left' : 'middle-right';
    const xMargin = isLeft ? 10 : -10;
    const y = Y_CENTERS[i % 4];

    // 1. 패널 크기/위치 확장 (anchor, pos, size만 변경)
    b.patch(name, {
        anchor: anchor,
        pos: [xMargin, y],
        rect_size: [ROOM_W, ROOM_H],
    });

    // 2. 던전 배경 스프라이트 추가 (display_order=0 → 가장 뒤)
    b.sprite(`${name}/DungeonBg`, {
        anchor: 'stretch',
        pos: [0, 0],
        image_ruid: RUIDS[i],
    });
    b.patch(`${name}/DungeonBg`, { display_order: 0 });

    // 3. 기존 Bg를 반투명 다크 오버레이로 변경 (위치/크기는 그대로)
    b.patchComponent(`${name}/Bg`, 'MOD.Core.SpriteGUIRendererComponent', {
        Color: { r: 0.0, g: 0.0, b: 0.0, a: 0.55 },
    });
    b.patch(`${name}/Bg`, { display_order: 5 });

    // 4. 텍스트는 그대로 위에 표시
    b.patch(`${name}/Text`, { display_order: 6 });

    console.log(`[OK] ${name} (${isLeft ? '좌' : '우'}, Y=${y})`);
}

b.write(UI_PATH);
console.log('\n[Done] 던전 배경 추가 완료');
