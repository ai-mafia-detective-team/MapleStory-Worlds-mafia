#!/usr/bin/env python3
"""
map01.map 수직 압축 스크립트 (캐릭터 크기 비례 조정)
Ground Y=11.34 (유지)
Lower Pipe: 5.31 -> 9.0
Upper Pipe: -0.37 -> 6.7
"""
import json

MAP_FILE = 'map/map01.map'

GROUND_Y    = 11.34
OLD_LO_Y    = 5.31
OLD_HI_Y    = -0.37
NEW_LO_Y    = 9.0
NEW_HI_Y    = 6.7

OLD_LO_ENT  = 5.45   # foothold-5075 하단 파이프 엔티티 Y
OLD_HI_ENT  = -0.22  # foothold-5075 상단 파이프 엔티티 Y

# 사다리: ground(11.34) ~ upper pipe(6.7) 전 구간
LADDER_CENTER = (GROUND_Y + NEW_HI_Y) / 2   # 9.02
LADDER_HEIGHT = GROUND_Y - NEW_HI_Y          # 4.64

def close(a, b, tol=0.25):
    return abs(a - b) < tol

def remap_wall_y(y):
    if close(y, GROUND_Y, 0.1):
        return GROUND_Y
    if y >= OLD_LO_Y - 0.5:
        ratio = (y - OLD_LO_Y) / (GROUND_Y - OLD_LO_Y)
        return round(NEW_LO_Y + ratio * (GROUND_Y - NEW_LO_Y), 4)
    elif y >= OLD_HI_Y - 0.06:
        ratio = (y - OLD_HI_Y) / (OLD_LO_Y - OLD_HI_Y)
        return round(NEW_HI_Y + ratio * (NEW_LO_Y - NEW_HI_Y), 4)
    else:
        return None

def process_foothold_layer(segments, layer_num):
    removed_ids = set()
    to_del = []

    for seg in segments:
        sid  = seg.get('Id', 0)
        sp   = seg.get('StartPoint', {})
        ep   = seg.get('EndPoint', {})
        sp_y = sp.get('y', 0)
        ep_y = ep.get('y', 0)

        if layer_num == 1:
            if sid == 91:
                sp['y'] = NEW_LO_Y
                ep['y'] = NEW_LO_Y
            elif sid == 92:
                sp['y'] = NEW_HI_Y
                ep['y'] = NEW_HI_Y
            elif close(sp_y, GROUND_Y, 0.1) and close(ep_y, GROUND_Y, 0.1):
                pass
            else:
                min_y = min(sp_y, ep_y)
                if min_y < OLD_HI_Y - 0.06:
                    removed_ids.add(sid)
                    to_del.append(seg)
                else:
                    new_sp = remap_wall_y(sp_y)
                    new_ep = remap_wall_y(ep_y)
                    if new_sp is None or new_ep is None:
                        removed_ids.add(sid)
                        to_del.append(seg)
                    else:
                        sp['y'] = new_sp
                        ep['y'] = new_ep

        elif layer_num == 2:
            if close(sp_y, 5.6, 0.4) and close(ep_y, 5.6, 0.4):
                sp['y'] = NEW_LO_Y
                ep['y'] = NEW_LO_Y
            elif close(sp_y, -0.08, 0.25) and close(ep_y, -0.08, 0.25):
                sp['y'] = NEW_HI_Y
                ep['y'] = NEW_HI_Y

    for s in to_del:
        segments.remove(s)

    if removed_ids:
        print(f"  Layer {layer_num}: {len(to_del)}개 제거 IDs={sorted(removed_ids)}")

    return removed_ids

def fix_chain_links(segments, removed_ids):
    fixed = 0
    for seg in segments:
        if seg.get('PreviousFootholdId', 0) in removed_ids:
            seg['PreviousFootholdId'] = 0
            fixed += 1
        if seg.get('NextFootholdId', 0) in removed_ids:
            seg['NextFootholdId'] = 0
            fixed += 1
    if fixed:
        print(f"  체인 링크 {fixed}개 → 0 수정")

