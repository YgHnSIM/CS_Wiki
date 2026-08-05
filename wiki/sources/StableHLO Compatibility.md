---
schema_version: 2
id: ref-131
kind: reference
title: StableHLO Compatibility
aliases:
  - StableHLO compatibility guarantees
  - StableHLO 호환성
summary: StableHLO portable artifact의 versioning과 backward·forward compatibility window를 정의하는 OpenXLA 공식 문서.
domains:
  - machine-learning
  - programming-languages
  - software-engineering
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:45acfd2ba04cbb398f1da01959d07ebcc70ef513ee30f8753a58f0e8d9171307
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: OpenXLA, StableHLO Compatibility
      genre: standard
      identifiers: []
      edition: current compatibility documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://openxla.org/stablehlo/compatibility
    retrieved: 2026-08-05
    version: current documentation at access time
---

## 개요

StableHLO compatibility 문서는 portable artifact의 serialization version과 semantics를 기준으로 backward·forward compatibility window를 구분한다. 호환성은 단순히 파일이 열리는지보다, 서로 다른 버전의 library가 artifact를 deserialize했을 때 의미가 유지되는지에 대한 조건이다.

## 위키 반영

이 자료는 [[StableHLO·MLIR·ABI 경계]]에서 IR versioning과 backend ABI를 같은 호환성으로 취급하지 않도록 하는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[StableHLO·MLIR·ABI 경계]] | portable artifact의 version window와 ABI 호환성을 분리한다. | [[StableHLO Compatibility]] |
| constrains | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | 파일 호환성과 의미·호출 규약 보존을 서로 다른 판정으로 둔다. | [[StableHLO Compatibility]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- OpenXLA, [StableHLO Compatibility](https://openxla.org/stablehlo/compatibility)

## 관련 항목

- [[StableHLO·MLIR·ABI 경계]] — versioning과 ABI를 연결한다.
- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 각 경계의 호환성 판정을 비교한다.
