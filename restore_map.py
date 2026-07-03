import json, uuid

MAP_FILE = "map/map01.map"

with open(MAP_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

entities = data["ContentProto"]["Entities"]

# ── 1) FootholdsByLayer: 6개 방 + 처형 중앙 + 중간층 + 상단층 ──────────
for e in entities:
    js = e.get("jsonString", {})
    if isinstance(js, dict) and js.get("name") == "map01":
        for c in js.get("@components", []):
            if "FootholdComponent" in c.get("@type", ""):
                c["FootholdsByLayer"] = {
                    "1": [
                        # 하단 방 (Y=11.34) - 1유닛 갭으로 분리
                        # Room1 x=-5~-1  (플레이어 텔레포트 x=-3) ← 좌측 맵 경계까지 연장
                        {"Id": 1,  "StartPoint": {"x": -5.0, "y": 11.34}, "EndPoint": {"x": -1.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # Room2 x=0~3  (텔레포트 x=1)
                        {"Id": 2,  "StartPoint": {"x":  0.0, "y": 11.34}, "EndPoint": {"x":  3.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # Room3 x=4~7  (텔레포트 x=5)
                        {"Id": 3,  "StartPoint": {"x":  4.0, "y": 11.34}, "EndPoint": {"x":  7.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # 처형 중앙 x=8~20 (텔레포트 x=14, 넓은 중앙 무대)
                        {"Id": 4,  "StartPoint": {"x":  8.0, "y": 11.34}, "EndPoint": {"x": 20.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # Room4 x=21~24 (텔레포트 x=22)
                        {"Id": 5,  "StartPoint": {"x": 21.0, "y": 11.34}, "EndPoint": {"x": 24.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # Room5 x=25~28 (텔레포트 x=26)
                        {"Id": 6,  "StartPoint": {"x": 25.0, "y": 11.34}, "EndPoint": {"x": 28.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # Room6 x=29~33 (텔레포트 x=31) ← 우측 맵 경계까지 연장
                        {"Id": 7,  "StartPoint": {"x": 29.0, "y": 11.34}, "EndPoint": {"x": 33.0, "y": 11.34}, "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # 중간층 (Y=9.0) - 전체 폭, 자유이동
                        {"Id": 10, "StartPoint": {"x": -5.0, "y":  9.0},  "EndPoint": {"x": 34.0, "y":  9.0},  "PreviousFootholdId": 0, "NextFootholdId": 0},
                        # 상단층 (Y=6.7) - 전체 폭, 집 배치용
                        {"Id": 11, "StartPoint": {"x": -5.0, "y":  6.7},  "EndPoint": {"x": 34.0, "y":  6.7},  "PreviousFootholdId": 0, "NextFootholdId": 0},
                    ]
                }
                print("FootholdsByLayer 복구 완료 (6-room structure)")

# ── 2) 맨홀 엔티티 복구 (6개) ─────────────────────────────────────────
MANHOLE_RUID = "370cd781495145f6a03e2a74f4546278"
manholes = [
    # (이름,    방 중심 X, 맨홀 스프라이트 Y)
    ("Manhole_1",  -3, 10.4),   # Room1 (x=-5~-1, center -3)
    ("Manhole_2",   1, 10.4),   # Room2 (x=0~3,   center 1)
    ("Manhole_3",   5, 10.4),   # Room3 (x=4~7,   center 5)
    ("Manhole_4",  22, 10.4),   # Room4 (x=21~24, center 22)
    ("Manhole_5",  26, 10.4),   # Room5 (x=25~28, center 26)
    ("Manhole_6",  31, 10.4),   # Room6 (x=29~33, center 31)
]
for name, x, y in manholes:
    path = f"/maps/map01/{name}"
    if any(e.get("path") == path for e in entities):
        print(f"{name} 이미 존재 - 스킵")
        continue
    entities.append({
        "id": str(uuid.uuid4()),
        "path": path,
        "componentNames": "MOD.Core.TransformComponent,MOD.Core.SpriteRendererComponent",
        "jsonString": {
            "name": name,
            "path": path,
            "nameEditable": True,
            "enable": True,
            "visible": True,
            "localize": False,
            "displayOrder": 0,
            "@components": [
                {"@type": "MOD.Core.TransformComponent",
                 "Position": {"x": x, "y": y, "z": 0},
                 "Rotation": {"x": 0, "y": 0, "z": 0, "w": 1},
                 "Scale": {"x": 0.5, "y": 0.5, "z": 1}},
                {"@type": "MOD.Core.SpriteRendererComponent",
                 "SpriteRUID": MANHOLE_RUID,
                 "SortingLayer": "MapLayer0",
                 "OrderInLayer": 0}
            ],
            "@version": 1
        }
    })
print("맨홀 복구 완료 (6개)")

# ── 3) 사다리 엔티티 복구 ───────────────────────────────────────────────
LADDER_RUID = "3c27d709e41f49ccac840b051210ff73"

# 방→중간층 짧은 사다리 (Y=9.0~11.34, 높이=2.34, 중심Y=10.17)
room_ladders = [
    ("Ladder_R1",  -3.0),   # Room1 center
    ("Ladder_R2",   1.0),   # Room2 center
    ("Ladder_R3",   5.0),   # Room3 center
    ("Ladder_Exec", 14.0),  # 처형 중앙
    ("Ladder_R4",  22.0),   # Room4 center
    ("Ladder_R5",  26.0),   # Room5 center
    ("Ladder_R6",  31.0),   # Room6 center
]
for name, x in room_ladders:
    path = f"/maps/map01/{name}"
    if any(e.get("path") == path for e in entities):
        print(f"{name} 이미 존재 - 스킵")
        continue
    entities.append({
        "id": str(uuid.uuid4()),
        "path": path,
        "componentNames": "MOD.Core.TransformComponent,MOD.Core.SpriteRendererComponent,MOD.Core.LadderRopeComponent",
        "jsonString": {
            "name": name,
            "path": path,
            "nameEditable": True,
            "enable": True,
            "visible": True,
            "localize": False,
            "displayOrder": 0,
            "@components": [
                {"@type": "MOD.Core.TransformComponent",
                 "Position": {"x": x, "y": 10.17, "z": 0},
                 "Rotation": {"x": 0, "y": 0, "z": 0, "w": 1},
                 "Scale": {"x": 0.3, "y": 2.34, "z": 1}},
                {"@type": "MOD.Core.SpriteRendererComponent",
                 "SpriteRUID": LADDER_RUID,
                 "SortingLayer": "MapLayer0",
                 "OrderInLayer": 0},
                {"@type": "MOD.Core.LadderRopeComponent",
                 "IsLadder": True,
                 "Enable": True}
            ],
            "@version": 1
        }
    })
print("방→중간층 사다리 복구 완료")

# 중간층→상단층 외부 사다리 (Y=6.7~9.0, 높이=2.3, 중심Y=7.85)
outer_ladders = [
    ("Ladder_OutLeft",  -4.5),  # 좌측 외부
    ("Ladder_OutRight",  33.0), # 우측 외부
]
for name, x in outer_ladders:
    path = f"/maps/map01/{name}"
    if any(e.get("path") == path for e in entities):
        print(f"{name} 이미 존재 - 스킵")
        continue
    entities.append({
        "id": str(uuid.uuid4()),
        "path": path,
        "componentNames": "MOD.Core.TransformComponent,MOD.Core.SpriteRendererComponent,MOD.Core.LadderRopeComponent",
        "jsonString": {
            "name": name,
            "path": path,
            "nameEditable": True,
            "enable": True,
            "visible": True,
            "localize": False,
            "displayOrder": 0,
            "@components": [
                {"@type": "MOD.Core.TransformComponent",
                 "Position": {"x": x, "y": 7.85, "z": 0},
                 "Rotation": {"x": 0, "y": 0, "z": 0, "w": 1},
                 "Scale": {"x": 0.3, "y": 2.3, "z": 1}},
                {"@type": "MOD.Core.SpriteRendererComponent",
                 "SpriteRUID": LADDER_RUID,
                 "SortingLayer": "MapLayer0",
                 "OrderInLayer": 0},
                {"@type": "MOD.Core.LadderRopeComponent",
                 "IsLadder": True,
                 "Enable": True}
            ],
            "@version": 1
        }
    })
print("외부 사다리 복구 완료")

with open(MAP_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"저장 완료 - 총 엔티티: {len(entities)}")
