---
schema_version: 2
id: ref-134
kind: reference
title: TensorFlow SavedModel Signatures
aliases:
  - SavedModel signatures
  - TensorFlow serving signature
  - SavedModel 서명
summary: SavedModel consumer가 호출할 함수의 입력·출력 type과 이름을 SignatureDef로 노출하는 TensorFlow 공식 문서.
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
  revision: sha256:716eac3eaa2e31815cb4ba7cc219d61853d8cbfdadeb536614e92ba28327567b
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: TensorFlow, Using the SavedModel format
      genre: web
      identifiers: []
      edition: current guide, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://www.tensorflow.org/guide/saved_model
    retrieved: 2026-08-05
    version: current guide at access time
---

## 개요

TensorFlow SavedModel은 SignatureDef로 consumer가 호출할 함수의 input·output tensor name, dtype, shape와 method 의미를 확인할 수 있게 한다. 이 signature는 저장된 모델을 Python 밖의 serving API가 호출할 때 필요한 실행 계약의 한 예다.

## 위키 반영

이 자료는 [[runtime contract]]가 model artifact의 함수 경계에서 입력·출력과 상태·실행환경을 명시해야 한다는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[runtime contract]] | serving consumer가 확인할 input·output signature의 구체적 형식을 보여준다. | [[TensorFlow SavedModel Signatures]] |
| constrains | [[runtime contract는 무엇을 보장해야 하는가]] | 모델 파일을 로드하는 것과 호출 가능한 endpoint 계약을 분리한다. | [[TensorFlow SavedModel Signatures]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- TensorFlow, [Using the SavedModel format](https://www.tensorflow.org/guide/saved_model)

## 관련 항목

- [[runtime contract]] — 실행 가능한 입력·출력 계약을 정의한다.
- [[runtime contract는 무엇을 보장해야 하는가]] — runtime boundary의 검증 항목을 분석한다.
