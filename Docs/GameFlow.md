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
| 수사방 만들기 | `ButtonGroup/방만들기` | `OnCreateRoomClicked` → `OpenCreateRoomModal()` | 생성 폼은 `ui/UI_Lobby.ui` 내부 모달 → 제출 성공 시 `MafiaUIFlow:OpenLobbyAfterRoomCreated()` 호출 → **`ui/MafiaLobbyHUD.ui`** 로 이동 |
| 바로 게임화면 (start) | `ButtonGroup/start` | `OnStartClicked` → `OpenMatchmakingModal()` + `QuickJoinRoom()` | 매칭 대기 모달은 `ui/UI_Lobby.ui` 내부 → 참가 성공 시 `LobbyController:EnterInvestigationRoomLobby()` → `MafiaUIFlow:EnterRoomLobby()` 호출 → **`ui/MafiaLobbyHUD.ui`** 로 이동 |

**핵심 포인트**: "수사방 만들기"와 "바로 게임화면(start)"은 서로 다른 진입 경로(방 생성 vs 빠른 참가)를 거치지만 **최종적으로 같은 화면인 `ui/MafiaLobbyHUD.ui`(수사방 대기실)로 합류**한다. 이후 실제 낮/밤 게임 진행 화면(`MafiaDayHUD.ui`, `MafiaNightHUD.ui` 등)으로의 전환은 `Mafia/MafiaGameLogic.mlua`가 관리하며, 이 부분의 순서/조건(룰)은 별도로 정의해서 아래 3번 섹션에 채울 예정이다.

## 2.1 수사방 대기실 → 메인 로비 복귀

| 현재 화면 | 버튼 엔티티 경로 | 클릭 핸들러 메서드 | 이동/오픈 대상 |
|---|---|---|---|
| `ui/MafiaLobbyHUD.ui` | `/ui/MafiaLobbyHUD/CenterPanel/InviteButton` | `MafiaUIFlow:HandleLobbyExit()` → `MafiaUIFlow:OnInvestigationRoomLeaveResult()` | 클릭 즉시 **`ui/UI_Lobby.ui`** 로 복귀하고, 이후 수사방 나가기 정리 결과 처리 |

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
| `LOBBY` | 새 접속자에게 빈 방 번호 배정 + 해당 `RoomSpawn_N`으로 텔레포트 | **접속자 전원이 준비 완료** → 3초 카운트다운 → `StartGame()`. 카운트다운 중 누구든 준비를 해제하면 취소 | `FREE_ROAM` |
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

> ⚠️ **알려진 결함**: 승리 화면의 `ReturnButton`은 `MafiaUIFlow:HandleLobbyExit()` → `_MafiaGameLogic:RequestLeaveRoom()`을 호출하는데, **`RequestLeaveRoom`은 `MafiaGameLogic`에 정의돼 있지 않다**. 반대로 로비 복귀·재시작에 쓸 수 있는 `RestartGame()`은 구현돼 있으나 아무도 호출하지 않는다. 현재로선 게임이 끝나면 대기실로 돌아갈 수단이 없다. 둘을 연결하는 작업이 필요하다.

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
