# 수사방 서버 API 계약

`RootDesk/MyDesk/Room/InvestigationRoomManager.mlua` 기준. 2026-07-24 (`8ab1019`) 코드에서 추출.

공통 사항:

- 전 진입점이 `@ExecSpace("Server")`이며 호출자 신원은 **`senderUserId`**로만 판단한다. 클라가 userId를 넘겨도 무시된다.
- 레지스트리는 `_RoomService:GetSharedMemory("InvestigationRoomRegistry")`의 `RoomsV1` 변수이며, **ETag 낙관적 동시성(CAS)** 으로 쓴다.
- 쓰기 충돌 시 `MAX_WRITE_RETRIES = 3`회 재시도하고, 매 시도마다 스냅샷을 다시 읽는다.
- 응답은 반환값이 아니라 **`@ExecSpace("Client")` 콜백을 요청자 1명에게 타겟 전송**하는 방식이다.
- 성공적으로 레지스트리가 바뀌면 `BroadcastRoomListToMembers`가 **모든 방의 접속 중인 멤버 전원**에게 최신 방 목록을 push한다.

---

## JoinRoom(string roomId, string password)

특정 방에 직접 입장한다. 내부적으로 `ProcessJoin(senderUserId, roomId, password or "", quickJoin=false)`에 위임한다.

**응답 콜백**: `DeliverJoinResult(success, reason, message, roomJson)` → 클라 `LobbyController:OnRoomJoinResult`

| reason | success | roomJson | 발생 조건 |
|---|:--:|---|---|
| `ROOM_STORE_ERROR` | false | `""` | 레지스트리 읽기 실패 |
| `NOT_FOUND` | false | `""` | `roomId`가 레지스트리에 없음 |
| `PLAYING` | false | `""` | `room.status == "PLAYING"` — **현재 도달 불가**(아래 결함 2) |
| `FULL` | false | `""` | `status == "FULL"` 또는 `currentPlayers >= maxPlayers` |
| `PASSWORD_REQUIRED` | false | `""` | `hasPassword == true`인데 password가 빈 값 |
| `PASSWORD_INVALID` | false | `""` | password 불일치 |
| `OK` | **true** | 방 JSON | **이미 입장한 방**(멱등 — 중복 입장 안 됨) |
| `OK` | **true** | 방 JSON | 입장 성공 |
| `WRITE_FAILED` | false | `""` | 쓰기 실패(재시도 불가 코드) |
| `BUSY` | false | `""` | `PreconditionFailed`로 3회 재시도 소진 |
| `NO_ROOM` | false | `""` | **`QuickJoin`에서만 발생.** 입장 가능한 공개 대기방 없음 |

`roomJson`은 `ToPublicRoom(room)` 결과이며 **password는 포함되지 않는다**.

**성공 시 부수효과 (순서대로)**

1. `RemoveUserFromOtherRooms` — **한 유저는 최대 한 방에만 속한다.** 입장하면 기존에 속한 다른 방에서 자동 제거되고, 그 방에서 방장이었다면 이양, 비면 삭제된다.
2. `memberUserIds`에 userId 추가
3. `memberNicknames[userId]`에 **서버가 조회한** 닉네임 기록 (호스트 이양 시 사용)
4. `RecalculateRoomStatus` — 유령 정리 후 `currentPlayers`·`status` 재계산
5. `BroadcastRoomListToMembers` — 전 방 멤버에게 목록 push
6. `DeliverJoinResult(true, "OK", ...)`

---

## LeaveRoom(string roomId)

> ⚠️ **`roomId` 인자는 무시된다.** 요청자를 **모든 방에서** 제거한다. 시그니처가 오해를 부르는 형태다(아래 결함 1).

**응답 콜백**: `DeliverLeaveResult(success, message)`

라우팅: `_MafiaUIFlow ~= nil`이면 `_MafiaUIFlow:OnInvestigationRoomLeaveResult(success, message)`로 보내고 `return`한다. `MafiaUIFlow`는 `@Logic`이라 클라에서 **항상 non-nil**이므로, 뒤의 `LobbyController:OnRoomLeaveResult` 폴백은 **도달 불가능한 죽은 코드**다(아래 결함 5).

| success | message | 발생 조건 |
|:--:|---|---|
| false | `수사방 나가기에 실패했습니다.` | 레지스트리 읽기 실패 |
| **true** | `이미 종료된 수사방입니다.` | 어느 방에도 속해 있지 않음(`removedCount <= 0`) — **성공으로 취급**(멱등) |
| **true** | `수사방에서 나왔습니다.` | 제거 후 쓰기 성공 |
| false | `수사방 나가기에 실패했습니다.` | 쓰기 실패(재시도 불가 코드) |
| false | `나가기 요청이 많습니다. 다시 시도하세요.` | 3회 재시도 소진 |

**성공 시 부수효과**

1. 소속된 모든 방의 `memberUserIds`에서 제거, `memberNicknames`에서도 제거
2. 방장이었다면 **접속 중인 첫 멤버**로 이양(유령은 방장이 되지 않음). 닉네임은 `memberNicknames` → 없으면 실시간 프로필에서 조회
3. 멤버가 0이 되면 **방 삭제**
4. `BroadcastRoomListToMembers`

---

## 관련 진입점

