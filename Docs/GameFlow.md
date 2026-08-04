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
| 가방 | `ButtonGroup/가방` | `OnBagClicked` → `OpenBagPopup()` | `ButtonGroup/BagPopup` UI 골격 존재. 가방 버튼으로 열기 구현, 상단 `CloseBtn`/하단 `BottomCloseBtn` 닫기 구현. 카테고리·아이템 선택·착용 등 내부 기능은 미구현 |
| 업적 | `ButtonGroup/업적` | `OnAchievementClicked` | `ui/UI_AchievementPopup.ui` (`QAAchievementUI` 컴포넌트) |
| 상점 | `ButtonGroup/상점` | `OnShopClicked` → `OpenExternalPopup("ShopPopup")` | `ui/UI_Lobby.ui` 내부 팝업 (별도 파일 아님) |
| 알림 | `ButtonGroup/알림` | `OnAlertClicked` → `OpenExternalPopup("AlertPopup")` | `ui/UI_Lobby.ui` 내부 팝업 (별도 파일 아님) |
| 설정 | `ButtonGroup/설정` | `OnSettingsClicked` | `ui/UI_Lobby.ui` 내부 팝업 (`SettingsPopup`, 별도 파일 아님) |
| 수사방 찾기 | `ButtonGroup/찾기` | `OnFindRoomClicked` → `OpenFindRoomModal()` | `ui/UI_InvestigationRoomSearch.ui` (`SearchRoot`) |
| 수사방 만들기 | `ButtonGroup/방만들기` | `OnCreateRoomClicked` → `OpenCreateRoomModal()` | 생성 성공 시 현재 Static Room에서 `roomId`별 논리 게임 인스턴스를 만들고 `MafiaRoomTransitionHUD` 뒤에서 `MafiaLobbyHUD`를 표시 |
| 바로 게임화면 (start) | `ButtonGroup/start` | `OnStartClicked` → `OpenMatchmakingModal()` + `QuickJoinRoom()` | 참가 성공 시 현재 Static Room에서 기존 `roomId`의 논리 게임 인스턴스에 연결하고 `MafiaRoomTransitionHUD` 뒤에서 `MafiaLobbyHUD`를 표시 |

**핵심 포인트**: "수사방 만들기"와 "바로 게임화면(start)"은 서로 다른 Registry 경로를 거치지만 최종적으로 같은 `MafiaLobbyHUD`로 합류한다. 서버는 인증된 사용자가 Registry 방의 멤버인지 확인한 뒤 `roomId`별 `MafiaRoomGameLogic` 컴포넌트에 사용자를 연결한다. 사용자는 `map01`의 Static Room에 계속 머물며 `map02` 또는 Instance Room으로 이동하지 않는다. 생성·참가·퇴장 화면 전환은 `MafiaRoomTransitionHUD`가 가린다. 목적 `MafiaLobbyHUD`가 준비되면 이를 먼저 완전 불투명하게 유지하고 전환 HUD만 위에서 페이드아웃하므로 중간 합성 알파 틈으로 `map01`이 노출되지 않는다.

실제 나가기에서는 Registry와 논리 방 멤버십을 먼저 정리한다. 마지막 참가자라면 해당 `roomId`의 런타임 게임 엔티티도 제거하며, 클라이언트는 재부팅 없이 같은 Static Room에서 `UI_Lobby`를 복원한다. 최초 실행의 `로고 → 스토리 → 닉네임 → 로비` 순서는 그대로 유지된다.

게임 종료 후 같은 방에서 재경기를 선택하면 `MafiaGameLogic:ResetRoundState()`를 사용해 기존 참가자 명단과 방 설정을 유지한 채 라운드 상태만 초기화한다. 반대로 종료된 방 뒤에 새 수사방을 생성할 때는 `InvestigationRoomManager`가 `MafiaGameLogic:ResetRoomState()`를 호출해 이전 방 참가자 명단과 방 설정을 먼저 제거한다. 따라서 이전 방 사용자가 새 방의 슬롯·준비 상태에 남거나 새 방으로 이동되는 것을 방지한다.

## 2.1 수사방 대기실 → 메인 로비 복귀

