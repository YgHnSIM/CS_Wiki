---
schema_version: 2
id: concept-runtime-contract
kind: concept
title: runtime contract
aliases:
  - runtime contract
  - 실행 계약
  - 런타임 계약
summary: 모델·컴파일러·backend·서비스가 실행 시 공유해야 하는 입력·출력·상태·자원·오류·수명 조건을 명시하는 계약.
domains:
  - machine-learning
  - systems
  - software-engineering
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:4ae7a3c4ec3d1e10071c2b224d21783f35c9f63776b7da17024bffad5829d55e
  reviewed_at: null
  reviewed_by: null
evidence_ids:
  - ref-125
  - ref-134
  - ref-135
  - ref-136
capability_layers:
  - reliable-results
---

## 개요

[[runtime contract]]는 artifact가 로드된 뒤 실제 실행자가 지켜야 할 조건을 명시한다. 최소한 input/output signature, dtype·shape, state와 buffer ownership, device/backend capability, error·fallback semantics, lifecycle, latency·resource SLO의 경계를 포함해야 한다.

이 계약은 C20의 ABI와 겹치지만 동일하지 않다. ABI가 caller·callee 사이의 binary representation을 고정한다면 runtime contract는 model endpoint와 실행 backend가 어떤 입력을 받아 어떤 상태·오류·자원 조건에서 결과를 내는지 고정한다.

## 계약 항목

| 항목 | 질문 | 사례 |
|---|---|---|
| signature | 어떤 이름·dtype·shape의 입력/출력을 받는가? | SavedModel SignatureDef |
| capability | backend가 어떤 op/subgraph를 실행하는가? | ONNX Execution Provider |
| state | buffer·cache·session state의 수명과 소유자는 누구인가? | runtime/session lifecycle |
| failure | unsupported op·device failure·fallback을 어떻게 관찰하는가? | CPU fallback, explicit error |
| lifecycle | load·start·invoke·stop·delete의 순서는 무엇인가? | OCI runtime lifecycle |
| SLO | latency·throughput·memory·energy의 측정 경계는 어디인가? | serving metrics and policy |

[[TensorFlow SavedModel Signatures]]는 consumer가 호출할 input/output type을 노출하고, [[ONNX Runtime Execution Providers]]는 backend capability와 subgraph placement를 runtime에 연결한다. [[OCI Runtime Specification]]은 configuration·execution environment·lifecycle을 별도 시스템 계약으로 정의한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[runtime contract는 무엇을 보장해야 하는가]] | signature·capability·state·lifecycle·SLO를 검증 틀로 묶는다. | [[TensorFlow SavedModel Signatures]], [[OCI Runtime Specification]] |
| responds_to | [[StableHLO·MLIR·ABI 경계]] | representation과 ABI가 정해진 뒤 실제 실행조건을 명시한다. | [[LLVM Language Reference]], [[OCI Runtime Specification]] |
| constrains | [[AI 컴퓨팅 병목]] | 성능 지표를 runtime contract의 측정 경계와 SLO에 연결한다. | [[ONNX Runtime Execution Providers]] |
| constrains | [[LLM 추론 서비스 지표]] | latency·goodput·fallback을 어떤 endpoint와 상태에서 측정할지 제한한다. | [[TensorFlow SavedModel Signatures]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-125`
- `ref-134`
- `ref-135`
- `ref-136`
<!-- wiki-v2:evidence-end -->

- [[SLSA Build Provenance Specification]]
- [[TensorFlow SavedModel Signatures]]
- [[ONNX Runtime Execution Providers]]
- [[OCI Runtime Specification]]

## 관련 항목

- [[runtime contract는 무엇을 보장해야 하는가]] — 실행 계약의 검증 가능성을 분석한다.
- [[StableHLO·MLIR·ABI 경계]] — runtime으로 들어오는 표현·호출 규약을 설명한다.
- [[AI 컴퓨팅 병목]] — 실행 중 자원 병목을 측정한다.
- [[LLM 추론 서비스 지표]] — endpoint 성능 지표를 정의한다.
- [[ONNX Runtime Execution Providers]] — capability/fallback 구현 사례다.
