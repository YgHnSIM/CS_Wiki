---
schema_version: 2
id: ref-130
kind: reference
title: StableHLO Specification
aliases:
  - StableHLO spec
  - StableHLO 명세
summary: ML framework와 compiler 사이의 portability layer인 StableHLO의 program·operation·type·execution semantics를 정의하는 OpenXLA 공식 명세.
domains:
  - machine-learning
  - programming-languages
  - software-engineering
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:d36a1ff84310c4074fb09842f985bf962415b411ecd3f011e51747a4301f87dd
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: OpenXLA, StableHLO Specification
      genre: standard
      identifiers: []
      edition: current specification, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://openxla.org/stablehlo/spec
    retrieved: 2026-08-05
    version: current specification at access time
---

## 개요

StableHLO는 ML framework가 생성하고 ML compiler가 소비할 수 있는 고수준 연산 집합이며, program·function·operation·type과 실행 semantics를 명세한다. framework와 compiler 사이의 portability layer라는 위치가 핵심이며, 특정 backend의 machine ABI를 대신 정의하지 않는다.

## 위키 반영

이 자료는 [[StableHLO·MLIR·ABI 경계]]에서 모델 의미와 중간 표현의 경계를 설명하는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[StableHLO·MLIR·ABI 경계]] | framework와 compiler 사이에서 보존해야 하는 ML operation semantics를 제공한다. | [[StableHLO Specification]] |
| constrains | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | StableHLO의 의미 보존과 backend ABI를 다른 층으로 나누게 한다. | [[StableHLO Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- OpenXLA, [StableHLO Specification](https://openxla.org/stablehlo/spec)

## 관련 항목

- [[StableHLO·MLIR·ABI 경계]] — representation과 ABI를 연결한다.
- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 의미·호출 규약·실행 경계를 비교한다.
