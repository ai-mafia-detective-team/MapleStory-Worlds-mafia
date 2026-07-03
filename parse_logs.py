import json, sys

logfile = r'C:\Users\dlwlrjs\.claude\projects\c--Users-dlwlrjs--------\b9233446-99c7-4f28-b307-211ef196239e\tool-results\mcp-msw-maker-mcp-maker_logs-1782023947946.txt'
with open(logfile, encoding='utf-8') as f:
    data = json.loads(f.read())

logs = data.get('logs', [])
print(f'총 로그: {len(logs)}개')

errors = [l for l in logs if l['logType'] == 'Error']
warnings = [l for l in logs if l['logType'] == 'Warning']
print(f'에러: {len(errors)}개 / 경고: {len(warnings)}개')

print('\n=== 에러 목록 ===')
for e in errors[:15]:
    msg = e['message']
    st = e.get('stackTrace', [{}])
    fn = st[0].get('methodName','') if st else ''
    ln = st[0].get('methodLineNum','') if st else ''
    print(f'  [{fn}:{ln}] {msg[:150]}')

print('\n=== Mafia 관련 로그 ===')
mafia_logs = [l for l in logs if '[Mafia]' in l.get('message','')]
print(f'총 {len(mafia_logs)}개')
for l in mafia_logs[:30]:
    msg = l['message']
    st = l.get('stackTrace', [{}])
    fn = st[0].get('methodName','') if st else ''
    print(f'  [{l["logType"]}][{fn}] {msg[:120]}')

print('\n=== MafiaHUD 관련 로그 ===')
hud_logs = [l for l in logs if 'MafiaHUD' in l.get('message','') or 'MafiaHUD' in str(l.get('stackTrace',''))]
print(f'총 {len(hud_logs)}개')
for l in hud_logs[:20]:
    msg = l['message']
    st = l.get('stackTrace', [{}])
    fn = st[0].get('methodName','') if st else ''
    print(f'  [{l["logType"]}][{fn}] {msg[:120]}')

print('\n=== nil / attempt 관련 에러 ===')
nil_logs = [l for l in logs if 'nil' in l.get('message','').lower() or 'attempt' in l.get('message','').lower()]
print(f'총 {len(nil_logs)}개')
for l in nil_logs[:10]:
    msg = l['message']
    st = l.get('stackTrace', [{}])
    fn = st[0].get('methodName','') if st else ''
    print(f'  [{l["logType"]}][{fn}] {msg[:150]}')
