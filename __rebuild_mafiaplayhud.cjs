// MafiaPlayHUD.ui 전체 재생성 (던전 배경 포함)
// - CenterPanel: 560×1040 중앙 HUD (채팅, 페이즈, 투표 등)
// - RoomBadge1~4: 왼쪽 방 패널 640×250 (던전 배경 + 라벨)
// - RoomBadge5~8: 오른쪽 방 패널 640×250 (던전 배경 + 라벨)

process.chdir("C:/Users/dlwlrjs/메이플 마피아");
const { UIBuilder } = require(
    "C:/Users/dlwlrjs/메이플 마피아/.claude/skills/msw-ui-system/scripts/msw_ui_builder.cjs"
);

const UI_PATH   = "ui/MafiaPlayHUD.ui";
const MLUA_PATH = "RootDesk/MyDesk/UI/MafiaPlayHUD.mlua";

// 방별 던전 배경 RUID
const DUNGEON_RUIDS = [
    '841120993e0c41e19e4e5a2f65297eb7',  // 방1
    '0e6b5b9b85dc4f35a5c466fdf86b43a2',  // 방2
    '97459cdd4cdc497e85e44c1c2a2b9a6c',  // 방3
    '6e03242875724f3dbabf489626f926f1',  // 방4
    'a8d2a0caf35544e7a33b11ea223f6e32',  // 방5
    'c5e58bc64ff140e59101414ff64b241c',  // 방6
    '2fdf0049fd1f4c20bfbeb46f4702f9ee',  // 방7
    '3da3b8a0f6894975bf1f5712566c4537',  // 방8
];

const ROOM_W   = 630;   // 화면 절반(960)에서 센터패널(280)을 빼면 680 여유
const ROOM_H   = 248;   // 4개가 1080px에 들어가도록 (4*248+4*22=1080 ≈ OK)
const Y_TOP    = [385, 125, -135, -395];  // 위→아래

const b = new UIBuilder("MafiaPlayHUD", 20, true);

// ─────────────────────────────────────────────────────────────
// [A] CenterPanel  560 × 1040  (중앙 HUD)
// ─────────────────────────────────────────────────────────────
b.panel("CenterPanel", {
    anchor: "middle-center", pos: [0, 0], rect_size: [560, 1040],
});
b.panel("CenterPanel/Bg", { anchor: "stretch", pos: [0, 0] });

// 제목 / 상태
b.text("CenterPanel/RoomInfoText", "커닝시티 마피아", {
    anchor: "top-center", pos: [0, -30], rect_size: [520, 50],
    size: 28, bold: true, color: "#FFFFFF", alignment: 4,
});
b.text("CenterPanel/PlayerCountText", "플레이어 0/8", {
    anchor: "top-center", pos: [0, -88], rect_size: [520, 44],
    size: 22, color: "#BBBBBB", alignment: 4,
});
b.text("CenterPanel/DayText", "1일차", {
    anchor: "top-left", pos: [30, -138], rect_size: [200, 44],
    size: 24, bold: true, color: "#FFEE55", alignment: 3,
});
b.text("CenterPanel/TimerText", "05:00", {
    anchor: "top-right", pos: [-30, -138], rect_size: [160, 44],
    size: 24, bold: true, color: "#FF8844", alignment: 5,
});
b.text("CenterPanel/PhaseTitleText", "낮 토론", {
    anchor: "top-center", pos: [0, -192], rect_size: [520, 54],
    size: 30, bold: true, color: "#FFFFFF", alignment: 4,
});
b.text("CenterPanel/PhaseDescriptionText", "게임 진행 중입니다.", {
    anchor: "top-center", pos: [0, -255], rect_size: [520, 44],
    size: 18, color: "#CCCCCC", alignment: 4,
});

// 채팅 로그 (중앙 상단~중간)
b.text("CenterPanel/ChatLogText", "채팅 로그가 표시됩니다.", {
    anchor: "middle-center", pos: [0, 120], rect_size: [520, 280],
    size: 17, color: "#DDDDDD", alignment: 0, overflow: 0,
});

