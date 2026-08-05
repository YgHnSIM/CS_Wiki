---
schema_version: 2
id: ref-135
kind: reference
title: ONNX Runtime Execution Providers
aliases:
  - ONNX Runtime EP
  - execution provider contract
  - ONNX 실행 제공자
summary: ONNX Runtime이 같은 API 아래 execution provider의 capability와 node/subgraph 배치를 통해 hardware backend를 연결하는 공식 문서.
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
  revision: sha256:2bb618aa2981e02701ba6bb9a56996b4d6780f101f5c1b39c87ca8f9817a1c4c
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
  - realized-performance
origin: external
works:
  primary:
    - citation: ONNX Runtime, Execution Providers
      genre: web
      identifiers: []
      edition: current documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://onnxruntime.ai/docs/execution-providers/
    retrieved: 2026-08-05
    version: current documentation at access time
---

## 개요

ONNX Runtime은 execution provider가 실행 가능한 node 또는 subgraph를 capability로 보고하고, 공통 API를 통해 CPU·CUDA 등 hardware backend에 작업을 배치하도록 한다. 같은 model API를 유지하면서 backend별 capability, fallback, memory/device 조건을 별도 runtime 계층으로 노출하는 사례다.

## 위키 반영

이 자료는 [[runtime contract]]에서 model representation과 backend execution provider가 맺는 capability·fallback 계약을 분리하는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[runtime contract]] | backend capability와 subgraph placement를 실행 계약의 일부로 보여준다. | [[ONNX Runtime Execution Providers]] |
| constrains | [[runtime contract는 무엇을 보장해야 하는가]] | 같은 model API가 backend capability·fallback 결과와 함께 해석되어야 함을 보여준다. | [[ONNX Runtime Execution Providers]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- ONNX Runtime, [Execution Providers](https://onnxruntime.ai/docs/execution-providers/)

## 관련 항목

- [[runtime contract]] — model·backend·service 사이의 실행 조건을 정의한다.
- [[runtime contract는 무엇을 보장해야 하는가]] — capability와 fallback을 분석한다.
