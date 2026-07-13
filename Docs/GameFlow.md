# 게임 화면 흐름 문서

마피아 게임의 화면(페이지) 전환 흐름을 정리한 문서. 코드(`IntroFlowController.mlua`, `Lobby/LobbyController.mlua`, `Mafia/MafiaUIFlow.mlua`)를 직접 읽고 확인한 내용이며, 실제 코드가 변경되면 이 문서도 함께 갱신되어야 한다 (`TEAM_RULES.md` 참고).

## 1. 시작 시 고정 인트로 시퀀스

게임 Play 시작부터 로비 진입까지는 항상 아래 순서로 고정되어 있다. 순서를 건너뛰는 조건(스킵)은 있어도 순서 자체는 바뀌지 않는다.

```
로고 (Logo) → 스토리 (Story) → 닉네임 설정 (Nickname) → 로비 (Lobby)
```

| 단계 | UI 파일 | 담당 스크립트 | 다음 단계로 넘어가는 조건 |
|---|---|---|---|
| 1. 로고 | `ui/UI_IntroSequence.ui` | `IntroSequenceController.mlua` | 로고 타임라인 종료 → `IntroFlowController:OnLogoFinished()` |
| 2. 스토리 | `ui/UI_StorySequence.ui` | `StorySequenceController.mlua` | 이미 본 유저는 스킵(DataStorage `IntroProgress` 키) / 스토리 종료 또는 스킵 버튼 → `OnStoryFinished()` |
| 3. 닉네임 설정 | `ui/UI_NicknameSetup.ui` | `NicknameSetupController.mlua` | 닉네임이 이미 저장돼 있으면(2자 이상, `nickname_set_v1=true`) 스킵 / 확인 버튼 → `OnNicknameSetupFinished()` |
| 4. 로비 | `ui/UI_Lobby.ui` | `Lobby/LobbyController.mlua` | (최종 단계) |

전체 흐름을 오케스트레이션하는 서버 로직은 `RootDesk/MyDesk/IntroFlowController.mlua` (`@Logic`) 하나다. 각 단계 진입/이탈 시 이전 UI를 `SetEnable(false)`로 끄고 다음 UI를 켜는 방식.

## 2. 로비 버튼 → 이동 페이지 매핑

로비의 버튼들은 전부 `ui/UI_Lobby.ui`의 `/ui/UI_Lobby/LobbyRoot/ButtonGroup/<이름>` 경로에 있고, `Lobby/LobbyController.mlua`의 `WireButtonEvents()`에서 클릭 이벤트를 연결한다.

| 버튼(한글 표시명) | 버튼 엔티티 경로 | 클릭 핸들러 메서드 | 이동/오픈 대상 |
|---|---|---|---|
| 프로필 설정 | `/ui/UI_Lobby/LobbyRoot/ProfileRoot/ProfileButton` | `OnProfileClicked` → `OpenProfileModal()` | `ui/UI_Lobby.ui` 내부 모달 (`modalGroup`, 별도 파일 아님) |
| 친구 | `ButtonGroup/친구` | `OnFriendClicked` → `OpenExternalPopup("FriendPopup")` | `ui/UI_Lobby.ui` 내부 팝업 (별도 파일 아님) |
| 도감 | `ButtonGroup/도감` | `OnCodexClicked` → `OpenCollectionPopup` | `ButtonGroup/CollectionPopup` UI 골격 존재, 도감 버튼으로 열기 구현, 상단 `CloseBtn`/하단 `BottomCloseBtn` 닫기 구현. 역할도감·의상도감 내부 기능은 아직 미구현 |
| 가방 | `ButtonGroup/가방` | `OnBagClicked` | `ui/UI_Lobby.ui` 내부 팝업 골격 (`ButtonGroup/BagPopup`) — 기능/오픈 연결은 아직 미구현 |
| 업적 | `ButtonGroup/업적` | `OnAchievementClicked` | `ui/UI_AchievementPopup.ui` (`QAAchievementUI` 컴포넌트) |
| 상점 | `ButtonGroup/상점` | `OnShopClicked` → `OpenExternalPopup("ShopPopup")` | `ui/UI_Lobby.ui` 내부 팝업 (별도 파일 아님) |
| 알림 | `ButtonGroup/알림` | `OnAlertClicked` → `OpenExternalPopup("AlertPopup")` | `ui/UI_Lobby.ui` 내부 팝업 (별도 파일 아님) |
| 설정 | `ButtonGroup/설정` | `OnSettingsClicked` | `ui/UI_Lobby.ui` 내부 팝업 (`SettingsPopup`, 별도 파일 아님) |
| 수사방 찾기 | `ButtonGroup/찾기` | `OnFindRoomClicked` → `OpenFindRoomModal()` | `ui/UI_InvestigationRoomSearch.ui` (`SearchRoot`) |
| 수사방 만들기 | `ButtonGroup/방만들기` | `OnCreateRoomClicked` → `OpenCreateRoomModal()` | 생성 폼은 `ui/UI_Lobby.ui` 내부 모달 → 제출 성공 시 `MafiaUIFlow:OpenLobbyAfterRoomCreated()` 호출 → **`ui/MafiaLobbyHUD.ui`** 로 이동 |
| 바로 게임화면 (start) | `ButtonGroup/start` | `OnStartClicked` → `OpenMatchmakingModal()` + `QuickJoinRoom()` | 매칭 대기 모달은 `ui/UI_Lobby.ui` 내부 → 참가 성공 시 `LobbyController:EnterInvestigationRoomLobby()` → `MafiaUIFlow:EnterRoomLobby()` 호출 → **`ui/MafiaLobbyHUD.ui`** 로 이동 |

**핵심 포인트**: "수사방 만들기"와 "바로 게임화면(start)"은 서로 다른 진입 경로(방 생성 vs 빠른 참가)를 거치지만 **최종적으로 같은 화면인 `ui/MafiaLobbyHUD.ui`(수사방 대기실)로 합류**한다. 이후 실제 낮/밤 게임 진행 화면(`MafiaDayHUD.ui`, `MafiaNightHUD.ui` 등)으로의 전환은 `Mafia/MafiaGameLogic.mlua`가 관리하며, 이 부분의 순서/조건(룰)은 별도로 정의해서 아래 3번 섹션에 채울 예정이다.

## 3. 게임 진행 중 화면 전환 (작성 예정)

낮/밤/회의/투표 등 게임 진행 중 화면 전환 순서와 분기 조건(룰)은 아직 이 문서에 정리되지 않았다. 정의되는 대로 이 섹션에 다이어그램 또는 표로 추가한다.

- 관련 파일: `RootDesk/MyDesk/Mafia/MafiaGameLogic.mlua` (페이즈 전환 로직), `RootDesk/MyDesk/Mafia/MafiaUIFlow.mlua` (HUD 전환)
- TODO: 페이즈 순서, 각 페이즈 진입/종료 조건, 스킵 규칙 정리

## 문서 갱신 규칙

**팀원이 화면 전환/연결을 추가하거나 변경할 때는 반드시 이 문서를 함께 업데이트한다.** 코드만 바뀌고 문서가 안 바뀌면, 다른 팀원이 어떤 버튼이 어디로 연결되는지 코드를 처음부터 다시 추적해야 한다. 상세 규칙은 `TEAM_RULES.md` 참고.
