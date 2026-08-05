---
schema_version: 2
id: ref-136
kind: reference
title: OCI Runtime Specification
aliases:
  - OCI runtime-spec
  - OCI runtime contract
  - OCI 런타임 명세
summary: container runtime의 configuration, execution environment와 lifecycle을 config.json 및 state로 지정하는 Open Container Initiative 공식 명세.
domains:
  - systems
  - software-engineering
  - security
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:01c01e34aae167bf55865782c70700f4f2568456d93002ebe07b541326378400
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: Open Container Initiative, Runtime Specification
      genre: standard
      identifiers: []
      edition: current runtime specification, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://specs.opencontainers.org/runtime-spec/
    retrieved: 2026-08-05
    version: current specification at access time
---

## 개요

OCI Runtime Specification은 container runtime이 configuration, execution environment와 lifecycle을 어떻게 해석하는지 정한다. `config.json`, create/start/stop/delete lifecycle과 runtime state는 image가 아니라 실행 주체가 지켜야 하는 계약의 예다.

## 위키 반영

이 자료는 [[runtime contract]]에서 artifact identity와 실제 실행환경·lifecycle을 분리하는 시스템 수준 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[runtime contract]] | 실행 configuration과 lifecycle을 명시적 contract로 만든 시스템 사례다. | [[OCI Runtime Specification]] |
| constrains | [[runtime contract는 무엇을 보장해야 하는가]] | load·start·state·delete의 실행 경계를 모델 입력과 구분한다. | [[OCI Runtime Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Open Container Initiative, [Runtime Specification](https://specs.opencontainers.org/runtime-spec/)

## 관련 항목

- [[runtime contract]] — 실행환경과 lifecycle 계약을 정의한다.
- [[runtime contract는 무엇을 보장해야 하는가]] — 모델·backend·container 경계를 비교한다.
