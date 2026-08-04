---
schema_version: 2
id: ref-116
kind: reference
title: FoundationDB Transactions with Unknown Results
aliases:
  - FoundationDB unknown commit result
  - FoundationDB automatic idempotency
  - FoundationDB 미확정 커밋
summary: FoundationDB 트랜잭션의 커밋 결과를 클라이언트가 알 수 없는 경우와 재시도가 중복 효과를 만들 수 있는 부작용 경계를 설명하는 공식 개발자 문서.
domains:
  - database
  - distributed-systems
  - systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:c058bcfd0528ae8c1076e28a16632e4388950862a69e20134d2ff35afdeba1a9
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
history:
  layer: system
origin: external
works:
  primary:
    - citation: Apple FoundationDB, Developer Guide, Transactions with Unknown Results
      genre: manual
      identifiers: []
      edition: retrieved 2026-08-05
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://apple.github.io/foundationdb/developer-guide.html#transactions-with-unknown-results
    retrieved: 2026-08-05
    version: null
---

## 개요

[[FoundationDB Transactions with Unknown Results]]는 트랜잭션 요청이 실제로 커밋됐는지 클라이언트가 즉시 알 수 없는 `commit_unknown_result` 경계를 설명한다. 네트워크 단절이 커밋 직후 발생하면 클라이언트는 안전한 재시도와 중복 실행 회피를 함께 판단해야 한다.

FoundationDB의 데이터베이스 트랜잭션 원자성은 일반 클라이언트 메모리 변경이나 외부 API·메일·결제 효과까지 자동으로 확장되지 않는다. 따라서 트랜잭션 자체의 재시도 가능성과 외부 부작용의 멱등성은 별도로 계약해야 한다.

## 위키 반영

이 자료는 [[멱등성]]에서 “커밋 결과를 모른다”와 “효과가 없다”를 구분하고, 데이터베이스 경계 바깥의 부작용을 global exactly-once 주장에 포함하지 않는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[멱등성]] | unknown commit 결과 뒤의 재시도가 데이터베이스·외부 부작용에 서로 다른 중복 위험을 남긴다는 경계를 제공한다. | [[FoundationDB Transactions with Unknown Results]] |
| exemplifies | [[부분 실패]] | 통신 단절 뒤에도 서버의 실제 커밋 상태가 관찰자에게 미확정으로 남는 사례다. | [[FoundationDB Transactions with Unknown Results]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- FoundationDB Developer Guide, [Transactions with Unknown Results](https://apple.github.io/foundationdb/developer-guide.html#transactions-with-unknown-results)

## 관련 항목

- [[멱등성]] — 재시도와 외부 부작용의 논리적 효과 경계를 정리한다.
- [[부분 실패]] — 관찰 가능한 응답과 실제 상태의 차이를 다룬다.
- [[가용성과 복구]] — 실패 뒤 복구 정책과 사용자 결과 계약을 연결한다.
