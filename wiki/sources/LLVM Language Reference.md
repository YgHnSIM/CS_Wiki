---
schema_version: 2
id: ref-133
kind: reference
title: LLVM Language Reference
aliases:
  - LLVM LangRef
  - LLVM IR ABI reference
summary: LLVM IR의 target data layout과 calling convention이 machine-level representation과 호출 규약을 어떻게 지정하는지 설명하는 LLVM 공식 문서.
domains:
  - software-engineering
  - programming-languages
  - computer-architecture
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:3343fe22134e5c58321163e01ef377dc3756108bee53d083aa599456b30aa69d
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: LLVM Project, LLVM Language Reference Manual
      genre: web
      identifiers: []
      edition: LLVM 24.0.0git documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://llvm.org/docs/LangRef.html
    retrieved: 2026-08-05
    version: LLVM 24.0.0git documentation at access time
---

## 개요

LLVM Language Reference는 target의 data layout과 calling convention을 IR·code generation이 이해해야 하는 낮은 수준 계약으로 다룬다. 같은 상위 연산이나 MLIR type이라도 target data layout, pointer representation, argument passing과 return convention이 달라지면 ABI 호환성을 자동으로 가정할 수 없다.

## 위키 반영

이 자료는 [[StableHLO·MLIR·ABI 경계]]에서 StableHLO와 MLIR의 의미·구조 계약이 최종 machine ABI 계약과 다르다는 점을 연결한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[StableHLO·MLIR·ABI 경계]] | target data layout과 calling convention을 최종 ABI 검증 대상으로 둔다. | [[LLVM Language Reference]] |
| constrains | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | IR semantics 보존과 binary-level 호출 호환성을 분리한다. | [[LLVM Language Reference]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- LLVM Project, [LLVM Language Reference Manual](https://llvm.org/docs/LangRef.html)

## 관련 항목

- [[StableHLO·MLIR·ABI 경계]] — IR과 ABI의 층위를 연결한다.
- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 의미와 calling convention을 비교한다.
- [[링커]] — ABI가 최종 object 결합과 만나는 지점을 설명한다.
