---
schema_version: 2
id: concept-stablehlo-mlir-abi
kind: concept
title: StableHLO·MLIR·ABI 경계
aliases:
  - StableHLO MLIR ABI boundary
  - 표현·IR·ABI 경계
summary: ML 모델의 연산 의미, extensible intermediate representation, target binary calling convention을 서로 다른 보존 계약으로 나누는 컴파일 경계.
domains:
  - machine-learning
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
  revision: sha256:dccc8bcdaaf3392854190991e2b8afb89dcb656b074144c6e3f1cbb7ed74a1be
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids:
  - ref-130
  - ref-131
  - ref-132
  - ref-133
capability_layers:
  - reliable-results
---

## 개요

[[StableHLO·MLIR·ABI 경계]]는 같은 모델이 여러 compiler와 runtime을 통과할 때 보존해야 하는 것을 세 층으로 나누는 개념이다.

- StableHLO: ML 연산과 tensor semantics, framework-compiler portability.
- MLIR: operation·type·region·dialect와 lowering pipeline의 구조.
- ABI: target data layout, symbol, calling convention, argument·return representation과 binary linkage.

상위 층의 “의미가 같다”는 하위 층의 “같은 bytes·같은 호출 규약”을 뜻하지 않는다. 각 lowering은 어떤 semantics와 type invariant를 보존하는지, 어떤 target-specific 조건을 새로 도입하는지를 명시해야 한다.

## 경계별 계약

| 경계 | 보존해야 할 것 | 바뀔 수 있는 것 |
|---|---|---|
| framework → StableHLO | op semantics, shape/type, numerical rules | framework 내부 graph 표현 |
| StableHLO → MLIR | operation 의미와 verifier 조건 | dialect/container, attributes, region layout |
| MLIR → LLVM IR | lower된 types, control/data flow, target annotations | backend-specific representation |
| LLVM IR → ABI | data layout, calling convention, symbol/linkage | register allocation, instruction selection |
| ABI → runtime | pointer/handle ownership, argument lifetime, error/return convention | scheduler, device placement, cache policy |

[[StableHLO Compatibility]]의 version window는 portable artifact의 semantics를 대상으로 하며, ABI compatibility를 자동으로 덮지 않는다. [[LLVM Language Reference]]가 설명하는 data layout과 calling convention은 별도의 target 계약이다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | StableHLO semantics, MLIR structure, ABI calling convention을 비교 틀로 묶는다. | [[StableHLO Specification]], [[MLIR Language Reference]], [[LLVM Language Reference]] |
| responds_to | [[dependency provenance와 registry identity]] | compiler·toolchain dependency가 어떤 representation 경계를 제공하는지 연결한다. | [[SLSA Build Provenance Specification]] |
| constrains | [[컴파일러]] | lowering 단계마다 보존 invariant와 target 조건을 명시하게 한다. | [[MLIR Language Reference]] |
| constrains | [[링커]] | ABI symbol·object 결합이 표현 의미와 다른 계약임을 드러낸다. | [[LLVM Language Reference]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-130`
- `ref-131`
- `ref-132`
- `ref-133`
<!-- wiki-v2:evidence-end -->

- [[StableHLO Specification]]
- [[StableHLO Compatibility]]
- [[MLIR Language Reference]]
- [[LLVM Language Reference]]

## 관련 항목

- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 각 lowering 경계의 불변조건을 분석한다.
- [[컴파일러]] — 의미 보존과 lowering의 일반 계층을 설명한다.
- [[링커]] — ABI와 object 결합의 관계를 다룬다.
- [[dependency provenance와 registry identity]] — compiler dependency를 고정하는 선행 단계다.
- [[runtime contract]] — ABI 이후 실행 주체가 지켜야 할 계약을 정의한다.
