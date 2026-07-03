const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const uiPath = "ui/MafiaLobbyHUD.ui";
const b = UIBuilder.load(uiPath);

const GOLD = "#FFE0A8";
const GOLD_HOT = "#FFD04A";
const WHITE = "#FFFFFF";
const OUTLINE = "#1A0F08";
const TRANSPARENT_RUID = "00000000000000000000000000000000";

function outlineText(path, text, x, y, w, h, size, alignment = 4, color = GOLD) {
  b.text(path, text, {
    pos: [x, y],
    rect_size: [w, h],
    size,
    color,
    alignment,
    outline: true,
    outline_color: OUTLINE,
    outline_width: 1,
  });
  const t = b.getComponent(path, "MOD.Core.TextComponent");
  if (t) {
    t.Font = 1;
    t.Bold = true;
    t.MaxSize = Math.max(size + 12, 50);
  }
}

function transparentButton(path, x, y, w, h) {
  b.button(path, "", {
    pos: [x, y],
    rect_size: [w, h],
    image_ruid: TRANSPARENT_RUID,
    font_size: 1,
    color: "#FFFFFF",
  });
  const s = b.getComponent(path, "MOD.Core.SpriteGUIRendererComponent");
  if (s) {
    s.ImageRUID = { DataId: TRANSPARENT_RUID };
    s.Color = { r: 1, g: 1, b: 1, a: 0.01 };
    s.RaycastTarget = true;
  }
  const t = b.getComponent(path, "MOD.Core.TextComponent");
  if (t) {
    t.Font = 1;
    t.FontSize = 1;
    t.Text = "";
  }
}

function ensureButtonComponent(path) {
  if (!b.hasComponent(path, "MOD.Core.ButtonComponent")) {
    b.addComponent(path, "MOD.Core.ButtonComponent");
  }
  const s = b.getComponent(path, "MOD.Core.SpriteGUIRendererComponent");
  if (s) s.RaycastTarget = true;
}

ensureButtonComponent("CenterPanel/SettingsIcon");

outlineText("Settings/SettingsTitleLabel", "게임 설정", 0, 348, 420, 80, 48, 4, GOLD);

outlineText("Settings/BgmLabel", "배경음", -305, 236, 190, 62, 34, 3, GOLD);
outlineText("Settings/BgmValueText", "80", 320, 236, 90, 58, 30, 4, GOLD_HOT);
transparentButton("Settings/BgmTrackButton", 95, 236, 510, 86);

outlineText("Settings/SfxLabel", "효과음", -305, 121, 190, 62, 34, 3, GOLD);
outlineText("Settings/SfxValueText", "70", 320, 121, 90, 58, 30, 4, GOLD_HOT);
transparentButton("Settings/SfxTrackButton", 95, 121, 510, 86);

outlineText("Settings/InterfaceSizeLabel", "인터페이스 크기", -250, -20, 300, 62, 32, 3, GOLD);
outlineText("Settings/ResolutionValueText", "1920 × 1080", 75, -20, 280, 62, 34, 4, WHITE);
transparentButton("Settings/ResolutionPrevButton", -105, -20, 86, 110);
transparentButton("Settings/ResolutionNextButton", 260, -20, 86, 110);

outlineText("Settings/ScreenModeLabel", "화면 모드", -280, -185, 220, 62, 34, 3, GOLD);
outlineText("Settings/FullscreenModeText", "전체화면", -120, -185, 160, 70, 28, 4, GOLD_HOT);
outlineText("Settings/WindowModeText", "창모드", 45, -185, 140, 70, 28, 4, GOLD);
outlineText("Settings/BorderlessModeText", "테두리 없음", 215, -185, 180, 70, 26, 4, GOLD);
transparentButton("Settings/FullscreenModeButton", -120, -185, 160, 90);
transparentButton("Settings/WindowModeButton", 45, -185, 140, 90);
transparentButton("Settings/BorderlessModeButton", 215, -185, 180, 90);

outlineText("Settings/CloseButtonText", "닫기", -155, -329, 220, 90, 38, 4, WHITE);
outlineText("Settings/ApplyButtonText", "적용", 154, -329, 220, 90, 38, 4, WHITE);
transparentButton("Settings/CloseButton", -155, -329, 290, 118);
transparentButton("Settings/ApplyButton", 154, -329, 290, 118);
transparentButton("Settings/CloseXButton", 325, 330, 95, 95);

b.write(uiPath, { lint: false, strict: false });
