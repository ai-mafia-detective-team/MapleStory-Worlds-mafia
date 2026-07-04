const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const UI_PATH = "ui/MafiaLobbyHUD.ui";
const COSTUME = "MOD.Core.CostumeManagerComponent";

function costumeManager() {
  return {
    "@type": COSTUME,
    CustomBodyEquip: "",
    CustomCapeEquip: "",
    CustomCapEquip: "",
    CustomCoatEquip: "",
    CustomEarAccessoryEquip: "",
    CustomEarEquip: "",
    CustomEyeAccessoryEquip: "",
    CustomFaceAccessoryEquip: "",
    CustomFaceEquip: "",
    CustomGloveEquip: "",
    CustomHairEquip: "",
    CustomLongcoatEquip: "",
    CustomOneHandedWeaponEquip: "",
    CustomPantsEquip: "",
    CustomShoesEquip: "",
    CustomSubWeaponEquip: "",
    CustomTwoHandedWeaponEquip: "",
    DefaultEquipUserId: "",
    UseCustomEquipOnly: false,
    Enable: false,
  };
}

const ui = UIBuilder.load(UI_PATH);
for (let i = 1; i <= 8; i += 1) {
  const room = `RoomBadge${i}`;
  const avatar = `${room}/PlayerAvatar`;
  ui.avatar(avatar, {
    anchor: "middle-center",
    pos: [0, -30],
    rect_size: [150, 215],
    preserve_avatar: 1,
    flip_x: i >= 5,
    play_rate: 1,
    raycast: false,
    enable: false,
  });
  ui.upsertComponent(avatar, COSTUME, costumeManager());
  ui.setComponentEnabled(avatar, "MOD.Core.AvatarGUIRendererComponent", false);
  ui.patch(avatar, { display_order: 2 });
  ui.patch(`${room}/Text`, {
    anchor: "top-center",
    pos: [0, -30],
    rect_size: [680, 42],
    display_order: 3,
  });
}
ui.write(UI_PATH, { lint: true, strict: true });