| 현재 화면 | 버튼 엔티티 경로 | 클릭 핸들러 메서드 | 이동/오픈 대상 |
|---|---|---|---|
| `ui/MafiaLobbyHUD.ui` | `/ui/MafiaLobbyHUD/CenterPanel/InviteButton` | `MafiaUIFlow:HandleLobbyExit()` → `InvestigationRoomManager:LeaveRoom(roomId)` | 중복 입력을 잠근 뒤 Registry와 논리 방 멤버십을 정리하고, 같은 Static Room에서 `MafiaRoomTransitionHUD` 뒤의 `UI_Lobby`를 복원 |

## 3. 게임 진행 중 화면 전환

수사방 대기실(`MafiaLobbyHUD`)에 들어온 뒤부터 승패가 갈릴 때까지의 진행 규칙. 모든 판정은 **서버**의 방별 `Mafia/MafiaRoomGameLogic.mlua`(`@Component`)에서 이뤄진다. 전역 `Mafia/MafiaGameLogic.mlua`(`@Logic`)은 인증된 사용자의 `roomId`에 요청을 전달하고 해당 방 상태를 클라이언트 UI용으로 미러링한다. 클라이언트 `Mafia/MafiaUIFlow.mlua`는 `CurrentPhase`를 읽어 HUD만 전환하며 페이즈를 바꾸지 못한다.

### 3.1 페이즈 정의

| 값 | 상수 | 화면 이름 | 지속 시간 프로퍼티 | 기본값 |
|:-:|---|---|---|:-:|
| 0 | `PHASE_LOBBY` | 수사방 대기실 | — (타이머 없음) | — |
| 1 | `PHASE_FREE_ROAM` | 낮 토론 | `FREE_ROAM_TIME` | 60초 |
| 2 | `PHASE_NIGHT` | 밤 | `NIGHT_TIME` | 10초 |
| 3 | `PHASE_MORNING` | 아침 (밤 결과 발표) | `MORNING_TIME` | 3초 |
| 4 | `PHASE_MEETING` | 투표 | `MEETING_TIME` | 15초 |
| 5 | `PHASE_MEETING_RESULT` | 처형 결과 | `RESULT_TIME` | 5초 |
| 6 | `PHASE_GAME_OVER` | 승리 화면 | `0.0` (정지) | — |

> 위 지속 시간은 현재 테스트용 짧은 값으로 보인다(추정). 밸런스 확정 시 이 표와 `MafiaGameLogic`의 프로퍼티를 함께 갱신한다.

### 3.2 전환 순서

```
LOBBY
  └─(전원 준비 완료 → 3초 카운트다운)→ FREE_ROAM(1일차)
                                          │
        ┌─────────────────────────────────┘
        ▼
    FREE_ROAM ─(타이머 만료 or 생존자 전원 스킵)→ MEETING
                                                    │
                                                    ▼
                              MEETING ─(타이머 만료 or 생존자 전원 투표)→ MEETING_RESULT
                                                                             │
                                          ┌──────(승리 조건 성립)────────────┤
                                          ▼                                 ▼ (미성립)
                                     GAME_OVER                            NIGHT
                                                                            │
                                                                            ▼
                                                                        MORNING
                                                                            │
                                                            (DayCount +1)   ▼
                                                                        FREE_ROAM ─┐
                                                                                   │
                                                                    (루프 반복) ◀──┘
```

**핵심**: 게임은 **밤이 아니라 낮 토론으로 시작한다**. `StartGame()`이 곧바로 `FREE_ROAM`으로 보내고, `NIGHT`은 첫 투표 결과(`MEETING_RESULT`)에서 승부가 나지 않았을 때 비로소 처음 등장한다. 즉 1일차에는 밤 능력 사용 없이 토론과 투표부터 한다.

타이머는 서버 `OnUpdate`에서 `InternalTimer`를 델타만큼 깎다가 0 이하가 되면 `OnPhaseEnd()`를 호출하는 구조다. `PhaseTimer`(@Sync)는 그 값을 클라이언트에 그대로 미러링한 것이고, HUD의 카운트다운 숫자는 이 값을 읽는다.

