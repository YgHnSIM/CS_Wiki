---
schema_version: 2
id: ref-120
kind: reference
title: "Gray Failure: The Achilles' Heel of Cloud-Scale Systems"
aliases:
  - Gray Failure
  - gray failure
  - 회색 장애
summary: 구성 요소가 완전히 죽지 않고 일부 요청·경로·관찰자에게만 다르게 보이는 gray failure를 정의하고, 이진 health 판단의 한계를 분석한 Microsoft Research 논문.
domains:
  - distributed-systems
  - reliability
  - cloud-computing
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:3405d78a9992ce1c3f7a76a03f4f67bcac47ece7d0cf2df4b7f4f94861cd75a4
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
  - service-contracts
history:
  publication_year: 2017
  layer: system
origin: external
works:
  primary:
    - citation: "Huang, Kong, Zhou, and others, Gray Failure: The Achilles' Heel of Cloud-Scale Systems"
      genre: primary-literature
      identifiers: []
      edition: HotOS 2017
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://www.microsoft.com/en-us/research/publication/gray-failure-achilles-heel-cloud-scale-systems/
    retrieved: 2026-08-05
    version: null
---

## 개요

[[Gray Failure: The Achilles' Heel of Cloud-Scale Systems]]는 구성 요소가 완전히 정지하지 않았지만 일부 요청·클라이언트·모니터에게만 느리거나 잘못된 결과를 제공하는 gray failure를 분석한다. 한 health check가 성공했다고 해서 모든 사용자 경로가 정상이라는 뜻은 아니다.

Gray failure는 binary up/down detector가 놓치기 쉬운 차이를 만든다. 데이터 경로와 control path, 서로 다른 replica, 서로 다른 요청 종류의 관찰을 함께 비교해야 하며, 단순 heartbeat 성공을 semantic correctness의 증거로 확장해서는 안 된다.

## 위키 반영

이 자료는 [[장애 감지]]에서 crash suspicion과 사용자-visible semantic failure를 분리하고, 부분별·경로별 관찰을 failure model에 포함하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[장애 감지]] | binary liveness를 넘어 경로·요청별 차이를 관찰해야 하는 failure detection 범위를 제공한다. | [[Gray Failure: The Achilles' Heel of Cloud-Scale Systems]] |
| constrains | [[부분 실패]] | 일부 경로만 느리거나 잘못된 결과를 내는 상태를 전체 장애와 분리한다. | [[Gray Failure: The Achilles' Heel of Cloud-Scale Systems]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Microsoft Research, [Gray Failure: The Achilles' Heel of Cloud-Scale Systems](https://www.microsoft.com/en-us/research/publication/gray-failure-achilles-heel-cloud-scale-systems/)

## 관련 항목

- [[장애 감지]] — suspicion·gray·semantic failure를 구분한다.
- [[부분 실패]] — 시스템 일부의 관찰과 실제 전체 상태가 갈라지는 조건을 다룬다.
- [[가용성과 복구]] — 감지 결과가 사용자-facing 격리·복구 정책으로 이어지는 경계를 설명한다.
