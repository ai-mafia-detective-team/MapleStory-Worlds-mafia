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

## 알려진 계약 결함

1. **`LeaveRoom(roomId)`의 `roomId`가 무시된다.** 특정 방만 나가려 해도 모든 방에서 제거된다. 시그니처가 실제 동작과 불일치.
2. **`PLAYING` reason이 도달 불가능.** `room.status = "PLAYING"` 대입문이 레포 전체에 없다. 게임이 시작돼도 방이 잠기지 않아 진행 중인 방이 계속 `WAITING`으로 노출되고 입장이 허용된다.
3. **`NO_ROOM`은 `QuickJoin` 전용**인데 `JoinRoom`과 같은 콜백을 공유한다. 클라는 어느 경로에서 온 응답인지 구분할 수 없다.
4. **`UpdateRoomStatus`는 멤버십 검증이 없다.** 임의 `roomId`로 무제한 쓰기가 가능해 다른 유저의 입퇴장을 `PreconditionFailed`로 밀어낼 수 있다. 현재 호출자가 없으므로 삭제하거나 `ServerOnly`로 강등할 것.
5. **`DeliverLeaveResult`의 `LobbyController` 폴백은 죽은 코드다.** `nil` 검사가 폴백을 제공한다는 잘못된 안전감을 준다.
6. **클라의 나가기가 낙관적이다.** `MafiaUIFlow:HandleLobbyExit`가 서버 응답을 기다리지 않고 `joinedRoomId`를 먼저 지우고 UI를 전환한 뒤 `LeaveRoom`을 보낸다. 서버가 `BUSY`/`WRITE_FAILED`를 반환해도 **클라는 재시도하지 않으며** 이미 로컬 상태를 지운 뒤다 → 레지스트리에 유령이 영구 잔존할 수 있다. `PruneDisconnectedMembers`가 접속 종료 시에는 회수해 주지만, 유저가 계속 접속해 있으면 회수되지 않는다.
