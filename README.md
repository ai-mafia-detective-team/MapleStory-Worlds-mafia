# MapleStory-Worlds-mafia
개발

> **작업 시작 전 필독**: [TEAM_RULES.md](./TEAM_RULES.md) (팀 협업 규칙) · [Docs/GameFlow.md](./Docs/GameFlow.md) (게임 화면 흐름)

## 알려진 이슈 (Known Issues)

- **낮 투표 처형 결과 애니 미재생** — `RootDesk/MyDesk/Mafia/MafiaUIFlow.mlua` `RefreshDay()`
  `_TimerService:SetTimer(...)` 호출이 잘못된 오버로드입니다. `SetTimer`의 시그니처는
  `SetTimer(IScriptable scriptable, func callback, float interval, boolean isRepeat, float startDelay=0)`로
  첫 인자가 소유자(scriptable)여야 하는데 콜백/숫자를 넘겨 타입·인자수가 어긋납니다
  (빌드 에러 `1103`×2 + `1121`). 그 결과 처형 대상이 있는 투표 결과 단계에서
  `PlayVoteResultAnime`가 실행되지 않습니다. → `SetTimerOnce(콜백, 1.5)`로 교체 필요.
  (출처 커밋 `71ffa3c` / PR #14, @dlwlrjs)
