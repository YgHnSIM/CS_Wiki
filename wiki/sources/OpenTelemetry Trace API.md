---
schema_version: 2
id: ref-122
kind: reference
title: OpenTelemetry Trace API
aliases:
  - OpenTelemetry tracing specification
  - OTel Trace API
  - OpenTelemetry 관측성
summary: 분산 trace와 span의 생성·전파·종료 의미를 정의해 관측 데이터의 구조와 실행 상태의 의미를 연결하는 OpenTelemetry 공식 명세.
domains:
  - software-engineering
  - distributed-systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:c421f410b28ce6169b56ce6097cce156280381c3b59bf0e45d91d2c89b09c521
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: OpenTelemetry Specification, Trace API
      genre: standard
      identifiers: []
      edition: current specification, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md
    retrieved: 2026-08-05
    version: main branch at access time
---

## 개요

[[OpenTelemetry Trace API]]는 분산 요청을 trace와 span의 구조로 기록하고, context propagation으로 서로 다른 서비스의 실행 구간을 연결하는 명세다. 관측성은 내부 상태를 직접 보여주는 대신 실행 경로·시간·상태를 외부 신호로 남겨 진단 가능성을 높인다.

Trace가 있다고 해서 failure detector가 정확해지는 것은 아니다. span status·exception·retry attempt와 logical request를 어떤 의미로 기록하는지에 따라 같은 시스템 상태가 다르게 해석될 수 있으므로, telemetry semantics와 장애 판정 정책을 구분해야 한다.

## 위키 반영

이 자료는 [[장애 감지]]에서 heartbeat·health check·semantic request trace를 서로 다른 관찰 채널로 배치하는 근거다. C17에서는 OTel 자체를 장애 판정기로 설명하지 않고, detector 결과와 사용자-visible 실패를 비교하는 계측 계층으로만 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[장애 감지]] | detector 신호와 요청별 trace·span 상태를 별도 관찰 채널로 기록하게 한다. | [[OpenTelemetry Trace API]] |
| synthesizes | [[꼬리 지연 시간]] | trace 구간의 시간 정보를 fan-out·큐·재시도 경로와 함께 분석할 수 있게 한다. | [[OpenTelemetry Trace API]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- OpenTelemetry Specification, [Trace API](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md)

## 관련 항목

- [[장애 감지]] — detector suspicion과 trace 기반 semantic observation을 구분한다.
- [[꼬리 지연 시간]] — 분산 호출의 지연 구간과 tail을 분석한다.
- [[부분 실패]] — 일부 요청·경로만 실패하는 상태를 관찰 데이터로 연결한다.
