// 던전 발판 위치에 RoomSpawn_1~7 엔티티 추가
// 각 방의 스폰 좌표: (발판 중심 X, -1.0, 0) — 발판 표면(y=-1.51) 위 0.51 유닛
const fs = require('fs');
const crypto = require('crypto');
const MAP_PATH = 'map/map01.map';

const raw = fs.readFileSync(MAP_PATH, 'utf8');
const map = JSON.parse(raw);

// 7개 방 스폰 위치 (발판 중심 X, floor y=-1.51 보다 0.51 위)
const rooms = [
    { name: 'RoomSpawn_1', x: -5.0 },  // foothold-3854_2
    { name: 'RoomSpawn_2', x: -3.0 },  // foothold-3416
    { name: 'RoomSpawn_3', x: -1.0 },  // foothold-3416_1
    { name: 'RoomSpawn_4', x:  1.0 },  // foothold-2809
    { name: 'RoomSpawn_5', x:  3.0 },  // foothold-3854
    { name: 'RoomSpawn_6', x:  5.0 },  // foothold-2809_1
    { name: 'RoomSpawn_7', x:  7.0 },  // foothold-3854_1
];
const SPAWN_Y = -1.0;  // 발판 표면(y=-1.51)보다 0.51 위 → 착지 시 자연스럽게 발판에 서게 됨

const entities = map.ContentProto.Entities;

// 기존 RoomSpawn 엔티티 제거 (중복 방지)
map.ContentProto.Entities = entities.filter(e => !e.path.includes('RoomSpawn_'));

let displayOrder = 50;
for (const room of rooms) {
    const guid = crypto.randomUUID();
    const entity = {
        id: guid,
        path: `/maps/map01/${room.name}`,
        componentNames: 'MOD.Core.TransformComponent',
        jsonString: {
            name: room.name,
            path: `/maps/map01/${room.name}`,
            nameEditable: true,
            enable: true,
            visible: true,
            localize: false,
            displayOrder: displayOrder++,
            pathConstraints: '///',
            revision: 1,
            origin: {
                type: 'Model',
                entry_id: 'mapempty',
                sub_entity_id: null,
                root_entity_id: guid,
                replaced_model_id: null,
            },
            modelId: 'mapempty',
            '@components': [
                {
                    '@type': 'MOD.Core.TransformComponent',
                    Position: { x: room.x, y: SPAWN_Y, z: 0 },
                    QuaternionRotation: { x: 0, y: 0, z: 0, w: 1 },
                    Scale: { x: 1, y: 1, z: 1 },
                    Enable: true,
                },
            ],
            '@version': 1,
        },
    };
    map.ContentProto.Entities.push(entity);
    console.log(`[추가] ${room.name} at (${room.x}, ${SPAWN_Y})`);
}

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log('[완료] RoomSpawn_1~7 추가 완료');
