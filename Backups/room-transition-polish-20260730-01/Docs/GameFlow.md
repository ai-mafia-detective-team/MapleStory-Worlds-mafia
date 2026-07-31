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
| 수사방 만들기 | `ButtonGroup/방만들기` | `OnCreateRoomClicked` → `OpenCreateRoomModal()` | 생성 성공 시 정적 Room에서는 HUD를 열지 않고 `InvestigationRoomManager:EnterJoinedInstanceRoom(roomId)` 요청 → 방별 Instance Room의 `map02` 클라이언트 부팅이 `MafiaLobbyHUD`를 한 번만 표시 |
| 바로 게임화면 (start) | `ButtonGroup/start` | `OnStartClicked` → `OpenMatchmakingModal()` + `QuickJoinRoom()` | 참가 성공 시 정적 Room에서는 HUD를 열지 않고 `EnterJoinedInstanceRoom(roomId)` 요청 → 같은 `roomId`의 Instance Room `map02` 클라이언트 부팅이 `MafiaLobbyHUD`를 한 번만 표시 |

**핵심 포인트**: "수사방 만들기"와 "바로 게임화면(start)"은 서로 다른 Registry 경로를 거치지만 최종적으로 같은 `MafiaLobbyHUD`로 합류한다. 입장 성공 후 서버는 인증된 사용자가 해당 Registry 방의 멤버인지 다시 확인하고, `roomId`를 Instance Room Key로 사용해 사용자를 `map02`로 이동시킨다. Instance Room마다 `MafiaGameLogic`이 독립적으로 실행되므로 참가자·준비·역할·투표·밤 행동·타이머가 다른 수사방과 섞이지 않는다. `map02` 진입 시 `UserEnterEvent`가 해당 Room의 서버 대기실 명단 등록과 Registry 방 설정 복원을 처리한다. 맵 이동으로 클라이언트 Logic이 다시 생성되더라도 Instance Room에서는 시작 로고·인트로를 재생하지 않고 `RoomKey`를 현재 참가 방으로 복원한 뒤 곧바로 `MafiaLobbyHUD`를 표시한다.

정적 Room에서 Instance Room으로 이동할 때 발생하는 소스 Room의 `UserLeaveEvent`는 접속 종료가 아니라 방 전환이므로 Registry 멤버십을 제거하지 않는다. 실제 나가기에서는 Instance Room 안에서 `UI_Lobby`를 미리 표시하지 않고, Registry 정리가 성공한 뒤 단일 사용자 전용 `MoveUserToStaticRoom(userId, "map01")` 경로로 사용자를 정적 로비에 돌려보낸다. 이동 직전 사용자별 일회성 복귀 표식(`pending_static_lobby_return_v1`)을 저장하며, 새 정적 Room 클라이언트는 시작 분기에서 이 표식을 소비한다. 표식이 있으면 로고·스토리·닉네임을 다시 재생하지 않고 `MafiaRoomTransitionHUD` 뒤에서 기존 닉네임의 `UI_Lobby`를 직접 복원한다. 표식이 없는 일반 최초 실행은 기존 `로고 → 스토리 → 닉네임 → 로비` 순서를 그대로 사용한다. 멤버십이 앞선 정리로 이미 사라진 경우에도 동일한 복귀를 수행하며, 이동 중 중복 나가기 입력은 잠근다.

게임 종료 후 같은 방에서 재경기를 선택하면 `MafiaGameLogic:ResetRoundState()`를 사용해 기존 참가자 명단과 방 설정을 유지한 채 라운드 상태만 초기화한다. 반대로 종료된 방 뒤에 새 수사방을 생성할 때는 `InvestigationRoomManager`가 `MafiaGameLogic:ResetRoomState()`를 호출해 이전 방 참가자 명단과 방 설정을 먼저 제거한다. 따라서 이전 방 사용자가 새 방의 슬롯·준비 상태에 남거나 새 방으로 이동되는 것을 방지한다.

## 2.1 수사방 대기실 → 메인 로비 복귀

