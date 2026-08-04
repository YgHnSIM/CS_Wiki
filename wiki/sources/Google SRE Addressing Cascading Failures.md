---
schema_version: 2
id: ref-117
kind: reference
title: Google SRE Addressing Cascading Failures
aliases:
  - SRE cascading failures
  - Google SRE retry budget
  - Google SRE 연쇄 장애
summary: 과부하와 긍정적 피드백이 장애를 확산시키는 경로를 설명하고, exponential backoff·jitter·retry budget·load shedding으로 재시도 증폭을 제어하는 Google SRE 공식 장.
domains:
  - systems
  - distributed-systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:9c9a55e31675f853fedb31e055614c6f953168f691fc3ed2b0228710193c75aa
  reviewed_at: 2026-08-05
  reviewed_by: codex
evidence_ids: []
capability_layers:
  - reliable-results
history:
  layer: service
origin: external
works:
  primary:
    - citation: Mike Ulrich, Addressing Cascading Failures, Site Reliability Engineering book, Chapter 22
      genre: manual
      identifiers: []
      edition: Google SRE book, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://sre.google/sre-book/addressing-cascading-failures/
    retrieved: 2026-08-05
    version: null
---

## 개요

[[Google SRE Addressing Cascading Failures]]는 일부 구성 요소의 실패가 남은 구성 요소의 부하를 키우고, 그 부하가 다시 실패 확률을 높이는 긍정적 피드백을 연쇄 장애의 핵심 구조로 설명한다. 단순한 오류율보다 자원 고갈·큐 증가·기한 초과·재시도·health check 실패가 서로 연결되는 경로를 추적한다.

자동 재시도는 이 구조의 증폭기가 될 수 있다. 문서는 randomized exponential backoff, 요청별 재시도 제한, 서버 전체 retry budget, 여러 계층의 retry multiplication 회피를 함께 제안한다. Retry budget은 오류 예산과 달리 실행 시도량을 직접 제한하는 런타임 제어다.

## 위키 반영

이 자료는 [[재시도]]에서 재시도를 성공률의 단순 보정이 아니라 추가 작업량과 부하 피드백으로 기록하는 근거로 사용한다. 또한 [[대기열과 부하 제어]]와 연결해 load shedding·graceful degradation·deadline propagation을 재시도와 별도의 제어 수단으로 둔다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[재시도]] | backoff·jitter·attempt limit·retry budget을 재시도 안전성의 운영 조건으로 제공한다. | [[Google SRE Addressing Cascading Failures]] |
| constrains | [[대기열과 부하 제어]] | 재시도와 큐 증가가 서로를 증폭시킬 수 있으므로 admission·load shedding을 함께 설계하게 한다. | [[Google SRE Addressing Cascading Failures]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Google SRE, [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)

## 관련 항목

- [[재시도]] — retry budget·jitter·amplification을 개념으로 정리한다.
- [[대기열과 부하 제어]] — 큐 상한·거부·load shedding을 함께 다룬다.
- [[부분 실패]] — 일부 경로의 실패가 전체 부하를 바꾸는 조건을 설명한다.
- [[멱등성]] — 재시도 가능한 논리 효과와 중복 부작용의 경계를 둔다.
