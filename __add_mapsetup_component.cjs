// map01 루트 엔티티에 MafiaMapSetup 컴포넌트 추가
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

if (map01.componentNames.includes(CODEBLOCK)) {
    console.log('[SKIP] MafiaMapSetup 이미 연결됨');
    process.exit(0);
}

// componentNames에 추가
map01.componentNames += ',' + CODEBLOCK;

// @components 배열에 추가
map01.jsonString['@components'].push({
    '@type': CODEBLOCK,
    'Enable': true
});

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log('[Done] MafiaMapSetup 컴포넌트를 map01에 추가했습니다.');
console.log('componentNames:', map01.componentNames);
