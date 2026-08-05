---
schema_version: 2
id: analysis-stablehlo-mlir-abi-boundary
kind: analysis
title: 표현·IR·ABI 경계는 무엇을 보존하는가
aliases:
  - StableHLO MLIR ABI boundary analysis
  - compiler boundary preservation
summary: StableHLO·MLIR·LLVM ABI 자료를 비교해 semantics, type/region structure, data layout와 calling convention이 각 단계에서 어떻게 보존·변환되는지 분석한다.
domains:
  - machine-learning
  - software-engineering
  - programming-languages
  - computer-architecture
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:a450eba8f32ebbb9bfe6c18c92358f7f528eeca472ab71d20c431f8049e597d4
  reviewed_at: null
  reviewed_by: null
evidence_ids:
  - ref-130
  - ref-131
  - ref-132
  - ref-133
capability_layers:
  - reliable-results
---

## 분석 질문

한 모델이 framework에서 compiler, runtime, device code로 이동할 때 “같은 모델”이라고 부를 수 있는 근거는 무엇인가? 파일을 읽을 수 있다는 사실, IR verifier를 통과했다는 사실, 같은 수치 결과를 낸다는 사실, ABI 호출이 성공했다는 사실은 서로 다른 관찰이다.

## 보존 행렬

| 단계 | 관찰 가능한 계약 | 실패 예 |
|---|---|---|
| StableHLO | op semantics, tensor shape/type, version compatibility | unsupported op, shape constraint 위반 |
| MLIR | dialect operation, SSA value type, region/control structure | conversion pass가 type invariant를 잃음 |
| LLVM IR | target data layout, pointer/type lowering, calling convention | target triple·layout 불일치 |
| ABI | argument/return layout, symbol/linkage, ownership/lifetime | caller와 callee가 다른 convention을 사용 |
| runtime | device capability, buffer ownership, error and lifecycle | 실행 provider fallback 또는 state mismatch |

StableHLO spec는 ML operation의 semantics를 정의하고, compatibility 문서는 portable artifact의 version window를 설명한다. MLIR LangRef는 extensible dialect와 operation graph를 제공한다. LLVM LangRef는 data layout과 calling convention을 target code generation의 계약으로 둔다. 따라서 “StableHLO 파일을 저장했다”만으로 MLIR pass와 ABI 호출의 호환성을 결론낼 수 없다.

## 핵심 구별

1. **표현 호환성**: parser·serializer가 파일을 읽고 쓰는가.
2. **의미 호환성**: 같은 op와 type이 같은 계산 semantics를 갖는가.
3. **낮춤 호환성**: conversion이 type·shape·control invariant를 유지하는가.
4. **ABI 호환성**: 독립적으로 빌드된 caller·callee가 동일한 binary convention을 사용하는가.
5. **실행 호환성**: runtime이 device·buffer·error·lifecycle 조건을 만족하는가.

## 기존 문서와의 중복 경계

이 pair는 [[AI 컴퓨팅 병목]]이나 [[계산-통신 중첩]]의 runtime performance bottleneck을 분석하지 않는다. 같은 accelerator를 사용하더라도 여기서의 질문은 통신 시간이 아니라 representation과 call boundary가 의미를 보존하는지다. 또한 C18의 재현 가능한 빌드는 동일 artifact를 만들기 위한 build contract이고, C20은 그 artifact 내부 표현과 ABI의 호환성 contract다.

## 검증 계획과 미해결 사항

- 각 StableHLO version pair에 대해 serialize/deserialize 후 semantics와 compatibility window를 확인해야 한다.
- 대표 dialect lowering의 verifier·type conversion과 LLVM target data layout을 실제 toolchain에서 검사해야 한다.
- ABI는 target·compiler·calling convention별 실행 fixture가 필요하며, 문서만으로 “binary compatible”를 일반화하지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[StableHLO·MLIR·ABI 경계]] | 표현·IR·ABI의 보존 항목을 하나의 경계 모델로 정리한다. | [[StableHLO Compatibility]], [[MLIR Language Reference]], [[LLVM Language Reference]] |
| responds_to | [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] | compiler와 toolchain dependency가 고정된 뒤 representation compatibility를 검증한다. | [[SLSA Build Provenance Specification]] |
| precedes | [[runtime contract]] | ABI 이후 device capability·buffer ownership·lifecycle 계약으로 이어진다. | [[LLVM Language Reference]] |
| constrains | [[컴파일러]] | lowering pass의 verifier와 target-specific assumptions를 검증 대상으로 둔다. | [[MLIR Language Reference]] |

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

- [[StableHLO·MLIR·ABI 경계]] — 개념 정의와 경계별 계약을 제공한다.
- [[컴파일러]] — source semantics에서 machine code로 내려가는 일반 맥락이다.
- [[링커]] — ABI symbol과 object 결합을 다룬다.
- [[runtime contract]] — ABI 이후 실제 실행환경 계약을 분석한다.
- [[dependency provenance와 registry identity]] — compiler dependency와 artifact identity를 고정한다.
