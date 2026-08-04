---
schema_version: 2
id: ref-115
kind: reference
title: Stripe Idempotent Requests
aliases:
  - Stripe idempotency keys
  - Stripe API idempotency
  - Stripe 멱등 요청
summary: Stripe API가 멱등성 키로 최초 요청 결과를 재사용하고 매개변수 불일치와 키 보존 경계를 처리하는 공식 문서.
domains:
  - apis
  - distributed-systems
  - reliability
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:fac64458a13f8fcd52cc82aef4709d54eec17aff4852b445372aba8bcbc27e1f
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - service-contracts
  - reliable-results
history:
  layer: service
origin: external
works:
  primary:
    - citation: Stripe, Idempotent requests API documentation
      genre: manual
      identifiers: []
      edition: retrieved 2026-08-05
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://docs.stripe.com/api/idempotent_requests
    retrieved: 2026-08-05
    version: null
---

## 개요

[[Stripe Idempotent Requests]]는 클라이언트가 요청에 멱등성 키를 붙여 네트워크 재시도와 중복 요청을 하나의 논리적 작업으로 묶는 API 구현 사례다. 같은 키를 다시 사용할 때 매개변수도 일치해야 하며, 키 보존 기간이 지나면 같은 문자열이 새 요청으로 취급될 수 있다.

이 문서의 중요한 경계는 키가 전역적인 exactly-once 보장을 만들지 않는다는 점이다. 키의 namespace, 매개변수 비교, 저장된 결과의 보존, endpoint가 실제 실행을 시작했는지, 외부 부작용이 같은 트랜잭션에 포함되는지는 별도 계약이다.

## 위키 반영

이 자료는 [[멱등성]]에서 idempotency key를 단순한 UUID가 아니라 작업 범위·매개변수·보존 기간을 가진 상태 계약으로 설명하는 구현 사례로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[멱등성]] | 동일 키·동일 매개변수의 재시도와 매개변수 불일치 검사를 API 수준에서 구현한 사례다. | [[Stripe Idempotent Requests]] |
| constrains | [[부분 실패]] | 응답을 잃은 호출이 이미 효과를 냈을 가능성을 키 보존·결과 재사용 계약으로 다루게 한다. | [[Stripe Idempotent Requests]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Stripe API documentation, [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)

## 관련 항목

- [[멱등성]] — API 키를 논리적 효과 계약의 한 요소로 일반화한다.
- [[부분 실패]] — 응답 부재가 실행 여부를 결정하지 못하는 상황을 설명한다.
- [[원격 프로시저 호출]] — 호출 경계와 외부 부작용을 비교한다.
