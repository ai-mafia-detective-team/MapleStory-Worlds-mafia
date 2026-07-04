// 8방 확장: Floor_4L/4R, RoomZone_7/8, 배경 스프라이트 8개 추가

const { MapBuilder } = require('./.claude/skills/msw-general/scripts/map/msw_map_builder.cjs');

const MAP_PATH = 'map/map01.map';

const LEFT_X  = 9.3;
const RIGHT_X = 18.7;
const FLOOR4_Y = 8.44;

// 배경 RUID — 기획서 기준 (왼쪽 위→아래 1~4, 오른쪽 위→아래 5~8)
const BG_ROOMS = [
    { name: "BgRoom_1L", ruid: "aad8d510fb7e46989bcbc757e235e321", x: LEFT_X,  y: 13.54 },
    { name: "BgRoom_2L", ruid: "7e03a827a2e34388986c3d3c584bd1ec", x: LEFT_X,  y: 11.84 },
    { name: "BgRoom_3L", ruid: "9252609a98dc4392a8685e02d23bd975", x: LEFT_X,  y: 10.14 },
    { name: "BgRoom_4L", ruid: "e34a618aea434f83b35011651357059e", x: LEFT_X,  y: FLOOR4_Y },
    { name: "BgRoom_1R", ruid: "8c8015cc7e9b460f9827ec475f503d00", x: RIGHT_X, y: 13.54 },
    { name: "BgRoom_2R", ruid: "e2410ca6cdfe45c6b3257451fa4e9ebd", x: RIGHT_X, y: 11.84 },
    { name: "BgRoom_3R", ruid: "d3817218d5174e5588f6414e8300abd7", x: RIGHT_X, y: 10.14 },
    { name: "BgRoom_4R", ruid: "d0029813927d4fe387cf160d5d96b1df", x: RIGHT_X, y: FLOOR4_Y },
];

const builder = MapBuilder.read(MAP_PATH);

// 1. Floor_4L 추가 (발판 엔티티 — CustomFootholdComponent는 MafiaMapSetup이 런타임에 설정)
builder
    .empty("Floor_4L", { pos: [LEFT_X, FLOOR4_Y, 0] })
    .upsertComponent("Floor_4L", "MOD.Core.CustomFootholdComponent", {
        '@type': 'MOD.Core.CustomFootholdComponent',
        'Enable': true,
    });
console.log('[Add] Floor_4L');

// 2. Floor_4R 추가
builder
    .empty("Floor_4R", { pos: [RIGHT_X, FLOOR4_Y, 0] })
    .upsertComponent("Floor_4R", "MOD.Core.CustomFootholdComponent", {
        '@type': 'MOD.Core.CustomFootholdComponent',
        'Enable': true,
    });
console.log('[Add] Floor_4R');

// 3. RoomZone_7 추가 (Floor_4L 위치)
builder
    .empty("RoomZone_7", { pos: [LEFT_X, FLOOR4_Y, 0] })
    .upsertComponent("RoomZone_7", "script.RoomTouchZone", {
        '@type': 'script.RoomTouchZone',
        'Enable': true,
        'roomIndex': 7,
        'isActive': false,
    })
    .upsertComponent("RoomZone_7", "MOD.Core.TouchReceiveComponent", {
        '@type': 'MOD.Core.TouchReceiveComponent',
        'Enable': true,
    });
console.log('[Add] RoomZone_7');

// 4. RoomZone_8 추가 (Floor_4R 위치)
builder
    .empty("RoomZone_8", { pos: [RIGHT_X, FLOOR4_Y, 0] })
    .upsertComponent("RoomZone_8", "script.RoomTouchZone", {
        '@type': 'script.RoomTouchZone',
        'Enable': true,
        'roomIndex': 8,
        'isActive': false,
    })
    .upsertComponent("RoomZone_8", "MOD.Core.TouchReceiveComponent", {
        '@type': 'MOD.Core.TouchReceiveComponent',
        'Enable': true,
    });
console.log('[Add] RoomZone_8');

// 5. 배경 스프라이트 8개 추가
for (const bg of BG_ROOMS) {
    builder
        .sprite(bg.name, {
            pos: [bg.x, bg.y - 0.5, 0],
            ruid: bg.ruid,
            order: -10,
        })
        .patchComponent(bg.name, "MOD.Core.SpriteRendererComponent", {
            SortingLayer: "Background",
        });
    console.log(`[Add] ${bg.name} at (${bg.x}, ${bg.y - 0.5})`);
}

builder.write(MAP_PATH);
console.log('[Done] 8방 맵 확장 완료');
