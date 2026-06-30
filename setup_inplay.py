import json, uuid

MAP_FILE = "map/map01.map"
DAY_RUID  = "b003763559034446895a348c44bb3a04"
NIGHT_RUID = "1a0fc7982a1e48a8b96d0f8bc01df2c7"

with open(MAP_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

entities = data["ContentProto"]["Entities"]

# 1) 낮 배경 복구 (Background → day RUID)
for e in entities:
    js = e.get("jsonString", {})
    if isinstance(js, dict) and js.get("name") == "Background":
        for c in js.get("@components", []):
            if "BackgroundComponent" in c.get("@type", ""):
                c["WebUrl"] = DAY_RUID
                c["Type"] = 3
                js["enable"] = True
                print("낮 배경 복구 완료")

# 2) 밤 배경 엔티티 추가 (처음엔 비활성)
NIGHT_PATH = "/maps/map01/NightBackground"
if not any(e.get("path") == NIGHT_PATH for e in entities):
    entities.append({
        "id": str(uuid.uuid4()),
        "path": NIGHT_PATH,
        "componentNames": "MOD.Core.BackgroundComponent",
        "jsonString": {
            "name": "NightBackground",
            "path": NIGHT_PATH,
            "nameEditable": True,
            "enable": False,
            "visible": True,
            "localize": False,
            "displayOrder": 0,
            "@components": [
                {
                    "@type": "MOD.Core.BackgroundComponent",
                    "TemplateRUID": "f9e546932b014c0e867365a796c8dc91",
                    "Type": 3,
                    "WebUrl": NIGHT_RUID,
                    "Enable": True
                }
            ],
            "@version": 1
        }
    })
    print("NightBackground 엔티티 추가 완료")
else:
    print("NightBackground 이미 존재")

with open(MAP_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"맵 저장 완료 - 총 엔티티: {len(entities)}")
