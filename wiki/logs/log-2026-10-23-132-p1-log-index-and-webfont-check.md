---
schema_version: 2
id: log-2026-10-23-132
kind: meta
title: "2026-10-23 update | P1 로그 색인 생성기와 웹폰트 커버리지 검사"
aliases: []
summary: 로그 목록을 로그 원본에서 생성하고 순서·제목을 정확히 검증하며, 렌더링 말뭉치의 모든 코드포인트가 배포 폰트에 있는지 CI에서 확인하도록 정비한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-23
updated: 2026-10-23
review:
  mode: legacy-baseline
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 배경

감사 P1 항목 중 아직 남아 있던 두 가지를 처리했다. 첫째, `wiki/log.md`는 생성 표식이 있지만 실제 생성기가 없어 130줄 목록을 손으로 관리했고, `wiki_maintenance.mjs`는 개수만 비교해 순서나 제목 오류를 잡지 못했다. 둘째, 웹폰트 서브셋은 수동으로만 갱신되어 새 문자권이 추가되면 두부(tofu)가 생길 수 있었고, 말뭉치 범위도 `site/styles`·`site/graph`를 포함하지 않았다.

## 작업 범위

- `scripts/log_index.mjs` 추가: `wiki/logs/*.md`를 파일명 순으로 읽어 frontmatter `title`을 표시 제목으로 쓰고, `wiki/log.md` 본문과 링크 목록을 렌더링한다.
- `scripts/generate_operational_pages.mjs`: `log.md` 생성 추가. 본문이 이미 같고 revision이 유효하면 파일을 다시 쓰지 않도록 멱등화해, 생성기를 돌릴 때마다 `updated` 날짜만 바뀌는 churn을 없앴다.
- `scripts/wiki_maintenance.mjs`: 로그 개수만 비교하던 검사를 파일 순서와 제목의 정확한 일치 검사로 확장했다(`generated.log_order`, `generated.log_title`).
- `tests/log-index.test.mjs`, `tests/wiki-maintenance.test.mjs`: 정렬·frontmatter 제목·직렬화 왕복·순서/제목 드리프트 검증 추가.
- `scripts/subset_fonts.py`: `--check` 모드 추가. 렌더링 말뭉치(로그 제외, `site/styles/**/*.css`·`site/graph/**/*.mjs` 포함)의 코드포인트가 배포 폰트 cmap에 모두 있는지 확인하고, 없으면 실패한다.
- `package.json`, `README.md`, `.github/workflows/pages.yml`: `npm run fonts:check` 추가, CI에서 Python 3.12 + fonttools/brotli를 설치해 검사.
- 웹폰트 서브셋 재생성: 기존 91,900/101,860바이트에서 127,912/142,408바이트로 늘었지만, 누락된 375개 코드포인트를 모두 포함해 1,177개 필수 코드포인트를 커버한다.
- 데이터 정리: `log-2026-08-31-113`의 제목에 날짜·유형 접두사를 복원하고, `log-2026-09-18-118`에 남아 있던 제어문자(`\x07`)와 누락 글자·줄바꿈을 복구했다. 두 로그는 사이트에 렌더링되지 않지만 원 기록의 무결성을 위해 수정했다.

## 검증

- `npm run lint:wiki`: 0 errors, 0 warnings
- `npm run maintenance:check`: 0 issues
- `npm run fonts:check`: 1,177개 코드포인트 전부 커버
- `npm run test:site`: 160 pass
- `npm run build`: 440 pages, `dist` 116.48MiB / 5,635 files
- `npm run verify:site`: 내부 링크 125,587개 검사·깨진 링크 0
- `npm run maintenance:generate` 2회 실행: `changed: []` (멱등)
- `npm run test:browser`: 21 pass

## 후속

- 남은 P1은 정책 결정이 필요한 항목이다: `publication_visibility` 의미 구현(현재 fail-closed 가드), `reviewed_by`/`review.revision` 분리, 초안 공개 정책, 연도 미상 문서 보강과 `event.evidence_id` 규칙, `readmeplus.md` 최신화.
- 폰트 서브셋은 이제 CI가 렌더링 말뭉치와 배포 폰트의 불일치를 막는다. 새 문자권을 추가하면 `npm run fonts:subset` 후 바이너리를 함께 커밋해야 한다.
