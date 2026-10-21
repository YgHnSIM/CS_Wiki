---
schema_version: 2
id: log-2026-10-21-127
kind: meta
title: "2026-10-21 update | 랑다우어 표기를 란다우어로 일괄 수정"
aliases: []
summary: 위키 전반의 '랑다우어' 외래어 표기를 표준 용례인 '란다우어'로 일괄 수정하고 개념 문서 파일명 및 참조 관계를 동기화한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-21
updated: 2026-10-21
review:
  mode: legacy-baseline
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 배경 및 목적

사용자 요청에 따라, 물리학자 롤프 란다우어(Rolf Landauer) 및 '란다우어 원리(Landauer's principle)'의 한글 표기를 '랑다우어'에서 '란다우어'로 위키 전반에서 일괄 정정했다.

## 작업 범위

- **개념 문서 이동 및 내용 수정**:
  - `wiki/concepts/랑다우어 원리.md` $\to$ `wiki/concepts/란다우어 원리.md` 파일명 변경 (`git mv`).
  - 제목(`title: 란다우어 원리`), 별칭(`aliases`), 본문 서술 내 표기 수정.
- **참조 문서 내 링크 및 표기 수정**:
  - `wiki/analyses/계산은 발명인가 자연 현상인가.md` (`[[란다우어 원리]]`)
  - `wiki/concepts/계산적 인공생명.md` (`[[란다우어 원리]]`, 란다우어의 원리)
  - `wiki/sources/Computational Life.md` ("란다우어")
  - `wiki/sources/Irreversibility and Heat Generation in the Computing Process.md` (롤프 란다우어, 란다우어의 원리, `[[란다우어 원리]]`)
  - `wiki/sources/생명은 계산이며 공생발생으로 진화한다.md` (란다우어 한계, 란다우어의 원리와 지능의 군비 경쟁, `[[란다우어 원리]]`)
- **운영 페이지 및 색인 동기화**:
  - `wiki/log.md`에 이번 작업 로그 등록.
  - `npm run maintenance:generate`를 통한 `wiki/index.md` 및 `wiki/overview.md` 재생성.
  - `scripts/update_wiki_updated.mjs`를 통한 수정 문서들의 해시 및 일자 갱신.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- [[Irreversibility and Heat Generation in the Computing Process]]
- [[란다우어 원리]]

## 관련 항목

- [[란다우어 원리]] — 표기가 정정된 핵심 개념 문서.
- [[Irreversibility and Heat Generation in the Computing Process]] — 란다우어 원리의 서지 출처 논문.
- [[계산은 발명인가 자연 현상인가]] — 란다우어 원리를 참조하는 분석 문서.