### 3.3 페이즈별 진입/종료 조건

| 페이즈 | 진입 시 서버가 하는 일 | 다음 페이즈로 넘어가는 조건 | 다음 페이즈 |
|---|---|---|---|
| `LOBBY` | `EnterRoomLobby()`로 등록된 사용자에게 빈 방 번호 배정 + 해당 `RoomSpawn_N`으로 텔레포트 | **대기실 등록 사용자 전원이 준비 완료** → 3초 카운트다운 → `StartGame()`. 카운트다운 중 준비 해제·신규 입장·퇴장·접속 종료로 명단/준비 상태가 바뀌면 기존 카운트다운을 취소 | `FREE_ROAM` |
| `FREE_ROAM` | 스킵 상태 초기화, `DayCount` +1 (첫 진입은 `StartGame`에서 1로 설정) | 타이머 만료 **또는** 생존자 전원이 스킵 버튼을 눌렀을 때(`RequestSkipToMeeting`) | `MEETING` |
| `MEETING` | 투표 집계 초기화(생존자만 후보), `ExecuteTarget` 비움 | 타이머 만료 **또는** 생존자 전원이 투표 제출 완료(`AllVoted`) | `MEETING_RESULT` |
| `MEETING_RESULT` | 최다 득표자 처형 판정 후 사망 처리 | 타이머 만료 → `CheckWinAndContinue()` 승리 판정 | `GAME_OVER` 또는 `NIGHT` |
| `NIGHT` | 마피아/경찰/의사 지목값 초기화, 전원을 각자 방으로 텔레포트 | 타이머 만료 | `MORNING` |
| `MORNING` | 밤 결과 판정(살해/보호), `MorningKilled`에 사망자 기록 | 타이머 만료 → 공통 승리 조건 재판정 | `GAME_OVER` 또는 `FREE_ROAM` |
| `GAME_OVER` | `WinnerRole` 확정 | **없음** — 지속 시간이 0이라 타이머가 돌지 않고 이 상태에서 멈춘다 | — |

### 3.4 게임 시작 조건 (LOBBY → FREE_ROAM)

`AllLobbyPlayersReady()`가 참이어야 3초 카운트다운이 시작된다. 조건은 세 가지가 모두 만족될 때다.

1. 접속자 수가 최소 인원 이상 — `MIN_PLAYERS = 6`. 단 **`DebugMode = true`이면 최소 1명**으로 완화된다(현재 기본값이 `true`).
2. 접속자 수가 `RoomMaxPlayers`(방 설정에서 6/7/8 중 선택, 기본 8) 이하.
3. 접속자 **전원**이 준비 완료 상태.

현재 경찰 행동 검증을 위해 `MafiaRoomGameLogic.DEBUG_FORCE_FIRST_HUMAN_ROLE = 2`가 적용되어 있다. `DebugMode`에서만 첫 실제 사용자를 경찰로 고정하며, 기존 역할 인원 구성을 유지하도록 무작위 배정 결과와 역할을 교환한다. 역할별 테스트가 모두 끝나면 이 값을 `-1`로 바꾸면 완전 무작위 역할 배정으로 돌아간다(`0=시민`, `1=마피아`, `2=경찰`, `3=의사`).

대기실 명단·인원·준비 표시는 `MafiaGameLogic`이 동기화하는 `LobbySeatOrder`, `LobbyPlayerCount`, `ReadyStatusList`, `ReadyCount`만 사용한다. 동기화 값이 비어 있어도 클라이언트가 `_UserService.Users` 전체를 대체 명단으로 표시하지 않으므로, 메인 로비에 머무는 사용자가 수사방 슬롯에 나타나지 않는다. 같은 사용자의 중복 `EnterRoomLobby()`·동일 준비값 요청은 상태를 중복 생성하지 않는다. 카운트다운 만료 순간에도 서버가 전원 준비 여부를 마지막으로 다시 검사한다.

`StartGame()` 시점의 처리 순서는 다음과 같다.

