// 캐릭터 크기 확인용 테스트 스프라이트 추가
const { MapBuilder } = require('./.claude/skills/msw-general/scripts/map/msw_map_builder.cjs');

const MAP_PATH = 'map/map01.map';

// RoomFloor_1L 위치 위에 배치 (x=-44.337, y=15.329 → 발판 바로 위)
const builder = MapBuilder.read(MAP_PATH);

builder
    .sprite('TestChar', {
        pos: [-44.337, 15.8, 0],
        ruid: 'ae46402787474a12b34fa13b25ce698f', // 주민 NPC stand
        order: 10,
    });

builder.write(MAP_PATH);
console.log('[Done] 테스트 캐릭터 스프라이트 추가 완료');
