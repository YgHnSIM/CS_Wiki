---
schema_version: 2
id: ref-112
kind: reference
title: "Serializable Isolation for Snapshot Databases"
aliases:
  - Cahill Röhm Fekete SSI
  - Serializable Snapshot Isolation
  - 스냅샷 데이터베이스의 직렬 가능 격리
summary: snapshot isolation이 허용하는 write skew를 설명하고, 읽기와 쓰기의 비차단 특성을 유지하면서 직렬 가능성을 검사하는 SSI 알고리즘을 제안한 연구.
domains:
  - databases
  - concurrency
  - distributed-systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:695a7a98289852fe6df496cd52c5296b3cf19f81a9970cb7df01740ebce7ba3c
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
  - scalability
history:
  publication_year: 2008
  layer: theory
origin: external
works:
  primary:
    - citation: "Michael J. Cahill, Uwe Röhm, and Alan D. Fekete, Serializable Isolation for Snapshot Databases, SIGMOD 2008"
      genre: primary-literature
      identifiers: []
      edition: SIGMOD 2008, June 2008
  supporting: []
access:
  - kind: url
    role: mirror
    url: https://www.cs.cornell.edu/~sowell/dbpapers/serializable_isolation.pdf
    retrieved: 2026-08-05
    version: SIGMOD 2008 paper PDF
---

## 개요

[[Serializable Isolation for Snapshot Databases]]는 snapshot isolation(SI)이 각 트랜잭션의 읽기를 안정적으로 만들면서도 write skew와 같은 비직렬 실행을 허용할 수 있음을 설명한다. 두 트랜잭션이 서로 다른 행을 바꾸더라도 함께 유지되어야 할 불변식을 동시에 읽고 판단하면, 각각은 단독 실행에서 올바르지만 함께 커밋한 결과는 잘못될 수 있다.

이 논문은 read/write dependency를 실행 중 추적해 위험한 구조를 감지하는 Serializable Snapshot Isolation(SSI)을 제안한다. 핵심은 읽기가 쓰기를 항상 막아야 한다는 것이 아니라, 직렬 순서로 설명할 수 없는 커밋을 중단하고 애플리케이션이 재시도하도록 만드는 것이다.

## 위키 반영

이 자료는 [[직렬 가능성]]의 “snapshot visibility와 serial equivalence는 다르다”는 경계를 뒷받침한다. 성능 비교를 할 때에는 읽기 비차단, 충돌 감지, 중단·재시도 비용을 한 묶음으로 기록하되, 특정 구현의 throughput 수치를 일반 법칙으로 확장하지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[직렬 가능성]] | snapshot isolation의 write skew와 SSI의 위험 의존성 검사를 통해 serial equivalence의 구현 경계를 보여준다. | [[Serializable Isolation for Snapshot Databases]] |
| synthesizes | [[동시성]] | 겹친 트랜잭션이 서로 다른 데이터를 갱신할 때 발생하는 불변식 위반을 구체적인 실행 이력으로 설명한다. | [[Serializable Isolation for Snapshot Databases]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Cornell-hosted PDF, [Serializable Isolation for Snapshot Databases](https://www.cs.cornell.edu/~sowell/dbpapers/serializable_isolation.pdf)

## 관련 항목

- [[직렬 가능성]] — SI·write skew·SSI의 개념적 경계를 정리한다.
- [[동시성]] — 공유 상태를 동시에 읽고 갱신하는 더 넓은 문제를 다룬다.
- [[선형화 가능성]] — 객체 연산의 real-time order와 트랜잭션 이력의 serial equivalence를 비교한다.
