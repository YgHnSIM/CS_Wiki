---
schema_version: 2
id: ref-121
kind: reference
title: Metastable Failures
aliases:
  - metastable failure
  - metastable failures in distributed systems
  - 메타안정 장애
summary: 장애가 단순히 사라지지 않고 부하·재시도·복구 상호작용으로 자기 유지되는 metastable failure를 정의하고, overload feedback의 운영 경계를 분석한 HotOS 논문.
domains:
  - distributed-systems
  - systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:ee79c639e7be4c4b5704fb698628997f821960fe0fe3ef3886d80893dbe0ce34
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
history:
  publication_year: 2021
  layer: system
origin: external
works:
  primary:
    - citation: Bronson, Aiken, and others, Metastable Failures in the Wild
      genre: primary-literature
      identifiers: []
      edition: HotOS 2021
  supporting: []
access:
  - kind: url
    role: mirror
    url: https://sigops.org/s/conferences/hotos/2021/papers/hotos21-bronson.pdf
    retrieved: 2026-08-05
    version: HotOS 2021 paper PDF
---

## 개요

[[Metastable Failures]]는 일부 장애가 외부 입력이 줄어들어도 바로 회복되지 않고, 부하·큐·재시도·복구 동작의 피드백으로 자기 유지되는 운영 상태를 분석한다. 서비스가 정상과 장애 사이의 안정된 두 상태만 오간다고 가정하면 복구 경로의 중요한 위험을 놓칠 수 있다.

이 용어는 모든 느린 응답이나 모든 overload를 뜻하지 않는다. 조사에서는 초기 SRE식 self-sustaining overload 설명과 이후 causal feedback을 강조하는 설명 사이의 범위를 분리했으며, 단순 tail latency를 metastable failure로 부르지 않는다.

## 위키 반영

이 자료는 [[장애 감지]]에서 탐지기가 보는 suspicion과 시스템이 자기 유지하는 causal feedback을 서로 다른 관찰 층으로 기록하는 근거로 사용한다. 감지 threshold를 조정하는 것만으로 metastable 상태가 해소된다고 주장하지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[장애 감지]] | 관찰·의심·복구 신호와 자기 유지되는 overload causal chain을 분리하게 한다. | [[Metastable Failures]] |
| constrains | [[대기열과 부하 제어]] | 큐·재시도·admission 정책이 안정화 조건과 회복 경로를 바꿀 수 있음을 드러낸다. | [[Metastable Failures]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- HotOS, [Metastable Failures](https://sigops.org/s/conferences/hotos/2021/papers/hotos21-bronson.pdf)

## 관련 항목

- [[장애 감지]] — detector suspicion과 causal failure state를 구분한다.
- [[대기열과 부하 제어]] — 큐·거부·load shedding을 안정화 수단으로 분석한다.
- [[부분 실패]] — 부분 장애가 다른 구성 요소의 부하와 관찰을 바꾸는 조건을 설명한다.
