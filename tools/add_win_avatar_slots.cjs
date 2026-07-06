const { UIBuilder } = require("../.agents/skills/msw-ui-system/scripts/msw_ui_builder.cjs");

const COSTUME = "MOD.Core.CostumeManagerComponent";
const AVATAR = "MOD.Core.AvatarGUIRendererComponent";

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

function applySlots(uiPath, rootName) {
  const ui = UIBuilder.load(uiPath);

  for (let i = 1; i <= 8; i += 1) {
    const avatarPath = `WinnerAvatar${i}`;
    ui.avatar(avatarPath, {
      anchor: "middle-center",
      pos: [0, -260],
      rect_size: [125, 190],
      preserve_avatar: 1,
      flip_x: false,
      play_rate: 1,
      raycast: false,
      enable: false,
    });
    ui.upsertComponent(avatarPath, COSTUME, costumeManager());
    ui.setComponentEnabled(avatarPath, AVATAR, false);
    ui.patch(avatarPath, {
      display_order: 20 + i,
      visible: true,
    });
  }

  ui.write(uiPath, { lint: true, strict: true });
  console.log(`[win-avatar-slots] updated ${rootName}: ${uiPath}`);
}

applySlots("ui/MafiaMafiaWinHUD.ui", "MafiaMafiaWinHUD");
applySlots("ui/MafiaCitizenWinHUD.ui", "MafiaCitizenWinHUD");