| 현재 화면 | 버튼 엔티티 경로 | 클릭 핸들러 메서드 | 이동/오픈 대상 |
|---|---|---|---|
| `ui/MafiaLobbyHUD.ui` | `/ui/MafiaLobbyHUD/CenterPanel/InviteButton` | `MafiaUIFlow:HandleLobbyExit()` → `InvestigationRoomManager:LeaveRoom(roomId)` | 중복 입력을 잠근 뒤 Registry 정리 → `MoveUserToStaticRoom(userId, "map01")` 순서로 이동. Instance Room 안에서는 `UI_Lobby`를 미리 표시하지 않으며 새 Static Room 클라이언트가 로비 UI를 초기화 |

## 3. 게임 진행 중 화면 전환

수사방 대기실(`MafiaLobbyHUD`)에 들어온 뒤부터 승패가 갈릴 때까지의 진행 규칙. 모든 판정은 **서버**(`Mafia/MafiaGameLogic.mlua`, `@Logic`)에서 이뤄지고, 클라이언트(`Mafia/MafiaUIFlow.mlua`)는 `@Sync` 프로퍼티인 `CurrentPhase`를 0.1초마다 폴링해 HUD만 갈아끼운다. 클라이언트는 페이즈를 바꾸지 못한다.

### 3.1 페이즈 정의

| 값 | 상수 | 화면 이름 | 지속 시간 프로퍼티 | 기본값 |
|:-:|---|---|---|:-:|
| 0 | `PHASE_LOBBY` | 수사방 대기실 | — (타이머 없음) | — |
| 1 | `PHASE_FREE_ROAM` | 낮 토론 | `FREE_ROAM_TIME` | 10초 |
| 2 | `PHASE_NIGHT` | 밤 | `NIGHT_TIME` | 10초 |
| 3 | `PHASE_MORNING` | 아침 (밤 결과 발표) | `MORNING_TIME` | 5초 |
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
| `MORNING` | 밤 결과 판정(살해/보호), `MorningKilled`에 사망자 기록 | 타이머 만료 | `FREE_ROAM` |
| `GAME_OVER` | `WinnerRole` 확정 | **없음** — 지속 시간이 0이라 타이머가 돌지 않고 이 상태에서 멈춘다 | — |

### 3.4 게임 시작 조건 (LOBBY → FREE_ROAM)

`AllLobbyPlayersReady()`가 참이어야 3초 카운트다운이 시작된다. 조건은 세 가지가 모두 만족될 때다.

1. 접속자 수가 최소 인원 이상 — `MIN_PLAYERS = 6`. 단 **`DebugMode = true`이면 최소 1명**으로 완화된다(현재 기본값이 `true`).
2. 접속자 수가 `RoomMaxPlayers`(방 설정에서 6/7/8 중 선택, 기본 8) 이하.
3. 접속자 **전원**이 준비 완료 상태.

대기실 명단·인원·준비 표시는 `MafiaGameLogic`이 동기화하는 `LobbySeatOrder`, `LobbyPlayerCount`, `ReadyStatusList`, `ReadyCount`만 사용한다. 동기화 값이 비어 있어도 클라이언트가 `_UserService.Users` 전체를 대체 명단으로 표시하지 않으므로, 메인 로비에 머무는 사용자가 수사방 슬롯에 나타나지 않는다. 같은 사용자의 중복 `EnterRoomLobby()`·동일 준비값 요청은 상태를 중복 생성하지 않는다. 카운트다운 만료 순간에도 서버가 전원 준비 여부를 마지막으로 다시 검사한다.

`StartGame()` 시점의 처리 순서는 다음과 같다.

1. `DebugMode`면 `AddBots()` — 최대 인원까지 `Bot_1`…으로 채운다. 봇은 준비/투표/밤 행동을 하지 않으므로, 봇이 낀 판은 타이머 만료로만 페이즈가 넘어간다.
2. `AssignRoles()` — 마피아를 `MafiaPlayerCount`(방 설정 1~3, 기본 2)명 뽑고, 그다음 경찰 1명·의사 1명, 나머지는 전부 시민. 그 뒤 전체를 셔플한다.
3. `AssignRooms()` — 1~N번 방을 무작위로 배정하고 각자의 `RoomSpawn_N`으로 텔레포트.
4. 업적 이벤트 `GAME_PLAY`, `ROLE_ASSIGNED` 보고(봇 제외).
5. `SetPhase(FREE_ROAM, 10초)`.

