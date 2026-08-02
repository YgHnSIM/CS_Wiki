# scripts 운영 도구 규칙

## 역할

`scripts/`는 위키 매니페스트, 린트, 유지보수, 변경 집합, 외부 링크 검사와 마이그레이션을 담당한다.

## 기준과 실행 순서

- `wiki_manifest.mjs`가 YAML·ID·출처·위키링크를 해석하는 단일 기준이다.
- Node.js `.mjs` 도구를 기준으로 사용하고 Python 도구는 호환성·보조 검사로 취급한다.
- 문서 변경 후 `npm run lint:wiki`와 `npm run maintenance:check`를 먼저 실행한다.
- 생성 블록을 갱신할 때는 `npm run maintenance:generate`를 사용한다.
- EOL 수선은 `node scripts/wiki_maintenance.mjs --fix-eol`로 수행한다.
- 외부 링크는 `npm run check:links`로 별도 검사한다.

## 주의

- 도구는 `raw/`를 수정하지 않아야 한다.
- 자동 생성 결과를 임의로 하드코딩하지 않는다.
- 스키마·매니페스트 해석을 바꾸면 관련 lint·maintenance·site 테스트를 함께 확인한다.