def process():
    with open(MAP_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    entities = data.get('ContentProto', {}).get('Entities', [])
    print(f"총 엔티티 수: {len(entities)}")

    to_remove_indices = []

    for idx, ent in enumerate(entities):
        js_raw = ent.get('jsonString', {})
        js_is_str = isinstance(js_raw, str)

        if js_is_str:
            try:
                js = json.loads(js_raw)
            except Exception as e:
                print(f"  idx={idx} jsonString 파싱 실패: {e}")
                continue
        else:
            js = js_raw

        if not isinstance(js, dict):
            continue

        name  = js.get('name', '')
        comps = js.get('@components', [])
        modified = False

        # foothold-5075_* 시각 엔티티 (파이프 스프라이트)
        if name.startswith('foothold-5075'):
            for c in comps:
                if 'TransformComponent' in c.get('@type', ''):
                    pos = c.get('Position', {})
                    y = pos.get('y', 0)
                    if close(y, OLD_LO_ENT, 0.6):
                        pos['y'] = NEW_LO_Y
                        modified = True
                        print(f"  {name}: Y {y:.3f}→{NEW_LO_Y}")
                    elif close(y, OLD_HI_ENT, 0.5):
                        pos['y'] = NEW_HI_Y
                        modified = True
                        print(f"  {name}: Y {y:.3f}→{NEW_HI_Y}")

        # 왼쪽 사다리 (object-223_1) → 단일 사다리로 통합
        elif name == 'object-223_1':
            for c in comps:
                if 'TransformComponent' in c.get('@type', ''):
                    old_y = c['Position']['y']
                    c['Position']['y'] = LADDER_CENTER
                    c['Scale']['y']    = LADDER_HEIGHT
                    modified = True
                    print(f"  {name}: Y {old_y:.3f}→{LADDER_CENTER:.2f}, scaleY→{LADDER_HEIGHT:.2f}")

        # 왼쪽 상단 사다리 제거
        elif name == 'object-165':
            to_remove_indices.append(idx)
            print(f"  {name}: 제거 예약")

        # 오른쪽 사다리 (Ladder_RightHi) → 단일 통합 + X=26.0
        elif name == 'Ladder_RightHi':
            for c in comps:
                if 'TransformComponent' in c.get('@type', ''):
                    old_y = c['Position']['y']
                    c['Position']['x'] = 26.0
                    c['Position']['y'] = LADDER_CENTER
                    c['Scale']['y']    = LADDER_HEIGHT
                    modified = True
                    print(f"  {name}: X→26.0, Y {old_y:.3f}→{LADDER_CENTER:.2f}, scaleY→{LADDER_HEIGHT:.2f}")

        # 오른쪽 하단 사다리 제거
        elif name == 'object-223_2':
            to_remove_indices.append(idx)
            print(f"  {name}: 제거 예약")

        # 맨홀
        elif name.startswith('Manhole_'):
            try:
                mi = int(name.split('_')[1])
            except:
                continue
            for c in comps:
                if 'TransformComponent' in c.get('@type', ''):
                    pos = c.get('Position', {})
                    old_y = pos.get('y', 0)
                    if 1 <= mi <= 4:
                        pos['y'] = 10.2
                        modified = True
                        print(f"  {name}: Y {old_y:.3f}→10.2")
                    elif 5 <= mi <= 8:
                        pos['y'] = 7.85
                        modified = True
                        print(f"  {name}: Y {old_y:.3f}→7.85")

        # map01 루트 → FootholdComponent
        elif name == 'map01':
            for c in comps:
                if 'FootholdComponent' in c.get('@type', ''):
                    fbl = c.get('FootholdsByLayer', {})
                    all_removed = set()
                    for layer_key, segs in fbl.items():
                        lnum = int(layer_key)
                        rem = process_foothold_layer(segs, lnum)
                        all_removed.update(rem)
                    fix_chain_links(fbl.get('1', []), all_removed)
                    modified = True
                    print(f"  map01 FootholdComponent 업데이트 완료")

        # 수정된 경우 jsonString이 문자열이었으면 다시 직렬화
        if modified and js_is_str:
            ent['jsonString'] = json.dumps(js, ensure_ascii=False)

    # 엔티티 제거 (역순)
    for i in sorted(set(to_remove_indices), reverse=True):
        rname = entities[i].get('jsonString', {})
        if isinstance(rname, str):
            try:
                rname = json.loads(rname).get('name', '?')
            except:
                rname = '?'
        elif isinstance(rname, dict):
            rname = rname.get('name', '?')
        del entities[i]
        print(f"  엔티티 '{rname}' 제거 완료")

    with open(MAP_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n✅ map01.map 업데이트 완료!")

if __name__ == '__main__':
    process()
