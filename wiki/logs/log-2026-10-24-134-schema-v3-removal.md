---
schema_version: 3
id: log-2026-10-24-134
kind: meta
title: "2026-10-24 update | 스키마 v3 전환과 review·editorial_status·private 제거"
aliases: []
summary: 문서별 검토 도장과 편집 상태, private 옵션을 제거하고 공개 범위 중심의 스키마 v3으로 440쪽을 마이그레이션한 기록.
domains: []
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-24
updated: 2026-10-24
evidence_ids: []
capability_layers: []
---

## 작업 배경

기존 v2 스키마는 `review`(검토 모드·revision·검토자), `editorial_status`(draft/review/active/retired), `publication_visibility: private`를 제공했지만 실제 동작과 신뢰가 일치하지 않았다. revision은 편집 도구가 자동 재계산해 검토 증거가 아니었고, 사이트는 `active`를 “원문 대조 완료”로 표시했으며, 정적 공개 사이트는 private를 보장할 수 없었다. 2026-10-23 감사에서 이 세 가지를 제거하고 공개 범위 중심의 최소 계약으로 전환하기로 결정했다.

## 작업 범위

- `schema/wiki-page.schema.json`: `schema_version: 3`, `review`·`editorial_status` 제거, `publication_visibility`를 `public`/`unlisted`로 축소, 선택적 `superseded_by` 추가.
- `schema/vocabulary.json`: `editorial_statuses`와 `private` 제거, 스키마 버전 3.
- `scripts/migrate_wiki_v3.mjs`: v2 페이지에서 `review`·`editorial_status`를 제거하고 `schema_version: 3`으로 변환. `draft`/`review`/`retired`는 `unlisted`로, `private`는 `unlisted`로 안전하게 매핑. 로그는 역사 기록으로 남김.
- `scripts/wiki_manifest.mjs`: v3 매니페스트, `review`/status/tag/revision 제거, `superseded_by` 노출.
- `scripts/wiki_lint.mjs`: revision/pending 검사 제거, 공개 지식 문서의 `evidence_ids` 최소선과 `superseded_by` 검증 추가.
- `scripts/validate_change_set.mjs`: schema v3, review attestation 제거, 모든 변경 페이지의 `updated == 오늘` 검사.
- `scripts/update_wiki_updated.mjs`, `wiki_maintenance.mjs`, `generate_operational_pages.mjs`: revision/review 로직 제거, 날짜·본문만 갱신.
- `scripts/migrate_wiki_v2.mjs` 삭제(더 이상 유효하지 않은 v2 전용 도구).
- `site/`: `statusMeta`·상태 배지·상태 필터·검색 상태·그래프/근거/역사 status 필드·draft 정렬 감점 제거. `unlisted` 문서에는 “미등록 문서” 배너, `superseded_by`에는 “대체된 문서” 배너.
- `site/content.mjs`: 사용되지 않던 v2 `parseWikiPage` 제거.
- `wiki/index.md`·`wiki/overview.md`: 공개 문서만 색인하고, 미등록 문서 수와 공개 지식 근거 커버리지를 표시.
- `AGENTS.md`, `schema/README.md`, `README.md`, `readmeplus.md`: v3 계약과 `unlisted → public` 운영 규칙 반영.
- 마이그레이션 전 감사 데이터: `output/metadata-audit-2026-10-24.json`(440쪽의 review/status/visibility 스냅샷).

## 결과

- 440쪽 전부 `schema_version: 3`, `review`·`editorial_status` 0건.
- 공개 394, unlisted 43, private 0.
- 사이트 출력 106.31MiB / 5,079파일(이전 107.59MiB / 5,079파일).
- 검색 인덱스에서 43개 unlisted 문서 제외, 해당 문서 43개 `noindex` 확인.
- `superseded_by` 필드는 스키마·린트·배너에 연결했으며 현재 사용 문서는 0건.

## 검증

- `npm run lint:wiki`: 0 errors, 0 warnings
- `npm run maintenance:check`: 0 issues
- `npm run test:site`: 158 pass
- `npm run build`: 440 pages
- `npm run verify:site`: 내부 링크 116,906개·깨진 링크 0, unlisted `noindex` 확인
- `npm run test:browser`: 21 pass
- `npm run fonts:check`: 1,177 codepoints covered

## 후속

- `superseded_by`를 실제 퇴역 문서에 적용할 때는 대상 ID 존재·자기 참조 금지·unlisted 조건을 린트가 검사한다.
- 검토 이력은 이제 PR·`wiki/logs/`·Git 히스토리로 관리한다. 문서별 “검토 완료” 주장은 하지 않는다.
- 공개 지식 문서의 근거 최소선은 린트가 강제하지만, 근거의 질·원문 대조는 자동화할 수 없으므로 PR 검토가 필요하다.
