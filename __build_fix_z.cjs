// SpriteRendererComponent 또는 PixelRendererComponent를 가진 엔티티의 Z값을 0으로 일괄 수정
// 제외: MapleMapLayer_1, Background (시스템 엔티티)

const fs = require('fs');
const MAP_PATH = 'map/map01.map';

const EXCLUDE = ['MapleMapLayer_1', 'Background'];
const VISUAL_COMPONENTS = ['MOD.Core.SpriteRendererComponent', 'MOD.Core.PixelRendererComponent'];

const raw = fs.readFileSync(MAP_PATH, 'utf8');
const map = JSON.parse(raw);

let count = 0;

function processEntities(entities) {
    if (!Array.isArray(entities)) return;
    for (const entity of entities) {
        const json = entity.jsonString;
        if (!json) continue;

        const name = json.name || '';
        if (EXCLUDE.includes(name)) {
            console.log(`[Skip] ${name}`);
            continue;
        }

        const componentNames = entity.componentNames || '';
        const hasVisual = VISUAL_COMPONENTS.some(c => componentNames.includes(c));
        if (!hasVisual) continue;

        const components = json['@components'] || [];
        const transform = components.find(c => c['@type'] === 'MOD.Core.TransformComponent');
        if (!transform || !transform.Position) continue;

        const oldZ = transform.Position.z;
        if (oldZ === 0) continue;

        transform.Position.z = 0;
        console.log(`[Fix] ${name}: Z ${oldZ.toFixed(3)} → 0`);
        count++;
    }
}

// 맵 엔티티 순회
const content = map.ContentProto?.Json;
if (content?.entities) {
    processEntities(content.entities);
}

// 중첩 구조 탐색
function deepProcess(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        // entity 배열인지 확인
        if (obj.length > 0 && obj[0]?.jsonString) {
            processEntities(obj);
        }
        obj.forEach(deepProcess);
    } else {
        Object.values(obj).forEach(deepProcess);
    }
}

deepProcess(map);

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log(`\n[Done] ${count}개 엔티티 Z값 수정 완료`);