1. `DebugMode`면 `AddBots()` — 최대 인원까지 `Bot_1`…으로 채운다. 봇은 준비/투표/밤 행동을 하지 않으므로, 봇이 낀 판은 타이머 만료로만 페이즈가 넘어간다.
2. `AssignRoles()` — 마피아를 `MafiaPlayerCount`(방 설정 1~3, 기본 2)명 뽑고, 그다음 경찰 1명·의사 1명, 나머지는 전부 시민. 그 뒤 전체를 셔플한다.
3. `AssignRooms()` — 1~N번 방을 무작위로 배정하고 각자의 `RoomSpawn_N`으로 텔레포트.
4. 업적 이벤트 `GAME_PLAY`, `ROLE_ASSIGNED` 보고(봇 제외).
5. `SetPhase(FREE_ROAM, 10초)`.

**로딩 화면**: `LOBBY → FREE_ROAM` 최초 전환만 클라이언트에서 가로채서 `ui/MafiaLoadingHUD.ui`(역할 공개 화면)를 약 4초 띄우고 0.5초 페이드아웃한 뒤 `MafiaDayHUD`를 연다(`TriggerLoadingScreen`). 역할이 시민·의사·경찰이면 `BgSprite`, 마피아이면 `BgSprite_1` 배경만 표시한다. 하단 아바타는 월드 전체 접속자가 아니라 현재 수사방의 `RoleData`를 기준으로 로컬 플레이어와 같은 직업인 참가자만 표시한다. `CurrentPhase`가 `RoleData`보다 먼저 동기화되면 최대 3초 동안 역할 정보를 기다리고, 끝내 확인되지 않으면 기본 시민으로 오표시하거나 다른 직업 아바타를 노출하지 않는다. 이후의 페이즈 전환에는 로딩 화면이 끼지 않는다.

### 3.5 낮 토론 (FREE_ROAM)

- 화면: `ui/MafiaDayHUD.ui` — 제목 "낮 토론", 스킵 카운트(`n/전체`)가 이 페이즈에서만 표시된다.
- 방 슬롯 아바타는 `AlivePlayersList`를 기준으로 갱신한다. 투표 처형 또는 마피아 살해로 생존 목록에서 제외된 플레이어는 `LobbyAvatarArea` 전체를 숨기고, 각 `RoomBadge`에 편집기로 배치한 `Grave*` 묘비와 닉네임의 `(사망)` 표시로 교체한다. 묘비의 위치·크기·RUID는 편집기 설정을 그대로 보존하며 스크립트는 표시 여부만 제어한다. 묘비가 누락된 슬롯만 `RoomBadge1/Grave`를 런타임 복제하고, `Grave` 자체가 없는 이전 UI에서는 투표 패널의 기존 `Dead` 스프라이트를 예비 표시로 사용한다. 생존자 목록의 원본은 방별 `MafiaRoomGameLogic.AlivePlayersList` 하나이며, 목록이 바뀌면 해당 방의 실제 사용자 클라이언트로 전달해 `_MafiaGameLogic` 파사드와 낮 HUD를 즉시 갱신한다.
- 채팅 가능(서버 `SendChat`이 허용하는 페이즈는 `LOBBY`, `FREE_ROAM`, `MEETING` 셋뿐).
- 스킵: 스킵 버튼 → `RequestSkipToMeeting(userId)`. **생존자 전원이 스킵해야** 즉시 `MEETING`으로 넘어간다. 한 명이라도 안 누르면 타이머를 다 기다린다.

### 3.6 투표 (MEETING → MEETING_RESULT)

