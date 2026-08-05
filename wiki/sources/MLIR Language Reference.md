---
schema_version: 2
id: ref-132
kind: reference
title: MLIR Language Reference
aliases:
  - MLIR LangRef
  - MLIR 언어 참조
summary: MLIR의 operation·value·type·block·region·dialect 구조와 여러 abstraction level을 하나의 extensible IR로 표현하는 LLVM 공식 문서.
domains:
  - software-engineering
  - programming-languages
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:90f4203124ef51c928ad7522cbeb01b9d5d218b2b94244ff8cd55f3bc2f7ba0b
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: LLVM Project, MLIR Language Reference
      genre: web
      identifiers: []
      edition: current documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://mlir.llvm.org/docs/LangRef/
    retrieved: 2026-08-05
    version: current documentation at access time
---

## 개요

MLIR은 operation, value, type, block, region을 이용해 서로 다른 abstraction level의 프로그램을 표현하고 dialect로 operation·attribute·type 집합을 확장한다. 이 구조는 상위 의미를 낮은 수준 표현으로 단계적으로 lower하는 공간을 제공하지만, 각 dialect의 verifier와 conversion이 의미를 어떻게 보존하는지는 별도 계약이다.

## 위키 반영

이 자료는 [[StableHLO·MLIR·ABI 경계]]에서 StableHLO operation이 MLIR 구조 안에 놓이는 방식과 backend ABI로 내려가기 전의 IR 경계를 설명하는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[StableHLO·MLIR·ABI 경계]] | operation·type·dialect를 통해 중간 표현의 구조적 경계를 제공한다. | [[MLIR Language Reference]] |
| constrains | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | dialect conversion이 보존해야 할 type·operation·region semantics를 분리한다. | [[MLIR Language Reference]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- LLVM Project, [MLIR Language Reference](https://mlir.llvm.org/docs/LangRef/)

## 관련 항목

- [[StableHLO·MLIR·ABI 경계]] — ML IR에서 ABI로 내려가는 경계를 설명한다.
- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 구조·의미·호출 규약을 비교한다.
- [[컴파일러]] — IR lowering의 일반 맥락을 제공한다.
