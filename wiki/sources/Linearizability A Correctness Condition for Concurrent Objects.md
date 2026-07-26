---
schema_version: 2
id: ref-095
kind: reference
title: "Linearizability: A Correctness Condition for Concurrent Objects"
aliases:
  - Herlihy Wing 1990
  - "Linearizability: A Correctness Condition for Concurrent Objects"
  - Linearizability A Correctness Condition for Concurrent Objects
  - linearizability paper
  - 동시 객체의 선형화 가능성
summary: 동시 객체의 각 연산이 호출과 응답 사이 한 순간에 일어난 것처럼 보이고 겹치지 않는 연산의 실제 시간 순서를 보존해야 한다는 선형화 가능성을 정의한 Herlihy와 Wing의 1990년 논문.
domains:
  - computer-science
  - software-engineering
  - distributed-systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:b2f72ca029a5be1aa1a249692476f37913e24557621f4899dd9ac2b8b948f707
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - reliable-results
history:
  publication_year: 1990
  layer: theory
redirect_from:
  - /references/linearizability-a-correctness-condition-for-concurrent-objects/
  - /sources/linearizability-a-correctness-condition-for-concurrent-objects/
origin: external
works:
  primary:
    - citation: "Maurice P. Herlihy and Jeannette M. Wing, Linearizability: A Correctness Condition for Concurrent Objects, ACM Transactions on Programming Languages and Systems 12(3), 1990, pp. 463–492"
      genre: other
      identifiers: []
      edition: ACM Transactions on Programming Languages and Systems 12(3), July 1990, pp. 463–492
  supporting:
    - citation: ACM Digital Library publication record
      genre: official-record
      identifiers: []
      edition: null
    - citation: Carnegie Mellon University author-hosted paper PDF
      genre: primary-literature
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://dl.acm.org/doi/10.1145/78969.78972
    retrieved: 2026-07-25
    version: ACM Transactions on Programming Languages and Systems 12(3), July 1990, pp. 463–492
  - kind: url
    role: mirror
    url: https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf
    retrieved: 2026-07-25
    version: ACM Transactions on Programming Languages and Systems 12(3), July 1990, pp. 463–492
---

## 개요

[[Linearizability: A Correctness Condition for Concurrent Objects]]는 Maurice P. Herlihy와 Jeannette M. Wing이 1990년에 발표한 논문으로, 동시에 접근되는 추상 자료형 객체의 올바름 조건인 선형화 가능성(linearizability)을 정의한다. 선형화 가능한 객체에서는 각 연산이 호출과 응답 사이의 어느 한 시점에 효과를 낸 것처럼 보이며, 실제로 겹치지 않은 연산의 시간 순서는 결과의 순서에도 보존된다.

이 조건은 구현이 내부적으로 완전히 직렬 실행되어야 한다고 요구하지 않는다. 여러 연산은 실제로 겹쳐 진행할 수 있지만, 관찰 가능한 연산 이력은 객체의 순차 명세와 모순되지 않는 하나의 순서로 설명되어야 한다. 그래서 기존의 순차 자료형 명세와 전제·사후 조건을 동시 객체의 추론에도 활용할 수 있다.

선형화 가능성은 객체 연산의 안전성 조건이다. 요청이 언제 반드시 끝나는지, 장애 중 어떤 응답을 허용하는지, 서비스의 지연이 얼마인지는 별도의 진행성·실패·성능 계약으로 기록해야 한다.

## 주요 인사이트

- 선형화 가능성의 단위는 개별 메모리 읽기·쓰기가 아니라 스택, 큐, 레지스터 같은 객체의 연산 이력이다.
- 각 연산의 효과 시점은 호출과 응답 사이에 있어야 하며, 겹치지 않은 연산의 실제 시간 순서를 뒤집을 수 없다.
- 높은 내부 동시성과 외부에서 순차적으로 보이는 객체 명세는 함께 가능하다.
- 선형화 가능성은 안전성 조건이므로 요청 완료, 처리량, 공정성, 장애 복구를 자동으로 보장하지 않는다.
- 순차 일관성과는 달리, 서로 다른 실행 주체의 겹치지 않은 연산에도 실제 시간 순서를 요구한다.

## 인용할 만한 구절

> “takes effect instantaneously at some point”
<!-- wiki-v2:quote-locator evidence="ref-095" locator="wiki/sources/Linearizability A Correctness Condition for Concurrent Objects.md:line-19#인용할-만한-구절" status="recorded" -->

이 표현은 실제 실행 단계가 한 번에 끝난다는 뜻이 아니라, 외부 이력을 설명할 수 있는 논리적 효과 시점을 뜻한다.

## 위키 반영

이 자료는 [[선형화 가능성]]에서 객체 인터페이스의 원자성·실제 시간 순서·순차 명세의 관계를 정의하는 직접 근거다. [[CAP 정리]]와 [[복제 로그와 합의]]를 읽을 때에도, 객체 수준의 선형화 가능성과 분산 시스템의 실패·진행·트랜잭션 계약을 같은 단어로 뭉뚱그리지 않게 한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[선형화 가능성]] | 동시 객체의 연산 이력을 순차 명세와 실제 시간 순서에 맞춰 설명하는 정확성 조건을 정의한다. | [[Linearizability: A Correctness Condition for Concurrent Objects]] |
| constrains | [[동시성]] | 겹치지 않은 객체 연산의 실제 시간 선후관계를 보존해야 하므로, 동시 실행의 관찰 가능한 결과에 안전성 조건을 부과한다. | [[Linearizability: A Correctness Condition for Concurrent Objects]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- ACM Digital Library, [Linearizability: A Correctness Condition for Concurrent Objects](https://dl.acm.org/doi/10.1145/78969.78972)
- Carnegie Mellon University, [author-hosted paper PDF](https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf)

## 관련 항목

- [[선형화 가능성]] — 객체 연산의 원자성·실제 시간 순서·순차 명세의 조건을 정리한다.
- [[순차 일관성]] — 메모리 연산의 전역 순서와 객체 연산의 외부 시간 순서를 구분한다.
- [[CAP 정리]] — 분할 모형에서 선형화 가능한 상태와 응답 보장의 경계를 다룬다.
- [[복제 로그와 합의]] — 복제 상태 기계의 명령 순서와 더 넓은 객체·서비스 계약을 구분한다.
