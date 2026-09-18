---
schema_version: 2
id: ref-141
kind: reference
title: The Design Philosophy of the DARPA Internet Protocols
aliases:
  - Clark 1988
  - Internet design philosophy
  - DARPA Internet Protocols
summary: 인터넷 프로토콜 스위트가 목표한 연결성·생존성·다양성과, 그 목표가 종단 간 인수 논증과 어떻게 맞물리는지를 서술한 Clark의 1988년 설계 철학 논문이다.
domains:
  - computer-science
  - systems
  - distributed-systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-09-18
updated: 2026-09-18
review:
  mode: attested
  revision: sha256:6bd8edf73563a983a05837ea282e8ab392a40eabdd1073def0f0761163c9cfb2
  reviewed_at: 2026-09-18
  reviewed_by: grok
evidence_ids: []
capability_layers:
  - scalability
  - reliable-results
history:
  publication_year: 1988
  layer: system
redirect_from:
  - /references/the-design-philosophy-of-the-darpa-internet-protocols/
  - /sources/the-design-philosophy-of-the-darpa-internet-protocols/
origin: external
works:
  primary:
    - citation: David D. Clark, The Design Philosophy of the DARPA Internet Protocols, SIGCOMM 1988
      genre: other
      identifiers: []
      edition: ACM SIGCOMM Computer Communication Review / SIGCOMM 1988
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://dl.acm.org/doi/10.1145/52324.52336
    retrieved: 2026-09-18
    version: ACM SIGCOMM Computer Communication Review / SIGCOMM 1988
---

## 개요

Clark의 논문은 인터넷 프로토콜이 무엇을 최우선으로 최적화했는지를 목표 목록으로 밝힌다. 생존성과 이질적 네트워크 연결이 상위에 있고, 그 결과로 많은 기능을 종단에 두려는 설계 태도가 정당화된다. Saltzer 등의 종단 간 인수 논증을 인터넷 설계사 맥락에서 읽는 데 필수적인 동반 문헌이다.

## 왜 남았나

중간단 기능 추가 논쟁(방화벽, NAT, 인경로 가속)이 반복될 때마다, 이 문서는 왜 원래 종단에 두려 했는지를 점검하는 기준점이 된다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[종단 간 원칙]] | 인터넷 설계 목표와 종단 배치 논증을 연결한다. | [[The Design Philosophy of the DARPA Internet Protocols]] |
| enables | [[End-to-End Arguments in System Design]] | Saltzer·Reed·Clark의 인수 논증을 설계사로 확장한다. | [[The Design Philosophy of the DARPA Internet Protocols]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-141`
<!-- wiki-v2:evidence-end -->

## 관련 항목

- [[종단 간 원칙]] — 핵심 개념.
- [[End-to-End Arguments in System Design]] — 원전 인수 논증.
