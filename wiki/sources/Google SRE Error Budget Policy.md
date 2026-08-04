---
schema_version: 2
id: ref-118
kind: reference
title: Google SRE Error Budget Policy
aliases:
  - SRE error budget policy
  - 오류 예산 정책
  - error budget
summary: SLO에서 허용된 실패량을 error budget으로 계산하고, 예산 소진 상태를 배포·변경·안정화 의사결정과 연결하는 Google SRE 공식 정책.
domains:
  - reliability
  - operations
  - service-management
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:6d5348aa13078d755c490ef6d5c6a16d637de0f54c0129a8afcf24a19e5182a5
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
    - citation: Google SRE Workbook, Error Budget Policy
      genre: manual
      identifiers: []
      edition: accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: publisher
    url: https://sre.google/workbook/error-budget-policy/
    retrieved: 2026-08-05
    version: null
---

## 개요

[[Google SRE Error Budget Policy]]는 서비스의 SLO가 허용하는 실패·기한 초과의 잔여량을 error budget으로 표현하고, 그 잔여량을 변경 속도와 안정화 작업의 의사결정에 사용한다. 이는 런타임에서 재시도 횟수를 제한하는 retry budget과 단위와 책임이 다르다.

Error budget은 가용성 그 자체가 아니다. 어떤 요청을 성공으로 세는지, SLO 기간과 분모를 어떻게 정하는지, 예산이 소진됐을 때 어떤 변경을 멈추거나 우선하는지를 포함하는 운영 정책이다.

## 위키 반영

이 자료는 [[재시도]]의 관련 항목에서 retry budget과 error budget을 혼동하지 않도록 하는 운영 기준으로 사용한다. 재시도가 만드는 추가 시도와 SLO 위반은 서로 연결되지만 동일한 카운터가 아니다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[재시도]] | 재시도 증폭이 SLO 결과와 운영 예산에 미치는 영향을 별도 정책으로 관찰하게 한다. | [[Google SRE Error Budget Policy]] |
| synthesizes | [[가용성과 복구]] | 정상 응답률을 배포·복구·변경 의사결정의 시간 범위와 연결한다. | [[Google SRE Error Budget Policy]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Google SRE Workbook, [Error Budget Policy for Service Reliability](https://sre.google/workbook/error-budget-policy/)

## 관련 항목

- [[재시도]] — 시도량을 제한하는 retry budget과 SLO 정책을 비교한다.
- [[가용성과 복구]] — 사용자-facing availability와 복구 시간을 다룬다.
- [[대기열과 부하 제어]] — 승인·거부·큐 상한의 시스템 효과를 설명한다.
