---
schema_version: 2
id: ref-111
kind: reference
title: A Critique of ANSI SQL Isolation Levels
aliases:
  - Berenson isolation levels
  - ANSI SQL isolation levels critique
  - ANSI SQL 격리 수준 비판
summary: ANSI SQL 격리 수준의 현상 중심 정의가 실제 동시성 이상과 어떻게 어긋나는지 분석하고, serializability·snapshot isolation·write skew를 구분한 논문.
domains:
  - database
  - systems
  - distributed-systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:4b8b8998686b15b799a2527136a398c692539354ba56977caa306c1a132885ec
  reviewed_at: 2026-08-05
  reviewed_by: codex
evidence_ids: []
capability_layers:
  - reliable-results
history:
  publication_year: 1995
  layer: theory
origin: external
works:
  primary:
    - citation: Hal Berenson, Philip Bernstein, Jim Gray, Jim Melton, Elizabeth O'Neil, and Patrick O'Neil, A Critique of ANSI SQL Isolation Levels, SIGMOD Record 24(2), 1995
      genre: primary-literature
      identifiers: []
      edition: SIGMOD Record 24(2), June 1995
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/
    retrieved: 2026-08-05
    version: null
---

## 개요

[[A Critique of ANSI SQL Isolation Levels]]는 SQL 표준의 격리 수준을 읽기·쓰기 현상의 목록만으로 설명할 때 생기는 빈틈을 분석한다. 같은 이름의 격리 수준이 구현마다 다른 보장을 제공할 수 있고, 표준이 금지하지 않은 이상이 업무 불변식을 깨뜨릴 수 있다는 점을 드러낸다.

이 자료의 역할은 모든 데이터베이스 구현을 하나의 동작으로 환원하는 것이 아니다. 격리 수준 이름, 허용되는 실행 이력, 애플리케이션 불변식, 구현의 동시성 제어 알고리즘을 서로 다른 층으로 분리하도록 돕는 것이다.

## 위키 반영

이 논문은 [[직렬 가능성]]에서 serial execution과 동등하다는 정의를 snapshot isolation의 구현 특성과 분리하는 근거로 사용한다. 특히 “특정 현상이 보이지 않는다”는 관찰과 “모든 커밋된 이력이 어떤 직렬 순서와 동등하다”는 주장을 같은 것으로 쓰지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[직렬 가능성]] | 격리 수준의 이름보다 실행 이력과 허용 이상을 직접 비교해야 한다는 분석의 근거를 제공한다. | [[A Critique of ANSI SQL Isolation Levels]] |
| synthesizes | [[동시성]] | 여러 트랜잭션의 상호작용이 공유 상태의 결과 계약을 바꾸는 방식을 구체화한다. | [[A Critique of ANSI SQL Isolation Levels]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Microsoft Research, [A Critique of ANSI SQL Isolation Levels](https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/)

## 관련 항목

- [[직렬 가능성]] — 트랜잭션 이력과 snapshot isolation의 경계를 정리한다.
- [[동시성]] — 겹쳐 실행되는 작업의 공유 상태 문제를 더 넓은 층에서 다룬다.
- [[순차 일관성]] — 메모리·객체·트랜잭션의 순서 보장을 같은 용어로 합치지 않게 한다.
