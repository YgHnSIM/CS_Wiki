---
schema_version: 2
id: ref-140
kind: reference
title: Remote Procedure Call protocols in historical perspective
aliases:
  - RPC survey
  - Nelson RPC
  - Courier RPC
  - RPC history
summary: 분산 시스템에서 원격 프로시저 호출이 지역 호출과 같은 추상화로 자리 잡기까지의 프로토콜·스텁·실패 모델 쟁점을 정리한 역사적 시각의 참고 문헌이다.
domains:
  - distributed-systems
  - systems
  - computer-science
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-09-18
updated: 2026-09-18
review:
  mode: attested
  revision: sha256:bb90c9fba89761928e0a9878459fa4e9f24565e3f46d77aa38c4f09607ffc56a
  reviewed_at: 2026-09-18
  reviewed_by: grok
evidence_ids: []
capability_layers:
  - programmability
  - scalability
history:
  publication_year: 1981
  layer: system
redirect_from:
  - /references/remote-procedure-call-protocols-in-historical-perspective/
  - /sources/remote-procedure-call-protocols-in-historical-perspective/
origin: external
works:
  primary:
    - citation: Bruce Jay Nelson, Remote Procedure Call, PhD thesis, Carnegie Mellon University, 1981; related Xerox Courier RPC materials
      genre: other
      identifiers: []
      edition: CMU-CS-81-127 / Xerox PARC Courier context
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://bitsavers.trailing-edge.com/pdf/xerox/courier/
    retrieved: 2026-09-18
    version: CMU-CS-81-127 / Xerox PARC Courier context
---

## 개요

원격 프로시저 호출은 네트워크 너머의 연산을 지역 프로시저 호출처럼 보이게 만드는 프로그래밍 추상화다. Nelson의 연구와 Xerox Courier 계열 프로토콜은 스텁 생성, 인자 마샬링, 부분 실패와 재시도 의미를 명시적으로 다루며 RPC를 시스템 기본 요소로 정착시켰다.

## 왜 남았나

후대 gRPC·Thrift도 같은 긴장—투명성과 실패 가시성—을 반복한다. Birrell과 Nelson의 구현 보고와 함께 읽으면 RPC가 편의 문법이 아니라 분산 실패 모델을 숨기거나 드러내는 계약임을 분명히 할 수 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[원격 프로시저 호출]] | RPC의 스텁·마샬링·실패 의미론을 초기 형태로 정식화한다. | [[Remote Procedure Call protocols in historical perspective]] |
| enables | [[Implementing Remote Procedure Calls]] | 같은 시대의 구현 경험 보고와 상호 보완된다. | [[Remote Procedure Call protocols in historical perspective]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-140`
<!-- wiki-v2:evidence-end -->

## 관련 항목

- [[원격 프로시저 호출]] — 핵심 개념.
- [[Implementing Remote Procedure Calls]] — 동시대 구현 보고.
- [[분산 파일 시스템]] — RPC를 대규모로 사용한 응용.
