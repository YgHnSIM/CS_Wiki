---
schema_version: 2
id: log-2026-09-18-119
kind: meta
title: 2026-09-18 update | 단일근거 legacy 개념 11건 근거 보강
aliases: []
summary: 단일 근거·legacy-baseline 개념 11건에 2nd evidence를 붙이고 attested로 승격했다. 필요 companion 참고문헌 3건을 추가했다.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-09-18
updated: 2026-09-18
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

지식관리 점검에서 지적한 단일근거+legacy 개념 11건을 보강했다. 기존 참고문헌으로 충분한 항목은 교차 근거를 추가했고, NFS·RPC 역사·Clark 인터넷 설계철학 companion 참고문헌 3건을 새로 넣었다.

## 변경

- CAP 정리, Manchester Baby, 리틀의 법칙, 목표 품질 도달 시간, 본질적/부수적 복잡성, 비잔틴 장애, 외부 일관성과 시간 불확실성, 추측 디코딩에 2nd evidence를 추가했다.
- 분산 파일 시스템·원격 프로시저 호출·종단 간 원칙을 위해 `ref-139`~`ref-141`을 추가하고 연결했다.
- 해당 개념의 `review.mode`를 `legacy-baseline`에서 `attested`로 바꿨다.

## 검증

- `npm run maintenance:updated`
- `npm run lint:wiki`
- `npm run maintenance:check`

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

## 관련 항목

- [[CAP 정리]]
- [[종단 간 원칙]]
- [[분산 파일 시스템]]
