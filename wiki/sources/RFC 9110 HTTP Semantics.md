---
schema_version: 2
id: ref-114
kind: reference
title: RFC 9110 HTTP Semantics
aliases:
  - RFC 9110
  - HTTP Semantics
  - HTTP 멱등 메서드
summary: HTTP 요청 의미론과 멱등 메서드의 정의를 규정하며, 동일 요청의 반복이 의도된 서버 효과를 바꾸지 않는 계약과 물리적 단일 실행을 구분하는 표준.
domains:
  - networks
  - web
  - distributed-systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:a41b80b277ee7a61092afe83333bfb6945113c59e711572b28a66c430c653515
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - service-contracts
  - reliable-results
history:
  publication_year: 2022
  layer: service
origin: external
works:
  primary:
    - citation: Roy T. Fielding, Mark Nottingham, and Julian Reschke, RFC 9110 HTTP Semantics
      genre: standard
      identifiers:
        - type: RFC
          value: RFC 9110
      edition: June 2022
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    retrieved: 2026-08-05
    version: RFC 9110
---

## 개요

[[RFC 9110 HTTP Semantics]]는 멱등성(idempotency)을 동일한 요청을 한 번 이상 수행했을 때 의도된 서버 효과가 한 번 수행한 것과 같아지는 성질로 설명한다. 이 정의는 서버가 요청을 물리적으로 한 번만 실행했다는 관찰과 다르다.

HTTP의 멱등 메서드 규칙은 네트워크가 응답을 잃었을 때 안전한 재전송의 기준을 제공하지만, 애플리케이션이 `POST` 같은 비멱등 작업을 안전하게 재시도하려면 별도의 키·상태·부작용 경계를 설계해야 한다.

## 위키 반영

이 표준은 [[멱등성]]에서 논리적 효과의 반복 불변성과 물리적 실행 횟수를 구분하는 가장 작은 공통 계약으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[멱등성]] | 반복 요청의 의도된 효과를 기준으로 멱등성을 정의하고, exactly-once 실행과 분리한다. | [[RFC 9110 HTTP Semantics]] |
| constrains | [[원격 프로시저 호출]] | 응답 유실 뒤 재전송할 수 있는 요청의 의미를 메서드·부작용 계약과 함께 판단하게 한다. | [[RFC 9110 HTTP Semantics]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- RFC Editor, [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

## 관련 항목

- [[멱등성]] — key·namespace·TTL과 외부 부작용의 경계를 확장한다.
- [[원격 프로시저 호출]] — 응답 부재와 재전송의 실행 불확실성을 다룬다.
- [[부분 실패]] — 요청이 처리되었는지 관찰만으로 결정할 수 없는 조건을 설명한다.
