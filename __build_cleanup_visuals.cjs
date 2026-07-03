// 맵에서 시각적 엔티티 제거 + MafiaCameraController 컴포넌트 제거

const { MapBuilder } = require('./.claude/skills/msw-general/scripts/map/msw_map_builder.cjs');

const MAP_PATH = 'map/map01.map';

const VISUAL_ENTITIES = [
    'Background',
    'BackgroundNight',
    'BgSky',
    'BgNight',
    'CitySkyl',
    'RoomWall_1L',
    'RoomWall_1R',
    'RoomWall_2L',
    'RoomWall_2R',
    'RoomWall_3L',
    'RoomWall_3R',
    'Ceiling_L',
    'Ceiling_R',
    'OverviewCamera',
    'CinematicCamera',
];

const builder = MapBuilder.read(MAP_PATH);

// 시각적 엔티티 제거 (없으면 경고만 출력)
for (const name of VISUAL_ENTITIES) {
    try {
        builder.remove(name);
        console.log(`[Remove] 엔티티 제거: ${name}`);
    } catch (e) {
        console.warn(`[Skip] 없음: ${name}`);
    }
}

// MapController에서 MafiaCameraController 컴포넌트 제거
try {
    builder.removeComponent('MapController', 'script.MafiaCameraController');
    console.log('[Remove] MapController에서 MafiaCameraController 제거 완료');
} catch (e) {
    console.warn('[Skip] MafiaCameraController 컴포넌트 없음:', e.message);
}

builder.write(MAP_PATH);
console.log('[Done] 맵 시각 요소 정리 완료');