- 화면: `MafiaDayHUD` + 투표 패널 — 제목 "투표", 투표 현황(`n/전체`) 표시.
- 투표 진입 시 `VoteAnime/AnimeText_1`에 투표 시작 안내 문구 8종 중 하나를 매 라운드 무작위로 표시한 뒤 투표 패널을 연다.
- 처형 결과 `VoteAnime_1/2/3` 재생 중에는 `VoteResultDimBg`가 나머지 낮 HUD를 어둡게 덮고, 선택된 VoteAnime의 네 모서리 비네트(`vgBL/BR/TL/TR`)가 꼭지점 쉐딩을 만든다. UI 원본에서 중앙 100×100으로 계산되는 dim은 재생 직전에 런타임 전체 스트레치로 보정하며, dim과 결과 애니메이션은 함께 페이드인·아웃한다.
- `SubmitVote(voterId, targetId)`: 1인 1표, 재투표 불가. 대상은 **생존자만** 지정 가능하고, `targetId = ""`는 기권(스킵)으로 기록되되 득표수에는 반영되지 않는다.
- 생존자가 전원 투표를 마치면 타이머를 기다리지 않고 즉시 결과로 넘어간다.
- 처형 판정(`BeginMeetingResult`): 최다 득표자 1명을 처형한다. **동점이거나 유효 득표가 0이면 아무도 처형하지 않는다**(전원 기권 포함).
- 투표 처형 결과의 정체 공개는 **마피아만 마피아로 표시**한다. 시민·경찰·의사는 모두 `VoteAnime_2`에서 시민으로 표시하며, 실제 서버 역할 데이터는 변경하지 않는다.

### 3.7 승리 판정 (MEETING_RESULT·MORNING 종료 시점)

승리 조건 계산은 `EvaluateWinnerRole()` 한 곳에서 수행한다. 투표 처형 뒤에는 `CheckWinAndContinue()`가, 밤 결과 발표 뒤에는 `BeginFreeRoam()`이 같은 판정 함수를 호출한다. 따라서 아침 결과 연출은 정해진 시간만큼 보여준 뒤, 밤의 사망으로 승부가 결정됐다면 낮 토론이나 투표를 한 번 더 진행하지 않고 바로 `GAME_OVER`로 전환한다.

| 조건 | 결과 |
|---|---|
| 생존 마피아 = 0 | 시민 승리 → `GAME_OVER` (`WinnerRole = ROLE_CITIZEN`) |
| 생존 마피아 ≥ 생존 시민팀 | 마피아 승리 → `GAME_OVER` (`WinnerRole = ROLE_MAFIA`) |
| 그 외 | 게임 속행 → `NIGHT` |

"생존 시민팀"은 마피아가 아닌 전원(시민·경찰·의사)을 합산한 값이다. 접속 종료로 참가자가 제거될 때도 `CheckWinOnly()`가 같은 공통 판정을 사용하되, 승부가 나지 않았다면 현재 페이즈를 임의로 바꾸지 않는다.

### 3.8 밤 (NIGHT)

- 화면: `ui/MafiaNightHUD.ui`. 패널은 **로컬 플레이어의 역할에 따라** 하나만 열린다(마피아/경찰/의사). 시민은 지목 패널이 없다.
- `MafiaAction`·`PoliceAction`·`DoctorAction`과 함께 표시되는 `NightMsgText`는 35pt로 표시한다.
- 의사 패널의 8개 사망 오버레이는 각 카드 슬롯 내부의 `Dead_1`~`Dead_8`을 참조하며, `AlivePlayersList`에 없는 플레이어의 카드에만 표시한다.
- 행동 제출: `SubmitNightAction(actorId, targetRoom)` — 방 번호를 고르면 서버가 그 방의 플레이어를 찾아 역할별로 분기한다.

| 역할 | 처리 | 저장 |
|---|---|---|
| 마피아 | 살해 대상 지목 | `MafiaTarget` |
| 경찰 | 조사 → 대상이 마피아인지 즉시 판정 | `PoliceTarget`, `PoliceResult` |
| 의사 | 보호 대상 지목 | `DoctorTarget` |