| 메서드 | 신원 | 비고 |
|---|---|---|
| `CreateRoom(roomName, mode, maxPlayers, isPrivate, password, hostNickname)` | `senderUserId` | **`hostNickname` 인자는 무시**되고 서버가 조회한다(사칭 차단). `mode`는 `기본 수사`/`심화 수사` 화이트리스트. `roomName` 48자 제한, `maxPlayers` 6~8, 비공개면 password는 숫자 4자리 |
| `QuickJoin()` | `senderUserId` | 공개·WAITING·여유 있는 방 중 무작위 1개로 `ProcessJoin(quickJoin=true)` |
| `GetRoomList()` / `RefreshRooms()` | `senderUserId` | 읽기 전용. `DeliverRoomList(success, roomListJson, message)` |
| `SearchRooms(keyword, modeFilter, statusFilter, hidePrivate)` | `senderUserId` | 읽기 전용. **현재 호출자 0** (클라가 자체 필터링) |
| `UpdateRoomStatus(roomId)` | `senderUserId` | **현재 호출자 0.** 멤버십 검증 없음 — 아래 결함 4 |

---

## 계약 결함 처리 이력

아래 6건은 2026-07-24 문서화 시점에 식별되어 같은 날 수정되었다. 이력을 남기는 이유는 계약을 읽는 사람이 "왜 이렇게 되어 있는가"를 알 수 있게 하기 위해서다.

| # | 결함 | 처리 |
|:-:|---|---|
| 1 | `LeaveRoom(roomId)`의 `roomId`가 무시됨 — 시그니처가 동작과 불일치 | **해소.** 한 유저는 최대 한 방에만 속하므로 "모든 방에서 제거"가 곧 "그 방에서 제거"임을 주석으로 명문화. `roomId`는 이제 **클라/서버 인식 불일치 탐지용**으로 쓰여, 요청한 방의 멤버가 아니면 `log_warning`을 남긴다. 제거 대상 선택에는 여전히 관여하지 않는다(실패한 이전 퇴장이 남긴 행까지 회수하는 안전망) |
| 2 | `PLAYING`이 도달 불가 — 게임이 시작돼도 방이 잠기지 않음 | **해소.** `SetRoomPlayingByMember(userId, playing)`(ServerOnly) 신설. `MafiaGameLogic:StartGame`에서 `MarkRoomPlaying(true)`, `SetPhase`가 `PHASE_GAME_OVER`로 **최초 전이**할 때 `MarkRoomPlaying(false)`. 해제 시 `WAITING`으로 되돌린 뒤 재계산한다(`RecalculateRoomStatus`는 의도적으로 `PLAYING`을 덮지 않으므로 선행 초기화가 필요) |
| 3 | `NO_ROOM`이 `QuickJoin` 전용인데 콜백을 공유 | **변경 없음(문제 아님).** `NO_ROOM`은 `JoinRoom` 경로에서 절대 발생하지 않는 고유값이라 reason만으로 구분 가능하다. 클라(`LobbyController:OnRoomJoinResult`)도 이미 `NO_ROOM`을 방 자동 생성으로 분기한다 |
| 4 | `UpdateRoomStatus`가 멤버십 검증 없는 클라 도달 가능 쓰기 진입점 | **해소.** `@ExecSpace("ServerOnly")`로 강등하고 `userId`를 인자로 받도록 변경. 클라에서 도달 불가능해져 ETag 고갈 공격 표면이 사라졌다 |
| 5 | `DeliverLeaveResult`의 `LobbyController` 폴백이 죽은 코드 | **해소.** `MafiaUIFlow`가 `@Logic`이라 클라에서 항상 non-nil임을 주석으로 명시하고 폴백 분기를 제거. `MafiaUIFlow`가 방 HUD를 소유하고 `LobbyController.joinedRoomId`도 정리하므로 단일 수신자가 맞다 |
| 6 | 낙관적 퇴장 — 서버 실패 시 재시도 없이 유령 잔존 | **해소.** `MafiaUIFlow`에 `lobbyLeaveRoomId`/`lobbyLeaveRetryCount`/`LOBBY_LEAVE_MAX_RETRY(3)` 추가. 실패 응답을 받으면 1초 간격으로 최대 3회 재전송하고, 소진 시 `log_error`로 "레지스트리에 잔존 가능" 사실을 남긴다. UI 즉시 복귀는 유지(사용자 체감 우선) |

부수 변경: `MAX_WRITE_RETRIES`를 3 → **5**로 상향. 8인 방에서 입퇴장이 같은 ETag에 몰릴 때 3회는 얇았다.

## 남은 한계

- **재시도 소진 시의 유령은 여전히 가능하다.** 6번 수정으로 확률은 크게 낮아졌지만 0은 아니다. 최종 안전망은 `PruneDisconnectedMembers`인데, 이것은 **접속을 끊어야** 회수한다. 유저가 계속 접속한 채 재시도까지 모두 실패하면 잔존한다.
- **`PruneDisconnectedMembers`는 단일 월드 인스턴스를 전제한다.** 인스턴스 룸 도입 시 게임 중인 멤버를 유령으로 오판하므로 `lastSeen` 방식으로 교체해야 한다. `Docs/인스턴스룸-멀티룸-설계.md` 참조.
