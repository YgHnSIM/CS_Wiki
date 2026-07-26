---
schema_version: 2
id: log-2026-07-22-058
kind: meta
title: 2026-07-22 update | GitHub Pages base 경로 테스트 수정
aliases: []
summary: 2026-07-22에 수행한 update 작업의 변경 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-07-22
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:e5443babe020e37f3a00090b934081674c86ffe975e253d6c1d1895d056f337a
  reviewed_at: null
  reviewed_by: migration:v2
evidence_ids: []
capability_layers: []
---

GitHub Pages 배포 환경의 `SITE_BASE=/CS_Wiki`로 생성된 CSS·JavaScript·지도 데이터 경로를 로컬 정적 테스트 서버가 `dist/`에 매핑하지 못해 최신 배포가 중단된 문제를 수정했다. 정적 서버는 이제 설정한 base와 정확히 일치하는 URL 접두사만 제거하며, 접두사가 비슷한 다른 경로와 경로 순회 요청은 기존처럼 허용하지 않는다. 루트 기반 로컬 미리보기 경로도 유지한다.

변경된 페이지와 코드:

- 정적 서버 base 경로 처리: `site/server.mjs`, `site/serve.mjs`
- base 경로·경계·경로 순회 회귀 테스트: `tests/site-server.test.mjs`
- 작업 기록: [[log]]

### 검증

- `SITE_BASE=/CS_Wiki`, 실제 Pages URL 환경에서 전체 lint·유지보수·빌드·검증 통과
- Node 테스트 166개, Python 테스트 20개, Chromium 브라우저 테스트 4개 통과
- `raw/` 원본 변경 없음

### 출처

- GitHub Actions `Deploy CS Wiki` 실행 기록
- `site/server.mjs`

### 관련 항목

- [[index]]
- [[overview]]