- 마피아 단계에는 생존 마피아 중 한 명만 `MafiaDeciderId`로 지정된다. 봇으로 인원을 채운 테스트 방에서는 실제 사용자를 우선 결정권자로 선택하며, 실제 마피아가 여러 명이면 그중 한 명을 무작위로 선택한다.
- 결정권자만 대상 선택·살해 확정 패널을 조작할 수 있고, 다른 마피아는 “다른 마피아의 결정을 기다리는 중입니다.” 대기 화면을 본다.
- 결정권자가 살해를 확정하면 남은 마피아 타이머를 기다리지 않고 서버가 즉시 `BeginNightPolice()`를 호출해 경찰 단계로 넘어간다. 시간이 만료된 경우에만 기존 자동 진행 경로를 사용한다.
- 마피아 전용 채팅은 서버의 `MafiaChatLog`에 기록한 뒤 `MafiaNightHUD/CenterPanel/MafiaChat/Chat_3`의 8개 전용 슬롯에 표시한다. 런타임에서 슬롯을 `Chat_3` 배경보다 앞쪽 형제 순서로 올려 메시지가 배경 뒤에 가려지지 않게 한다. 다른 마피아의 메시지는 왼쪽 레인·좌측 정렬, 본인 메시지는 오른쪽 레인·우측 정렬로 표시한다. 입력 텍스트는 좌측 정렬을 유지하며 입력·전송 영역은 채팅 프레임 하단 내부에 배치한다.
- 재지목은 덮어쓰기로 허용된다(마지막 선택이 유효).
- 경찰 조사 결과는 대상의 실제 세부 직업을 공개하지 않고 `마피아` 또는 `마피아가 아님`으로만 표시한다. 기존 `PoliceResultDisplay`·`PoliceResultText`·`ResultDimBg`의 위치·크기·폰트·색상은 UI 원본 설정을 보존하고, 스크립트는 결과 문구와 세 엔터티의 동시 페이드 타이밍만 제어한다. 결과 오버레이가 사라진 뒤에는 Doctor 연출을 직접 활성화하지 않고 공통 `ShowNightPanel()` 경로를 사용해 대기 오버레이·안내 문구·페이드인을 다른 야간 단계와 동일하게 구성한다.
- 마피아 전용 채팅은 일반 `SendChat`이 아니라 `SendMafiaChat`을 사용하며, 마피아 단계의 생존 마피아 메시지만 `MafiaChatLog`에 반영한다.
- 서버는 마피아·경찰·의사 단계의 대상·결과·타이머를 준비한 뒤 `NightStageVersion`을 증가시켜 해당 단계가 완성됐음을 알린다. 클라이언트는 `NightStageVersion`과 `NightSubPhase`가 함께 새 단계로 바뀐 경우에만 기존 선택·제출 상태를 초기화하고 패널을 다시 구성한다. `RoleData` 또는 `AlivePlayersList`가 아직 동기화되지 않았다면 빈 패널을 확정하지 않고 다음 UI 갱신에서 재시도하므로, 첫 번째 밤의 동기화 도착 순서와 관계없이 역할 패널 또는 대기 오버레이가 표시된다.

### 3.9 아침 (MORNING)

`BeginMorning()`의 살해 판정 순서다.

1. 마피아가 아무도 지목하지 않았으면(`MafiaTarget == ""`) — 살아있는 마피아가 있는 한 **생존자 중 무작위 1명을 자동 지목**한다. 즉 마피아가 방치해도 밤은 그냥 넘어가지 않는다.
2. 의사의 보호 대상과 마피아의 대상이 같으면 → 아무도 죽지 않는다.
3. 그렇지 않으면 대상 사망 처리. 사망자 ID가 `MorningKilled`에 실려 클라이언트로 동기화된다.

화면은 `MafiaDayHUD`를 재사용한다. `MORNING`에는 "지난밤의 사건"과 사망·보호 결과에 맞는 안내를, `MEETING_RESULT`에는 "투표 결과"와 처형 대상 결정 여부에 맞는 안내를 표시한다.

아침 결과는 `MafiaNightHUD`의 `Result_1`(사망자 발생) 또는 `Result_2`(사망자 없음)를 사용하며, 완전히 나타난 상태를 3.5초 유지한 뒤 페이드아웃한다. 서버가 결과 애니메이션보다 먼저 `FREE_ROAM`으로 진행해도 클라이언트는 아침 결과가 완전히 끝날 때까지 야간 결과 HUD를 유지한다. 결과가 사라질 때 `MafiaDayHUD`를 먼저 알파 0으로 준비한 뒤 활성화하고 약 0.56초 동안 페이드인하므로, 낮 HUD가 알파 1로 한 프레임 노출되는 깜빡임을 방지한다. 투표 결과 애니메이션의 유지 시간은 기존 2.5초다.

### 3.10 종료 (GAME_OVER)

