---
schema_version: 3
id: log-2026-10-24-135
kind: meta
title: "2026-10-24 update | P0 원본 보존과 외부 링크 부패 복구"
aliases: []
summary: 외부 링크만 의존하던 소스·참고 자료에 Wayback 아카이브를 추가하고, 깨진 12개 URL을 대체해 보존 커버리지를 147/164로 끌어올린 기록.
domains: []
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-24
updated: 2026-10-24
evidence_ids: []
capability_layers: []
---

## 작업 배경

감사 P0의 핵심은 소스·참고 164개 중 153개가 외부 URL에만 의존하고, 그중 6개가 404, 7개가 타임아웃·5xx·DNS 오류였다는 점이다. 링크가 깨지면 문서의 근거를 다시 확인할 수 없으므로, 단순한 링크 교체가 아니라 **접근 수단 자체를 보존하는 작업**이 필요했다.

## 작업 범위

- Wayback availability/CDX API로 external-only 소스의 URL을 조사해 138개 페이지에 `role: archive` 접근 기록을 추가했다.
- 깨진 링크 6건과 오류 7건을 실제로 열리는 대체 URL로 교체했다.
  - `dsf.berkeley.edu` UNIX PDF → Wayback 아카이브
  - Leibniz *Acta Eruditorum* → Internet Archive의 동일 문헌
  - Hobbes *Elementorum* → Google Books 판본
  - Jeff Dean 프로필 → Wayback 아카이브
  - HotOS *Metastable Failures* → ACM DOI
  - Xerox Courier 디렉터리 → bitsavers의 Courier 명세 PDF
  - Turing 1936 PDF, CWE-20/190, Birrell RPC PDF, Gustafson 글, VisiCalc, McIlroy 글 → 아카이브·대체 PDF·UCI 사본
  - GPTQ의 깨진 ETHZ mirror 제거(arXiv canonical 유지)
- `scripts/wiki_manifest.mjs`: `role: archive` 또는 `archive.org`/`web.archive.org` URL을 `snapshotStatus: archived`로 계산.
- `scripts/audit_preservation.mjs` 추가: 로컬·아카이브·external-only 집계와 잔여 문서 목록 출력. `npm run preservation:audit`로 실행하며 `--json`을 지원.
- `scripts/check_external_links.mjs`: archive URL은 기본 점검에서 제외(`--check-archives`로 포함)해 Wayback에 과도한 요청을 보내지 않도록 했다. 요약에 건너뛴 아카이브 수를 표시.
- `.github/workflows/external-links.yml`: 주간 링크 보고서에 보존 감사 결과를 함께 기록.
- `wiki/overview.md`: `근거 자료 보존(로컬·아카이브): 147/164` 지표 추가.

## 결과

| 항목 | 이전 | 현재 |
|---|---:|---:|
| 로컬 보존 | 9 | 9 |
| 아카이브 보존 | 2 | **138** |
| 외부 링크만 의존 | 153 | **17** |
| 깨진 링크(404) | 6 | **0** |
| 타임아웃·5xx·DNS 오류 | 7 | **3 (1.0%, 임계치 이하)** |
| 보존 커버리지 | 11/164 | **147/164 (90%)** |

남은 17개는 DOI·출판사·WorldCat·Google Books처럼 아카이브 API가 스냅샷을 반환하지 않은 자료다. `npm run preservation:audit`가 목록을 출력하며, 필요하면 개별 로컬 스냅샷으로 보강한다.

## 검증

- `npm run check:links`: 300개 URL 중 242 ok, 55 restricted, **0 broken**, 3 transient/error(1.0%, Cambridge·DOI 일시 오류), 133 archive skipped
- `npm run preservation:audit`: 164 sources, 9 local, 138 archived, 17 external-only
- `npm run lint:wiki`: 0 errors, 0 warnings
- `npm run maintenance:check`: 0 issues
- `npm run test:site`: 158 pass
- `npm run build`: 440 pages
- `npm run verify:site`: 내부 링크 116,906개·깨진 링크 0
- `npm run test:browser`: 21 pass

## 후속

- 남은 17개 external-only는 사용 빈도가 높은 순으로 로컬 snapshot 또는 대체 아카이브를 검토한다.
- `role: archive`는 Wayback 가용성에 의존하므로, 장기 보존이 중요한 자료는 `raw/assets` 로컬 snapshot과 SHA-256 기록으로 승격한다.
- 주간 링크 검사는 원본 URL의 부패를 계속 감시하고, 아카이브는 별도 `--check-archives` 실행으로 점검한다.