**로딩 화면**: `LOBBY → FREE_ROAM` 최초 전환만 클라이언트에서 가로채서 `ui/MafiaLoadingHUD.ui`(역할 공개 화면)를 약 3초 띄우고 0.5초 페이드아웃한 뒤 `MafiaDayHUD`를 연다(`TriggerLoadingScreen`). 역할이 시민·의사·경찰이면 `BgSprite`, 마피아이면 `BgSprite_1` 배경만 표시한다. 이후의 페이즈 전환에는 로딩 화면이 끼지 않는다.

### 3.5 낮 토론 (FREE_ROAM)

- 화면: `ui/MafiaDayHUD.ui` — 제목 "낮 토론", 스킵 카운트(`n/전체`)가 이 페이즈에서만 표시된다.
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

### 3.7 승리 판정 (MEETING_RESULT 종료 시점)

`CheckWinAndContinue()`는 **처형 결과 페이즈가 끝나는 순간에만** 호출된다.

| 조건 | 결과 |
|---|---|
| 생존 마피아 = 0 | 시민 승리 → `GAME_OVER` (`WinnerRole = ROLE_CITIZEN`) |
| 생존 마피아 ≥ 생존 시민팀 | 마피아 승리 → `GAME_OVER` (`WinnerRole = ROLE_MAFIA`) |
| 그 외 | 게임 속행 → `NIGHT` |

"생존 시민팀"은 마피아가 아닌 전원(시민·경찰·의사)을 합산한 값이다.

> ⚠️ **알려진 룰 공백**: 승리 판정이 밤 살해 직후(`MORNING`)에는 돌지 않는다. 밤에 마피아가 사람을 죽여 인원이 동수가 되어도 그 판에서 바로 마피아 승리가 선언되지 않고, 낮 토론 → 투표를 한 바퀴 더 돈 뒤 다음 `MEETING_RESULT`에서야 판정된다. 의도한 규칙인지 확인이 필요하다.

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

- 재지목은 덮어쓰기로 허용된다(마지막 선택이 유효).
- 채팅은 서버에서 거부된다. `MafiaNightHUD`에 채팅 입력 UI가 연결돼 있지만 `SendChat`이 `NIGHT`을 허용 페이즈에서 빼놓았으므로 전송해도 반영되지 않는다 — **UI와 서버 규칙이 어긋난 지점**이라 둘 중 하나를 맞춰야 한다.
- 서버는 마피아·경찰·의사 단계의 대상·결과·타이머를 준비한 뒤 `NightStageVersion`을 증가시켜 해당 단계가 완성됐음을 알린다. 클라이언트는 `NightStageVersion`과 `NightSubPhase`가 함께 새 단계로 바뀐 경우에만 기존 선택·제출 상태를 초기화하고 패널을 다시 구성한다. `RoleData` 또는 `AlivePlayersList`가 아직 동기화되지 않았다면 빈 패널을 확정하지 않고 다음 UI 갱신에서 재시도하므로, 첫 번째 밤의 동기화 도착 순서와 관계없이 역할 패널 또는 대기 오버레이가 표시된다.

### 3.9 아침 (MORNING)

`BeginMorning()`의 살해 판정 순서다.

1. 마피아가 아무도 지목하지 않았으면(`MafiaTarget == ""`) — 살아있는 마피아가 있는 한 **생존자 중 무작위 1명을 자동 지목**한다. 즉 마피아가 방치해도 밤은 그냥 넘어가지 않는다.
2. 의사의 보호 대상과 마피아의 대상이 같으면 → 아무도 죽지 않는다.
3. 그렇지 않으면 대상 사망 처리. 사망자 ID가 `MorningKilled`에 실려 클라이언트로 동기화된다.

화면은 `MafiaDayHUD`를 재사용하며, 제목은 "게임 진행 중"으로 표시된다(`MORNING`·`MEETING_RESULT` 전용 문구가 아직 없다).

아침 결과는 `MafiaNightHUD`의 `Result_1`(사망자 발생) 또는 `Result_2`(사망자 없음)를 사용하며, 완전히 나타난 상태를 3.5초 유지한 뒤 페이드아웃한다. 결과가 완전히 사라지면 `MafiaDayHUD`를 알파 0에서 1로 약 0.56초 동안 페이드인해 밤 결과와 낮 화면이 자연스럽게 이어진다. 투표 결과 애니메이션의 유지 시간은 기존 2.5초다.

