---
schema_version: 2
id: log-2026-10-23-133
kind: meta
title: "2026-10-23 update | unlisted 공개 범위 구현과 초안 43건 전환"
aliases: []
summary: publication_visibility의 unlisted 의미를 사이트 전 경로에 구현하고 공개 초안 43건을 unlisted로 전환한 기록.
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

감사에서 `publication_visibility`가 스키마에만 있고 빌드·목록·검색·사이트맵은 이를 무시하며, `draft` 43건이 `public`으로 노출되는 것을 확인했다. 직전 단계에서는 `public`이 아닌 페이지가 있으면 빌드를 실패시키는 fail-closed 가드만 두었다. 이번에는 `unlisted`의 의미를 실제로 구현하고, 공개 초안을 `unlisted`로 전환했다.

## 공개 범위 정의

- `public`: 목록·검색·사이트맵·홈·그래프 렌즈·학습 경로에 노출한다.
- `unlisted`: 페이지와 URL은 빌드하되 `noindex`를 붙이고, 목록·검색·사이트맵·홈·그래프 렌즈·학습 경로에서 제외한다. 직접 링크와 위키링크로는 접근할 수 있다.
- `private`: 라우팅·제거 의미를 아직 구현하지 않았으므로 공개 빌드가 실패한다(fail-closed).

## 작업 범위

- `site/core.mjs`: `isDiscoverablePage()`를 추가하고 `selectSiteDiscoveryPages()`가 `public`이 아닌 페이지를 제외하도록 변경했다.
- `site/graph/model.mjs`: 노드에 `publicationVisibility`를 싣고, `unlisted` 노드의 `visibility`를 `hidden`으로 낮춰 역사·근거·연결 렌즈에서 제외했다.
- `site/build.mjs`: `unlisted` 문서에 `<meta name="robots" content="noindex">`를 추가하고, 학습 경로 역·검색·목록·사이트맵·홈 집계에서 제외했다.
- `site/verify-build.mjs`: 검증 그래프와 합성 발견 페이지에 같은 규칙을 적용했다.
- `scripts/generate_operational_pages.mjs`: `wiki/index.md`와 `wiki/overview.md`를 공개 문서만으로 생성하고, 전체/공개 목록 수를 분리해 표시한다.
- `wiki/**` 중 `editorial_status: draft`이고 `publication_visibility: public`이던 43개 페이지를 `unlisted`로 전환하고 revision을 갱신했다.
- `site/visibility.mjs`: `unlisted`는 허용하고 `private`만 실패시키도록 가드를 조정했다.
- `schema/README.md`, `AGENTS.md`: 공개 범위 의미와 초안 정책을 명문화했다.

## 결과

- 전체 페이지 437개(생성 운영 페이지 3개 제외), 공개 목록 394개, unlisted 43개.
- 검색 인덱스 396개, 사이트맵 1,747개 라우트, 학습 경로 344개 역.
- 역사 렌즈 392개 문서, 근거 렌즈 245개 문서 단언.
- 출력 107.59MiB / 5,079파일(전환 전 116.48MiB / 5,635파일).

## 검증

- `npm run lint:wiki`: 0 errors, 0 warnings
- `npm run maintenance:check`: 0 issues
- `npm run test:site`: 161 pass
- `npm run build`: 440 pages
- `npm run verify:site`: 내부 링크 116,906개·깨진 링크 0
- `SITE_BASE=/CS_Wiki` 빌드·검증: 사이트맵 1,747개 라우트, unlisted 문서 사이트맵 제외 확인
- `npm run test:browser`: 21 pass

## 후속

- `private`는 여전히 미지원이다. 빌드 제외·리다이렉트·링크 처리 정책을 정한 뒤 구현해야 한다.
- 초안 43건 중 17건은 소스·참고 자료이며, 일부는 공개 문서의 `evidence_ids`에서 직접 인용된다. 인용은 유지되지만 전역 근거 렌즈에서는 빠지므로, 초안 소스의 인용 정책은 별도로 검토해야 한다.
- 학습 경로에서 제외된 초안 16개 역의 대체 문서를 검토해야 한다.
