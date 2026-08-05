---
schema_version: 2
id: analysis-runtime-contract
kind: analysis
title: runtime contract는 무엇을 보장해야 하는가
aliases:
  - runtime contract analysis
  - 실행 계약 분석
summary: SavedModel signature, ONNX execution provider, OCI runtime lifecycle을 비교해 model·backend·container·service 사이의 실행 보장과 미해결 경계를 분석한다.
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
  revision: sha256:fcf76666d8b4a1ddaa988a38c6be25a086246d31ebf057b2766e2a7ab88c336a
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

## 분석 질문

컴파일된 model artifact가 존재하고 ABI 호출이 가능해도, 실제 runtime이 같은 결과를 낸다는 보장은 자동으로 생기지 않는다. runtime contract는 endpoint가 어떤 input을 받고, 어느 backend가 어떤 subgraph를 처리하며, state·error·lifecycle·SLO를 어떻게 관찰할지 명시해야 한다.

## 사례 비교

| 사례 | 계약의 중심 | 관찰할 실패 |
|---|---|---|
| SavedModel | named signature와 tensor dtype/shape | signature 누락, input key/type mismatch |
| ONNX Runtime EP | provider capability와 node/subgraph assignment | unsupported op, provider fallback, device mismatch |
| OCI runtime | config, execution environment, lifecycle/state | create/start/stop 순서, state·resource isolation |

SavedModel의 signature는 모델 파일을 serving API가 호출할 수 있는 함수 경계로 만든다. ONNX Runtime은 공통 API를 유지하면서 backend가 가능한 node를 선택하고 나머지를 fallback할 수 있으므로, “같은 모델”과 “같은 backend 경로”를 구분해야 한다. OCI runtime은 모델 형식과는 다른 층에서 실행환경과 lifecycle을 규격화하므로, container가 실행된다고 model endpoint contract까지 검증되는 것은 아니다.

## 보장과 측정의 분리

runtime contract의 보장 항목은 적어도 다음 네 층으로 나뉜다.

1. **입력 의미**: name·dtype·shape·layout·encoding.
2. **실행 경로**: selected provider, fallback, device placement, kernel support.
3. **상태와 오류**: buffer/session/cache ownership, retry, partial result, explicit error.
4. **운영 결과**: latency percentile, goodput, memory, energy와 측정 경계.

이 분석은 [[AI 컴퓨팅 병목]]의 성능 병목을 새로 정의하지 않는다. 기존 AI 문서의 지표를 어떤 endpoint·backend·fallback 조건에서 측정했는지 확인할 수 있게 하는 contract layer다.

## 이전 pair와의 중복 경계

C18 [[재현 가능한 빌드]]는 동일 artifact를 만드는 build contract, C19 dependency provenance는 외부 입력과 publisher를 추적하는 supply-chain contract, C20 [[StableHLO·MLIR·ABI 경계]]는 representation·lowering·binary call contract다. C21 runtime contract는 이 결과가 실제 실행에서 어떤 입·출력·상태·lifecycle·SLO를 지켜야 하는지 다룬다.

## 미해결 사항

- backend fallback이 수치 정확성·성능·오류 의미를 어떻게 바꾸는지는 provider별 실행 검증이 필요하다.
- stateful model과 KV cache의 ownership·eviction·재시작 의미는 별도 serving 사례 조사가 필요하다.
- latency·energy SLO는 contract에 선언할 수 있지만, 측정 harness와 부하 분포까지 포함하지 않으면 재현 가능한 비교가 아니다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[runtime contract]] | signature·capability·state·lifecycle·SLO를 실행 검증 질문으로 정리한다. | [[TensorFlow SavedModel Signatures]], [[ONNX Runtime Execution Providers]], [[OCI Runtime Specification]] |
| responds_to | [[표현·IR·ABI 경계는 무엇을 보존하는가]] | representation과 ABI 경계 이후의 실행 조건을 분석한다. | [[LLVM Language Reference]], [[OCI Runtime Specification]] |
| constrains | [[AI 컴퓨팅 병목]] | benchmark 지표의 endpoint·provider·fallback 측정 경계를 명시한다. | [[ONNX Runtime Execution Providers]] |
| measures | [[LLM 추론 서비스 지표]] | runtime contract가 지연·goodput을 의미 있는 요청 단위에 연결한다. | [[TensorFlow SavedModel Signatures]] |

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

- [[runtime contract]] — 실행 계약의 필드를 정의한다.
- [[표현·IR·ABI 경계는 무엇을 보존하는가]] — 이전 compiler 경계의 보존 항목이다.
- [[AI 컴퓨팅 병목]] — runtime 결과가 제한되는 자원을 분석한다.
- [[LLM 추론 서비스 지표]] — 지연·goodput·운영 측정의 기존 문서다.
- [[ONNX Runtime Execution Providers]] — backend capability와 fallback 사례다.