### 3.10 종료 (GAME_OVER)

- 화면: 승자에 따라 `ui/MafiaMafiaWinHUD.ui`(마피아 승) 또는 `ui/MafiaCitizenWinHUD.ui`(시민 승)가 열린다.
- 지속 시간이 `0.0`이라 서버 타이머가 돌지 않고, 이 페이즈에서 자동으로 빠져나가지 않는다.

승리 화면의 `ReturnButton`은 `MafiaUIFlow:HandleReturnToRoomLobby()` → `_MafiaGameLogic:RestartGame()`을 호출한다. 마피아 게임은 같은 참가자들이 역할을 다시 섞어 연속으로 플레이하는 흐름이 자연스러우므로, 결과 화면에서 돌아갈 때 Registry 방 참가 상태와 `lobbyPresent` 명단은 유지하고 현재 수사방 대기실(`MafiaLobbyHUD`)로 전원을 복귀시킨다. 역할·생존·투표·밤 행동·승리 결과·채팅·준비 상태와 클라이언트의 투표/밤/결과 애니메이션 캐시는 초기화되며, 전원은 다시 준비해야 다음 3초 카운트다운이 시작된다. 서버는 초기화할 때 동기화 값 `RoundResetVersion`을 증가시키고, 각 클라이언트는 이 값의 변화를 감지해 일시적인 페이즈 동기화 순서와 관계없이 `ResetClientRoundState()`를 정확한 라운드 경계에서 실행한다. 실제 방 퇴장과 메인 로비 복귀는 수사방 대기실의 나가기 버튼에서만 `HandleLobbyExit()` → `RequestLeaveRoom()` → `InvestigationRoomManager:LeaveRoom(roomId)` 순서로 처리한다. 연속 또는 동시 `ReturnButton` 요청은 첫 요청이 `PHASE_LOBBY`로 전환한 뒤 나머지 요청을 서버에서 거부하므로 한 번만 초기화된다.

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
# 수사방 Room 전환 로딩 화면

`ui/MafiaRoomTransitionHUD.ui`는 기존 로고·스토리·닉네임·게임 시작 로딩 순서와 분리된 Room 이동 전용 화면이다.

- 수사방 생성·참가 성공 후 Instance Room 이동을 요청할 때: `수사방으로 이동 중입니다...`
- `MafiaLobbyHUD`에서 나가기를 눌러 Static Room으로 이동할 때: `메인 로비로 이동 중입니다...`
- Instance Room 클라이언트에서 `MafiaLobbyHUD`를 켠 뒤, 첫 실제 갱신에서 로컬 사용자의 좌석·아바타 렌더러까지 활성화된 것을 확인한다. 준비가 끝나면 전환 화면의 실제 배경·문구 알파를 약 0.45초 동안 낮추고, 지원되는 경우 `MafiaLobbyHUD`의 CanvasGroup 알파를 동시에 높이는 교차 페이드로 완성된 대기실을 드러낸다. 이 조건 전에는 맵이나 초기화 중인 대기실이 노출되지 않도록 전환 화면을 유지한다.
- Room 입장 요청 또는 나가기 요청이 실패하면 즉시 숨기고 기존 오류 처리를 계속한다.
- 최초 실행에서는 `TransitionRoot`가 비활성 상태이므로 로고 → 스토리 → 닉네임 → 로비 순서에 개입하지 않는다.
- `MafiaDayHUD`의 슬롯 템플릿 복제는 Room 로비 입장 중에는 실행하지 않고, 실제 낮 단계에 진입할 때 준비한다.
- `MoveUserToStaticRoom()` 성공 뒤에는 이전 Instance Room 클라이언트가 이미 소멸하므로 해당 클라이언트로 결과 RPC를 보내지 않는다.
- 방 생성·참가 성공 응답에서는 전환 HUD를 켠 뒤 한 프레임을 양보하고 Room 이동을 요청한다.
- Instance Room 부팅 중 이미 완료된 `MafiaUIFlow:ResolveUI()`는 `EnterRoomLobby()`에서 중복 실행하지 않는다.
