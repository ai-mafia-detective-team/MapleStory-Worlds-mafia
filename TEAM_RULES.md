# 팀 작업 충돌 방지 규칙

3인 동시 작업 시 Git 충돌과 파일 간 연결 계약의 무음 단절을 방지하기 위한 최우선 규칙이다. 다른 역할 분배 문서와 충돌하면 이 문서를 우선한다. 실제 코드와 이 문서가 다르면 코드를 확인한 뒤 이 문서를 갱신한다. Claude Code/Codex로 작업할 때는 세션 시작 시 이 문서 전체를 먼저 읽는다.

## 목차

1. [담당 구조와 경계](#1-담당-구조와-경계)
2. [파일 및 UI 소유권](#2-파일-및-ui-소유권)
3. [현재 공용 계약](#3-현재-공용-계약)
4. [핵심 협업 원칙](#4-핵심-협업-원칙)
5. [Git 워크플로우 체크리스트](#5-git-워크플로우-체크리스트)
6. [파일 및 폴더 구조 규칙](#6-파일-및-폴더-구조-규칙)
7. [게임 화면 흐름 문서화 규칙](#7-게임-화면-흐름-문서화-규칙)
8. [권장 작업 순서](#8-권장-작업-순서)
9. [AI 도구 강제 적용](#9-ai-도구-강제-적용)

---

## 1. 담당 구조와 경계

| 이름 | 역할 | 담당 파일 | 브랜치 |
|---|---|---|---|
| 김도하 | 수사방 입장 전 UI 디자인: 메인 로비, 프로필, 수사방 만들기·찾기, 상점·친구·설정·도감·가방·업적, 입장 전 팝업과 UI 리소스 | `ui/UI_Lobby.ui`, `ui/UI_InvestigationRoomSearch.ui`, 입장 전 관련 `.ui` 및 이미지 리소스 | `DOHA` |
| 노형래 | 메인 로비 기능과 수사방 Registry, 생성·검색·입장 검증·퇴장·삭제, 대기실 이동 | `RootDesk/MyDesk/Room/InvestigationRoomManager.mlua`, `RootDesk/MyDesk/Lobby/LobbyController.mlua`, `RootDesk/MyDesk/NicknameSetupController.mlua` | `hyeongrae` |
| 이지건 | 수사방 대기실 표시 시점부터 준비·시작·게임 진행·결과·재게임까지 | `RootDesk/MyDesk/Mafia/MafiaGameLogic.mlua`, `RootDesk/MyDesk/Mafia/MafiaUIFlow.mlua`, `RootDesk/MyDesk/UI/MafiaPlayHUD.mlua`, `ui/MafiaLobbyHUD.ui`, `ui/MafiaDayHUD.ui`, `ui/MafiaNightHUD.ui`, `ui/MafiaCitizenWinHUD.ui`, `ui/MafiaMafiaWinHUD.ui` | `jiKeon` |

### 담당 경계

```text
[김도하]
수사방 입장 전 UI
        ↓
[노형래]
로비 기능 → 방 생성·검색·입장 검증 → Registry
        ↓
수사방 입장 성공 → MafiaLobbyHUD 표시
        ↓
[이지건]
수사방 대기실 → 준비·시작 → 낮·투표·밤 → 결과·재게임
```

- 노형래 담당 종료: 방 선택, 입장 검증, 입장 성공 처리, 해당 수사방 대기실로 이동.
- 이지건 담당 시작: `ui/MafiaLobbyHUD.ui`가 표시되는 시점.
- 김도하는 기능 스크립트를 직접 수정하지 않는다.
- 노형래는 `.ui` 파일을 직접 수정하지 않는다.

## 2. 파일 및 UI 소유권

### 2.1 UI 소유권

- 수사방 입장 전 `.ui`는 김도하 소유이다.
  - `ui/UI_Lobby.ui`
  - `ui/UI_InvestigationRoomSearch.ui`
  - 프로필 및 입장 전 팝업·로비 관련 UI
- 수사방 입장 후 `.ui`는 이지건 소유이다.
  - `ui/MafiaLobbyHUD.ui`
  - `ui/MafiaDayHUD.ui`
  - `ui/MafiaNightHUD.ui`
  - `ui/MafiaCitizenWinHUD.ui`
  - `ui/MafiaMafiaWinHUD.ui`
- 담당자가 아닌 사람이 UI 변경이 필요하면 해당 UI 소유자에게 요청한다.
- UI 엔티티 이름·경로·구조는 관련 `.mlua`와의 연결 계약이다. 변경 전 관련 스크립트 담당자에게 알리고, 변경 후 전체 경로 목록을 공유한다.
- `.ui` 충돌은 raw JSON이나 충돌 마커를 직접 편집해 해결하지 않는다. MSW Maker 또는 UIBuilder로 담당 소유자가 다시 반영한다.

### 2.2 스크립트 소유권

- 노형래 소유:
  - `RootDesk/MyDesk/Room/InvestigationRoomManager.mlua`
  - `RootDesk/MyDesk/Lobby/LobbyController.mlua`
  - `RootDesk/MyDesk/NicknameSetupController.mlua`
- 이지건 소유:
  - `RootDesk/MyDesk/Mafia/MafiaGameLogic.mlua`
  - `RootDesk/MyDesk/Mafia/MafiaUIFlow.mlua`
  - `RootDesk/MyDesk/UI/MafiaPlayHUD.mlua`
- 다른 담당자는 소유 파일을 직접 수정하지 않는다. 필요한 메서드나 인터페이스를 소유자에게 요청한다.

## 3. 현재 공용 계약

아래 내용은 현재 코드에서 확인된 계약이다. 제안 API를 현재 구현처럼 기록하지 않는다.

### 3.1 수사방 Registry API

`InvestigationRoomManager.mlua`의 현재 API (클라이언트에서 호출 가능한 `@ExecSpace("Server")` 메서드):

```text
CreateRoom(roomName, mode, maxPlayers, isPrivate, password, hostNickname)
GetRoomList()
RefreshRooms()
SearchRooms(keyword, modeFilter, statusFilter, hidePrivate)
JoinRoom(roomId, password)
QuickJoin()
EnterJoinedInstanceRoom(roomId)
LeaveRoom(roomId)
```

- 서버 사용자 식별은 별도의 `userId` 매개변수가 아니라 `senderUserId`를 사용한다.
- `JoinRoom(roomId, userId)`, `LeaveRoom(roomId, userId)`는 현재 계약이 아니다.
- `EnterJoinedInstanceRoom(roomId)`은 방 생성·참가 성공 후 호출한다. 서버는 `senderUserId`가 Registry의 해당 방 멤버인지 다시 검증한 뒤 `roomId`를 Instance Room Key로 사용해 `map02`로 이동시킨다.
- `GetRoomSnapshot`, `UpdateReadyState`, `RemoveDisconnectedPlayer`는 현재 구현된 API가 아니다.
- `UpdateRoomStatus(roomId, userId)`와 `SetRoomPlayingByMember(userId, playing)`는 `@ExecSpace("ServerOnly")`로, 클라이언트가 직접 호출할 수 없다. 서버 스크립트(`MafiaGameLogic` 등)가 내부적으로만 호출한다. (`UpdateRoomStatus`는 과거 클라이언트 호출 가능이었으나, 동일 ETag에 대한 무제한 쓰기로 다른 사용자의 join/leave를 굶길 수 있어 `ServerOnly`로 격하됨.)
- 추가 API가 필요하면 구현 전 두 담당자가 인터페이스를 합의하고 `[계획]` 또는 `[제안]`으로만 문서화한다.

### 3.2 공개 방 DTO

`InvestigationRoomManager.mlua`의 `ToPublicRoom()`이 현재 반환하는 필드:

```text
roomId
roomName
mode
hostUserId
hostNickname
currentPlayers
maxPlayers
status
isPrivate
hasPassword
createdAt
```

현재 공개 DTO에는 다음 필드가 없다.

```text
players
localUserId
ownerUserId
roomTitle
roomStatus
currentPlayerCount
```

대기실 연결에 참가자 상세 목록이나 `localUserId` 등 추가 정보가 필요하면 기존 DTO 확장 또는 별도 조회 API를 설계한다. 확인되지 않은 필드를 먼저 계약으로 확정하지 않는다.

### 3.3 준비 상태와 게임 시작

- 준비 상태의 원본은 `MafiaGameLogic.mlua`의 `SetReady()`가 관리한다.
- 노형래는 `InvestigationRoomManager.mlua`에 준비 상태 원본을 중복 구현하지 않는다.
- Registry/검색 목록에 준비 상태 요약이 필요하면 노형래와 이지건이 별도 인터페이스로 합의한다.
- 현재 시작 방식은 모든 접속자가 준비 완료되면 자동 3초 카운트다운 후 자동으로 게임을 시작하는 구조이다.
- 현재 게임 순서는 `게임 시작 → 낮 토론 → 투표 → 게임 진행 중 처음 도달하는 밤`이다.

### 3.4 팀 논의가 필요한 정책

- 전원 준비 완료 후 자동 시작을 유지할지, 방장이 시작 버튼을 누르는 방식으로 변경할지.
- 방장 퇴장 및 연결 끊김·재접속의 전체 정책.
- 대기실 연결에 필요한 상세 정보의 전달 방식을 기존 DTO 확장으로 할지 별도 조회 API로 할지.
- 정책이 확정되기 전에는 현재 구현이나 P0 확정 항목처럼 기록하지 않는다.

## 4. 핵심 협업 원칙

1. 담당자가 아닌 파일을 수정해야 하면 팀 채팅에서 해당 소유자의 승인을 먼저 받는다.
2. DTO, API, 공개 메서드 시그니처, UI 경로 같은 공용 인터페이스 변경은 기능 변경과 분리된 별도 커밋을 권장한다.
3. 공용 계약 변경 커밋 메시지에는 `CONTRACT` 또는 `INTERFACE`를 포함한다.
4. 공용 계약 변경 PR에는 영향받는 파일, 호출부, 담당자를 명시한다.
5. 노형래가 변경 시 공유해야 하는 항목:
   - `ToPublicRoom()` DTO 필드
   - `JoinRoom`, `LeaveRoom`, `UpdateRoomStatus` 반환 형식
   - 대기실 진입 시점과 `roomId` 전달 방식
6. 이지건이 변경 시 공유해야 하는 항목:
   - `SetReady()` 사용 방식과 준비 상태 데이터 구조
   - 게임 시작 조건
   - 게임 종료 후 대기실 복귀 및 대기실 나가기 요청 방식
   - `MafiaUIFlow` 공개 메서드 시그니처
7. 김도하 또는 이지건이 UI 엔티티 이름·경로를 변경하면 관련 `.mlua` 담당자에게 변경 전 공지하고 변경된 전체 경로를 공유한다.
8. 각자 브랜치에서 자주, 짧게 develop에 병합한다. 구조화 파일은 오래 갈라질수록 병합 위험이 커진다.

## 5. Git 워크플로우 체크리스트

### 5.1 develop을 내 브랜치로 가져오기 전

- [ ] `git status`로 커밋되지 않은 변경을 확인하고 먼저 커밋하거나 안전하게 보관한다.
- [ ] Maker 에디터 작업을 저장하고 refresh한다.
- [ ] `git fetch origin`
- [ ] `git log --oneline <내브랜치>..origin/develop`으로 유입 커밋을 확인한다.
- [ ] `git diff --stat <내브랜치> origin/develop`으로 담당 파일 중복 변경을 확인한다.
- [ ] 다른 사람 소유 파일 또는 공용 계약 파일이 겹치면 merge 전에 소유자와 조율한다.

### 5.2 병합 실행과 충돌 처리

- [ ] `git merge origin/develop`

| 파일 종류 | 충돌 시 대응 |
|---|---|
| `.mlua` | 양쪽 로직과 소유권을 확인하고 소유자와 합의해 수동 병합한다. |
| `.ui` / `.model` / `.map` | 충돌 마커를 손으로 편집하지 않는다. 한쪽을 선택한 뒤 담당 소유자가 빌더 또는 Maker로 다시 반영한다. |
| `.codeblock` | 직접 병합하거나 수정하지 않는다. Maker refresh로 재생성한다. |

### 5.3 병합 후 검증

- [ ] Maker에서 refresh한다. Play 모드이면 먼저 stop한다.
- [ ] 빌드 로그에서 Error 0건과 신규 Warning 유무를 확인한다.
- [ ] 변경된 화면과 연결을 실제 Play 모드에서 확인한다.
- [ ] 에셋 변경이 있다면 `.ui`, `.model`, `.map`, `.mlua`의 RUID 참조를 모두 확인한다.

### 5.4 푸시 전 최종 확인

- [ ] `git status`로 불필요한 파일과 스테이징 누락을 확인한다.
- [ ] 다른 담당자 소유 파일 수정 승인을 받았는지 확인한다.
- [ ] DTO/API/UI 경로 변경을 관련 담당자에게 공지했는지 확인한다.
- [ ] 공용 계약 변경을 별도 커밋으로 분리하고 메시지에 `CONTRACT` 또는 `INTERFACE`를 넣었는지 확인한다.
- [ ] 화면 전환이나 버튼 연결 변경 시 `Docs/GameFlow.md`를 갱신했는지 확인한다.
- [ ] PR 본문에 영향받는 파일·담당자와 refresh·빌드·Play 검증 내역을 기록한다.

## 6. 파일 및 폴더 구조 규칙

### 6.1 에셋 폴더

1. 새 스프라이트는 `RootDesk/MyDesk/Assets/` 아래에 분류한다.
   - UI 파츠: `Assets/UI/`
   - 스토리 연출 이미지: `Assets/Story/`
2. UUID나 내보내기 기본 이름 대신 용도를 알 수 있는 파일명을 사용한다.
3. `.sprite` 이동 후 Maker refresh와 빌드 로그를 확인한다. RUID는 파일 경로가 아니라 파일 내부 식별자에 있다.
4. 에셋 삭제 전 `.ui`, `.model`, `.map`, `.mlua` 전체에서 RUID 참조를 확인한다.
5. 삭제는 Git으로 추적 가능한 상태에서 수행한다.

### 6.2 스크립트 및 구조화 파일

- 새 `.mlua`는 `Lobby/`, `Room/`, `Mafia/`, `UI/` 등 기능별 폴더에 둔다.
- `.codeblock`은 직접 생성·수정하지 않는다.
- `.ui`, `.model`, `.map`은 각 MSW 빌더 또는 Maker를 사용하고 raw JSON을 직접 편집하지 않는다.
- `Global/`과 `Environment/`는 읽기 전용으로 취급한다.

## 7. 게임 화면 흐름 문서화 규칙

화면 전환 흐름은 `Docs/GameFlow.md`에 기록한다.

- 입장 전 화면 흐름은 김도하와 노형래가 공동 확인한다.
  - 기능 흐름과 핸들러는 노형래가 우선 갱신한다.
  - UI 엔티티 경로와 화면 구조는 김도하가 확인한다.
- 입장 후 게임 흐름은 이지건이 우선 책임진다.
  - 대기실, 준비, 자동 시작, 낮, 투표, 밤, 결과, 재게임을 포함한다.
- 새 버튼이나 화면 연결을 추가하면 엔티티 경로, 핸들러, 이동 대상을 기록한다.
- 문서와 코드가 다르면 실제 코드를 확인한 뒤 문서를 코드에 맞게 갱신한다.

## 8. 권장 작업 순서

1. 노형래가 입장 전 기능과 필요한 UI 계약을 확정한다.
2. 김도하가 입장 전 UI를 반영한다.
3. 노형래가 입장 전 기능 연결을 완료한다.
4. 노형래와 이지건이 입장 성공 경계와 전달 인터페이스를 확정한다.
5. 이지건이 수사방 대기실부터 게임 종료·재게임까지 구현한다.
6. 실제 사용자 2명 이상으로 멀티플레이 통합 테스트를 수행한다.

## 9. AI 도구 강제 적용

이 프로젝트의 `.gitignore`는 `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`를 제외하므로 해당 설정은 각자 로컬에서 적용해야 한다.

### Claude Code

로컬 `CLAUDE.md` 맨 위에 다음을 추가한다.

```text
@TEAM_RULES.md
```

### Codex

로컬 `AGENTS.md` 맨 위에 다음을 추가한다.

```text
# 팀 규칙 (필수)
작업 시작 전 저장소 루트의 TEAM_RULES.md 전체를 읽고 그 규칙을 따른다.
```

### 저장소 공용 보완 장치

- `README.md`의 `TEAM_RULES.md` 링크를 유지한다.
- 팀 채팅으로 각 팀원이 로컬 설정을 적용했는지 직접 확인한다.
