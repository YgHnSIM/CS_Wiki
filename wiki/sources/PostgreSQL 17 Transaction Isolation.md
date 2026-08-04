---
schema_version: 2
id: ref-113
kind: reference
title: PostgreSQL 17 Transaction Isolation
aliases:
  - PostgreSQL transaction isolation documentation
  - PostgreSQL 격리 수준
  - PostgreSQL Serializable Snapshot Isolation
summary: PostgreSQL 17의 Read Committed·Repeatable Read·Serializable 동작과 snapshot isolation, serialization failure, predicate locking을 설명하는 공식 매뉴얼.
domains:
  - database
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:0d94d9e1a14cdb877d03ad3f46cb9f787aaeec46a5a3aaff6b2ddc3ab63005e5
  reviewed_at: 2026-08-05
  reviewed_by: codex
evidence_ids: []
capability_layers:
  - reliable-results
history:
  layer: software
origin: external
works:
  primary:
    - citation: PostgreSQL Global Development Group, PostgreSQL 17 Documentation, Chapter 13.2 Transaction Isolation
      genre: manual
      identifiers: []
      edition: PostgreSQL 17 documentation
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://www.postgresql.org/docs/17/transaction-iso.html
    retrieved: 2026-08-05
    version: PostgreSQL 17
---

## 개요

[[PostgreSQL 17 Transaction Isolation]]은 SQL 격리 수준 이름을 PostgreSQL의 MVCC 구현과 연결해 설명한다. PostgreSQL의 Repeatable Read는 안정된 트랜잭션 스냅샷을 제공하지만 serial execution과 항상 동등한 것은 아니며, Serializable은 serialization anomaly를 감시해 직렬 순서를 증명할 수 없는 트랜잭션을 실패시킨다.

공식 매뉴얼은 Serializable 트랜잭션이 `40001` serialization failure로 종료될 수 있고, 애플리케이션이 트랜잭션 전체를 처음부터 재시도해야 한다고 설명한다. 이는 격리 수준이 선언만의 문서 계약이 아니라 충돌·실패·재시도 처리까지 포함하는 실행 계약임을 보여준다.

## 위키 반영

이 자료는 [[직렬 가능성]]과 [[트랜잭션 시스템은 어떤 순서 보장을 제공하는가]]에서 PostgreSQL Repeatable Read·Serializable을 직접 비교하는 구현 근거다. “Repeatable Read = Serializable”이라는 일반화는 사용하지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[직렬 가능성]] | SSI와 predicate-lock 기반 감시로 직렬 순서와 모순되는 커밋을 실패시키는 구현 사례를 제공한다. | [[PostgreSQL 17 Transaction Isolation]] |
| constrains | [[트랜잭션 시스템은 어떤 순서 보장을 제공하는가]] | 격리 수준 비교가 재시도와 serialization failure 처리까지 포함해야 한다는 실무 경계를 부과한다. | [[PostgreSQL 17 Transaction Isolation]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- PostgreSQL 17 Documentation, [13.2 Transaction Isolation](https://www.postgresql.org/docs/17/transaction-iso.html)

## 관련 항목

- [[직렬 가능성]] — 이론적 serial equivalence와 구현 수준의 anomaly detection을 연결한다.
- [[트랜잭션 시스템은 어떤 순서 보장을 제공하는가]] — PostgreSQL과 다른 순서 보장 계층을 비교한다.
- [[동시성]] — 트랜잭션 격리의 더 넓은 실행 조건을 다룬다.