- 화면: 승자에 따라 `ui/MafiaMafiaWinHUD.ui`(마피아 승) 또는 `ui/MafiaCitizenWinHUD.ui`(시민 승)가 열린다.
- 지속 시간이 `0.0`이라 서버 타이머가 돌지 않고, 이 페이즈에서 자동으로 빠져나가지 않는다.

승리 화면의 `ReturnButton`은 `MafiaUIFlow:HandleReturnToRoomLobby()` → `_MafiaGameLogic:RestartGame()`을 호출한다. 전역 라우터는 이 요청의 `senderUserId`로 논리 방을 찾은 뒤, 인증된 사용자 ID를 `MafiaRoomGameLogic:RestartGameForUser(userId)`에 명시적으로 전달한다. 중첩 서버 호출에서 발신자 정보가 사라져 빈 사용자 ID로 거부되는 일을 막기 위한 경계다. 마피아 게임은 같은 참가자들이 역할을 다시 섞어 연속으로 플레이하는 흐름이 자연스러우므로, 결과 화면에서 돌아갈 때 Registry 방 참가 상태와 `lobbyPresent` 명단은 유지하고 현재 수사방 대기실(`MafiaLobbyHUD`)로 전원을 복귀시킨다. 역할·생존·투표·밤 행동·승리 결과·채팅·준비 상태와 클라이언트의 투표/밤/결과 애니메이션 캐시는 초기화되며, 전원은 다시 준비해야 다음 3초 카운트다운이 시작된다. 서버는 초기화할 때 동기화 값 `RoundResetVersion`을 증가시키고, 각 클라이언트는 이 값의 변화를 감지해 일시적인 페이즈 동기화 순서와 관계없이 `ResetClientRoundState()`를 정확한 라운드 경계에서 실행한다. 실제 방 퇴장과 메인 로비 복귀는 수사방 대기실의 나가기 버튼에서만 `HandleLobbyExit()` → `RequestLeaveRoom()` → `InvestigationRoomManager:LeaveRoom(roomId)` 순서로 처리한다. 연속 또는 동시 `ReturnButton` 요청은 첫 요청이 `PHASE_LOBBY`로 전환한 뒤 나머지 요청을 서버에서 거부하므로 한 번만 초기화된다.

### 3.11 관련 파일

| 파일 | 역할 |
|---|---|
| `RootDesk/MyDesk/Mafia/MafiaGameLogic.mlua` | 페이즈 상태 머신, 역할·방 배정, 투표·밤 행동·승리 판정 (서버 권한) |
| `RootDesk/MyDesk/Mafia/MafiaUIFlow.mlua` | `CurrentPhase` 폴링 → HUD 전환, 투표/밤 패널, 로딩 화면 |
| `ui/MafiaLobbyHUD.ui` | 수사방 대기실 |
| `ui/MafiaLoadingHUD.ui` | 역할 공개 로딩 화면 (`LOBBY → FREE_ROAM` 1회) |
| `ui/MafiaDayHUD.ui` | 낮 토론 · 투표 · 아침 · 처형 결과 (4개 페이즈 공용) |
| `ui/MafiaNightHUD.ui` | 밤 (역할별 지목 패널) |
| `ui/MafiaCitizenWinHUD.ui` / `ui/MafiaMafiaWinHUD.ui` | 승리 화면 |

## 문서 갱신 규칙

**팀원이 화면 전환/연결을 추가하거나 변경할 때는 반드시 이 문서를 함께 업데이트한다.** 코드만 바뀌고 문서가 안 바뀌면, 다른 팀원이 어떤 버튼이 어디로 연결되는지 코드를 처음부터 다시 추적해야 한다. 상세 규칙은 `TEAM_RULES.md` 참고.
# 수사방 UI 전환 로딩 화면

`ui/MafiaRoomTransitionHUD.ui`는 기존 로고·스토리·닉네임·게임 시작 로딩 순서와 분리된 논리 방 UI 전환 화면이다.

