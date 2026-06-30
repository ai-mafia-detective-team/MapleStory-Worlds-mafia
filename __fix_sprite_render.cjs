// SpriteRendererComponent에 IgnoreMapLayerCheck: true 추가
// + mafia1의 불필요한 PixelRendererComponent 제거
const fs = require('fs');
const MAP_PATH = 'map/map01.map';

const raw = fs.readFileSync(MAP_PATH, 'utf8');
const map = JSON.parse(raw);

let fixedSprite = 0;
let fixedPixel = 0;

function processEntities(entities) {
    if (!Array.isArray(entities)) return;
    for (const entity of entities) {
        const json = entity.jsonString;
        if (!json) continue;

        const name = json.name || '';
        const components = json['@components'];
        if (!Array.isArray(components)) continue;

        // 1) SpriteRendererComponent에 IgnoreMapLayerCheck 추가
        for (const comp of components) {
            if (comp['@type'] === 'MOD.Core.SpriteRendererComponent') {
                if (comp['IgnoreMapLayerCheck'] !== true) {
                    comp['IgnoreMapLayerCheck'] = true;
                    console.log(`[SpriteRender] ${name}: IgnoreMapLayerCheck = true`);
                    fixedSprite++;
                }
            }
        }

        // 2) mafia1의 stray PixelRendererComponent 제거
        if (name === 'mafia1') {
            const beforeCount = components.length;
            const filtered = components.filter(c => c['@type'] !== 'MOD.Core.PixelRendererComponent');
            if (filtered.length < beforeCount) {
                json['@components'] = filtered;
                // componentNames 동기화
                const names = (entity.componentNames || '').split(',')
                    .filter(n => n.trim() !== 'MOD.Core.PixelRendererComponent')
                    .join(',');
                entity.componentNames = names;
                console.log(`[PixelRemove] mafia1: PixelRendererComponent 제거 완료`);
                fixedPixel++;
            }
        }
    }
}

function deepProcess(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
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
console.log(`\n[Done] SpriteRenderer ${fixedSprite}개 IgnoreMapLayerCheck 추가, PixelRenderer ${fixedPixel}개 제거`);
