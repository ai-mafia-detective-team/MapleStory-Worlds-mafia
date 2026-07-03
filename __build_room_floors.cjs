// 8개 방 투명 발판 추가 (커서 좌표 기반)
const { MapBuilder } = require('./.claude/skills/msw-general/scripts/map/msw_map_builder.cjs');

const MAP_PATH = 'map/map01.map';

// 중심 X = (좌끝 + 우끝) / 2, 반너비 = (우끝 - 좌끝) / 2
const FLOORS = [
    { name: "RoomFloor_1L", x: -44.337, y: 15.329, hw: 2.853 },
    { name: "RoomFloor_1R", x: -31.733, y: 15.476, hw: 2.863 },
    { name: "RoomFloor_2L", x: -43.597, y: 12.772, hw: 2.578 },
    { name: "RoomFloor_2R", x: -31.796, y: 12.878, hw: 2.525 },
    { name: "RoomFloor_3L", x: -43.587, y: 10.237, hw: 2.399 },
    { name: "RoomFloor_3R", x: -32.166, y: 10.153, hw: 2.620 },
    { name: "RoomFloor_4L", x: -43.809, y:  7.871, hw: 3.170 },
    { name: "RoomFloor_4R", x: -31.701, y:  7.807, hw: 2.958 },
];

const builder = MapBuilder.read(MAP_PATH);

for (const f of FLOORS) {
    builder
        .empty(f.name, { pos: [f.x, f.y, 0] })
        .upsertComponent(f.name, 'MOD.Core.CustomFootholdComponent', {
            '@type': 'MOD.Core.CustomFootholdComponent',
            'Enable': true,
        });
    console.log(`[Add] ${f.name} at (${f.x}, ${f.y}), 범위=±${f.hw}`);
}

builder.write(MAP_PATH);
console.log('[Done] 8개 투명 발판 추가 완료');
