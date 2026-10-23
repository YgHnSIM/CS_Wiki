---
schema_version: 2
id: log-2026-10-23-131
kind: meta
title: "2026-10-23 update | 역사 렌즈 회귀 수정과 검증·운영 체계 정비"
aliases: []
summary: 역사 렌즈의 연도 소실 회귀를 고치고, 로그 링크·내부 링크 검증·외부 링크 실패 정책·Python 도구 정리·공개 범위 가드를 한 번에 정비한 기록.
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

전체 감사에서 공개 문서 434개가 모두 역사 렌즈의 `undated` 레인에 들어가고 8개 시대 구간의 사건·전환이 0으로 비어 있는 것을 확인했다. 원인은 v2 매니페스트가 `history`를 중첩 객체로만 노출하는데 사이트 그래프가 `page.eventStart` 같은 평면 필드를 읽은 것이었다. 같은 감사에서 작업 로그 130개 링크가 사이트에서 404가 되는 문제, 폐기된 Python v1 도구가 현재 저장소에 5,287개 오류를 내는 문제, 외부 링크 검사가 네트워크 오류를 실패로 보지 않는 문제도 함께 확인했다.

## 작업 범위

- `scripts/wiki_manifest.mjs`: `v2Record()`에 `publicationYear`, `eventStart`, `eventEnd`, `historicalLayer`, `historicalNote` 평면 필드를 추가해 중첩 `history`와 일치시켰다.
- `tests/site-manifest.test.mjs`: 실제 매니페스트를 `buildKnowledgeGraph()`까지 통과시켜 dated 문서 100개 이상, 역사 층위 존재, 평면/중첩 값 일치를 검증하는 회귀 테스트를 추가했다.
- `site/markdown.mjs`, `site/build.mjs`: 상대 `.md` 링크를 현재 페이지 디렉터리 기준으로 해석해 위키 페이지는 사이트 라우트로, 빌드되지 않는 로그는 GitHub blob으로 연결하는 `resolveRenderedFileLinks()`를 추가했다.
- `tests/markdown-rendering.test.mjs`: 저장소 blob 변환, 페이지 라우트 변환, 외부·절대·`..` 링크 불변, 해시 보존을 검증하는 테스트를 추가했다.
- `site/verify-links.mjs`, `site/verify-build.mjs`, `tests/site-internal-links.test.mjs`: `dist`의 HTML을 전수 스캔해 같은 출처의 `href`·`src`가 실제 파일로 해석되는지 검사하고, `assets/raw/**` 아카이브 HTML은 제외했다. `verify:site`가 125,587개 내부 참조를 검사한다.
- `scripts/check_external_links.mjs`, `package.json`: `--fail-on-error`와 `WIKI_LINK_ERROR_THRESHOLD`(기본 20%)를 추가해 타임아웃·5xx·DNS 오류가 임계치를 넘거나 전체 요청이 실패하면 종료 코드 1을 반환하게 했다.
- `.github/workflows/external-links.yml`: 링크 보고서를 아티팩트로 남기고, 실패 시 `gh`로 기존 이슈를 갱신하거나 새 이슈를 만든다. `issues: write` 권한을 추가했다.
- Python v1 도구 정리: `wiki_lint.py`, `wiki_common.py`, `wiki_maintenance.py`, `wiki_summaries.py`, `check_external_links.py`, `test_wiki_scripts.py`, `test_external_links.py`를 삭제했다. `subset_fonts.py`와 Python 3.12는 글꼴 서브셋 전용으로 남겼다. `package.json`, `README.md`, `AGENTS.md`, `scripts/AGENTS.md`, `pages.yml`의 Python 테스트·설정 단계를 정리했다.
- `site/visibility.mjs`, `site/build.mjs`, `tests/site-visibility.test.mjs`: 아직 구현되지 않은 `unlisted`/`private` 공개 범위를 공개 빌드가 조용히 게시하지 않도록 비공개 페이지가 있으면 빌드를 실패시키는 fail-closed 가드를 추가했다.

## 검증

- `npm run lint:wiki`: 0 errors, 0 warnings
- `npm run maintenance:check`: 0 issues
- `npm run test:site`: 전체 통과
- `npm run build`: 440 pages
- `npm run verify:site`: 5,635 files, 116.41 MiB, 내부 링크 125,587개 검사·깨진 링크 0
- `SITE_BASE=/CS_Wiki SITE_URL=https://example.github.io/CS_Wiki npm run build && npm run verify:site`: 5,637 files, 118.36 MiB, sitemap 1,908개 라우트 검증 통과
- `npm run test:browser`: 21 pass
- 역사 렌즈: dated 200 / undated 234, 시대별 사건 9/5/10/13/45/30/32/56

## 후속

- `verify:site`의 내부 링크 검사는 이제 로그 404 같은 회귀를 자동으로 막는다. 새 정적 페이지를 추가할 때도 `href`/`src`가 실제 파일을 가리키는지 확인해야 한다.
- 공개 범위(`unlisted`/`private`)는 별도 설계가 필요하다. 현재는 빌드 가드로만 막아 두었다.
- `wiki/log.md`는 여전히 수동 목록이다. 항목 수가 아니라 정확한 URL 목록을 생성·검증하는 도구가 다음 후속 작업이다.
- 외부 링크 검사는 주간 Actions에서 이슈를 만들지만, `restricted`(403/401/429) 57건은 자동 검증이 불가능하므로 Wayback·로컬 스냅샷 보강이 필요하다.
