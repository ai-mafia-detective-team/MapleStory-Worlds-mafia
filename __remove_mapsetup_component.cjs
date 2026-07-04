// map01 루트 엔티티에서 MafiaMapSetup codeblock 제거
const fs = require('fs');
const MAP_PATH = 'map/map01.map';
const CODEBLOCK = 'codeblock://797f63cf-ced9-4125-a306-4c5b886808d5';

const raw = fs.readFileSync(MAP_PATH, 'utf8');
const map = JSON.parse(raw);

const entities = map.ContentProto.Entities;
const map01 = entities.find(e => e.path === '/maps/map01');

if (!map01) {
    console.error('[ERROR] /maps/map01 엔티티를 찾을 수 없음');
    process.exit(1);
}

if (!map01.componentNames.includes(CODEBLOCK)) {
    console.log('[SKIP] MafiaMapSetup codeblock이 이미 없음');
    process.exit(0);
}

// componentNames에서 제거
map01.componentNames = map01.componentNames
    .split(',')
    .filter(c => c !== CODEBLOCK)
    .join(',');

// @components 배열에서 제거
map01.jsonString['@components'] = map01.jsonString['@components']
    .filter(c => c['@type'] !== CODEBLOCK);

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log('[Done] MafiaMapSetup codeblock 제거 완료');
console.log('componentNames:', map01.componentNames);