- 수사방 생성·참가 성공 시: `수사방으로 이동 중입니다...`
- `MafiaLobbyHUD`에서 나가기를 누를 때: `메인 로비로 이동 중입니다...`
- 전환 화면은 최소 2.5초 유지되고 목적 UI가 준비된 뒤 약 0.8초 동안 페이드한다.
- 생성·참가는 로컬 사용자의 대기실 좌석과 아바타 렌더러가 준비된 뒤 `MafiaLobbyHUD`를 드러낸다.
- 나가기는 Registry와 논리 방 정리가 성공하고 `UI_Lobby`가 준비된 뒤 메인 로비를 드러낸다.
- 요청 실패 시 전환 화면을 숨기고 기존 오류 처리를 계속한다.
- 최초 실행에서는 `TransitionRoot`가 비활성 상태이므로 `로고 → 스토리 → 닉네임 → 로비` 순서에 개입하지 않는다.
- `MafiaDayHUD`의 슬롯 템플릿 복제는 실제 낮 단계에 진입할 때 준비한다.

## 조사방 실행 구조 변경: Static Room 안의 논리 방

조사방 생성·참가·퇴장에는 더 이상 `RoomService`의 Static Room ↔ Instance Room 이동을 사용하지 않는다. 모든 사용자는 `map01`의 Static Room에 머물며, 조사방은 `roomId`를 키로 갖는 논리 방으로 실행한다. 이 변경은 Room 전환 과정에서 발생하던 수 초의 재접속 시간, 월드 재부팅, 중간 화면 노출을 제거하기 위한 것이다.

- `InvestigationRoomManager`가 방 생성 또는 참가 성공 시 `roomId`별 런타임 엔티티와 `MafiaRoomGameLogic` 컴포넌트를 정확히 하나 생성한다.
- `MafiaRoomGameLogic`은 해당 방의 참가자, 준비 상태, 카운트다운, 역할, 투표, 밤 행동, 승패를 독립적으로 소유한다.
- 전역 `MafiaGameLogic`은 클라이언트 UI 호환용 미러이자 요청 라우터다. 사용자의 현재 `roomId`를 확인해 해당 `MafiaRoomGameLogic`에 요청을 전달한다.
- `LobbyController`는 방 생성·참가 성공 직후 현재 Static Room에서 `MafiaLobbyHUD`를 표시한다. `EnterJoinedInstanceRoom()`은 호출하지 않는다.
- `MafiaLobbyHUD`에서 나가면 Registry 멤버십과 논리 방 멤버를 제거한 뒤 현재 Static Room에서 곧바로 `UI_Lobby`로 돌아간다. `MoveUserToStaticRoom()`은 호출하지 않는다.
- 마지막 참가자가 나가면 해당 `roomId`의 런타임 엔티티와 게임 상태를 파기한다. 이후 같은 이름과 설정으로 새 방을 다시 만들 수 있다.
- 서로 다른 `roomId`는 서로 다른 `MafiaRoomGameLogic` 인스턴스를 사용하므로 여러 방을 동시에 운영할 수 있다.
- `MafiaRoomTransitionHUD`는 짧은 UI 전환 피드백으로만 사용한다. 실제 Room 이동이나 재접속을 기다리는 화면이 아니다.
- 방 생성, 기존 방 참가, 방 나가기 모두 `MafiaRoomTransitionHUD`를 최소 2.5초간 유지한 뒤 0.8초 페이드로 다음 화면을 표시한다. 생성·참가는 `MafiaLobbyHUD`가 준비된 뒤, 나가기는 `UI_Lobby`가 준비된 뒤 페이드를 시작한다.
- 퇴장 요청 중에는 중복 요청을 막기 위해 나가기 버튼을 잠시 비활성화하며, 방에 다시 생성·참가할 때 퇴장 플래그와 재시도 횟수를 초기화하고 나가기 버튼을 반드시 다시 활성화한다.
- 최초 실행의 `로고 → 스토리 → 닉네임 → 로비` 순서는 변경하지 않는다.

실제 멀티플레이 배포 전에는 클라이언트 A/B가 같은 방에서 준비·취소를 공유하는지, 서로 다른 두 방의 상태가 섞이지 않는지, 한 방의 마지막 사용자가 나갔을 때 그 방만 제거되는지를 반드시 검증한다.