// 투표 현황 (중앙 하단부)
b.text("CenterPanel/VoteStatusText", "0/8 투표", {
    anchor: "middle-center", pos: [0, -145], rect_size: [520, 46],
    size: 26, bold: true, color: "#FFCC44", alignment: 4,
});
b.text("CenterPanel/VoteHintText", "아직 투표한 플레이어가 없습니다.", {
    anchor: "middle-center", pos: [0, -198], rect_size: [520, 40],
    size: 17, color: "#AAAAAA", alignment: 4,
});

// 채팅 입력 + 전송 버튼
b.textInput("CenterPanel/ChatInput", {
    placeholder: "채팅을 입력하세요...", char_limit: 100,
    anchor: "bottom-center", pos: [-60, 22], rect_size: [380, 54],
    font_size: 19, color: "#111111",
});
b.button("CenterPanel/ChatSendButton", "전송", {
    anchor: "bottom-right", pos: [-30, 22], rect_size: [110, 54],
    font_size: 20, color: "#FFFFFF",
});

// 스킵 버튼
b.button("CenterPanel/SkipButton", "스킵", {
    anchor: "bottom-center", pos: [0, 86], rect_size: [200, 54],
    font_size: 22, color: "#FFFFFF",
});

// ─────────────────────────────────────────────────────────────
// [B] RoomBadge1~8  (던전 배경 패널)
// ─────────────────────────────────────────────────────────────
for (let i = 0; i < 8; i++) {
    const name   = `RoomBadge${i + 1}`;
    const isLeft = i < 4;
    const anchor = isLeft ? "middle-left" : "middle-right";
    const xSign  = isLeft ? 1 : -1;
    const xMargin = xSign * 10;
    const y      = Y_TOP[i % 4];
    const label  = `${i + 1}방`;

    // 패널 컨테이너
    b.panel(name, {
        anchor: anchor,
        pos:      [xMargin, y],
        rect_size: [ROOM_W, ROOM_H],
    });

    // ① 던전 배경 (맨 뒤, display_order=0)
    b.sprite(`${name}/DungeonBg`, {
        anchor:     "stretch",
        pos:        [0, 0],
        image_ruid: DUNGEON_RUIDS[i],
    });
    b.patch(`${name}/DungeonBg`, { display_order: 0 });

    // ② 반투명 다크 오버레이 — sprite 타입은 SpriteGUIRendererComponent 포함 (display_order=5)
    b.sprite(`${name}/Bg`, {
        anchor: "stretch", pos: [0, 0],
        image_ruid: "",  // 빈 RUID: Color 틴트만 사용
    });
    b.patchComponent(`${name}/Bg`, "MOD.Core.SpriteGUIRendererComponent", {
        Color: { r: 0.0, g: 0.0, b: 0.0, a: 0.45 },
    });
    b.patch(`${name}/Bg`, { display_order: 5 });

    // ③ 방 번호 라벨 텍스트 (display_order=6)
    b.text(`${name}/Text`, label, {
        anchor:    "middle-center",
        pos:       [0, 0],
        rect_size: [ROOM_W - 20, 46],
        size:      32, bold: true, color: "#FFFFFF", alignment: 4,
    });
    b.patch(`${name}/Text`, { display_order: 6 });

    console.log(`[OK] ${name}  ${isLeft ? "좌" : "우"}  Y=${y}`);
}

// ─────────────────────────────────────────────────────────────
// Write + .mlua UUID 자동 바인딩
// ─────────────────────────────────────────────────────────────
b.write(UI_PATH, {
    bind: {
        mlua: MLUA_PATH,
        props: {
            roomInfoText:         "CenterPanel/RoomInfoText",
            playerCountText:      "CenterPanel/PlayerCountText",
            phaseTitleText:       "CenterPanel/PhaseTitleText",
            phaseDescriptionText: "CenterPanel/PhaseDescriptionText",
            dayText:              "CenterPanel/DayText",
            timerText:            "CenterPanel/TimerText",
            chatLogText:          "CenterPanel/ChatLogText",
            voteStatusText:       "CenterPanel/VoteStatusText",
            voteHintText:         "CenterPanel/VoteHintText",
            chatInput:            "CenterPanel/ChatInput",
            chatSendButton:       "CenterPanel/ChatSendButton",
            skipButton:           "CenterPanel/SkipButton",
        },
    },
});

console.log("\n[Done] MafiaPlayHUD.ui 재생성 완료 (던전 배경 포함)");
b.printEntities();
