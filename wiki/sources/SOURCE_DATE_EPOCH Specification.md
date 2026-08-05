---
schema_version: 2
id: ref-124
kind: reference
title: SOURCE_DATE_EPOCH Specification
aliases:
  - SOURCE_DATE_EPOCH
  - SOURCE_DATE_EPOCH 명세
summary: 빌드 시스템 사이에서 결정적인 timestamp를 교환하기 위한 배포판 독립적 환경 변수 표준과 timestamp clamping 규칙을 정의한 공식 명세.
domains:
  - software-engineering
  - systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:a92a8a5862bbc70db8ff81d4b2dccc38841a0c4b6e4f1e0dcc5c17e8a4333bc1
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: Ximin Luo, SOURCE_DATE_EPOCH specification
      genre: standard
      identifiers: []
      edition: Revision 1.1, 2017-11-27
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://reproducible-builds.org/specs/source-date-epoch/
    retrieved: 2026-08-05
    version: Revision 1.1 at access time
---

## 개요

SOURCE_DATE_EPOCH는 빌드 시스템이 현재 시각 대신 결정적인 timestamp를 전달하도록 하는 배포판 독립적 표준이다. 이 명세는 빌드 도구 사이의 교환 형식과, 기준 시각보다 이후인 변동 timestamp를 기준 시각으로 제한하는 clamping 규칙을 정의한다.

timestamp는 빌드가 실행된 시각과 소스가 의미 있게 변경된 시각을 혼동하게 만들 수 있다. 따라서 이 명세는 시간이라는 외부 상태를 빌드 계약 안의 명시적 입력으로 바꾸는 한 가지 좁은 해결책을 제공한다. 모든 비결정성의 해결책이나 provenance 형식 자체는 아니다.

## 위키 반영

이 문서는 [[재현 가능한 빌드]]에서 시간 변동을 별도 계약 항목으로 다루는 근거다. 적용 여부는 각 도구가 이 환경 변수를 실제로 소비하는지와 timestamp의 의미가 산출물에 적합한지를 확인한 뒤 결정해야 한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[재현 가능한 빌드]] | 현재 시각에 의존하는 산출물 변동을 통제하는 표준 입력을 제공한다. | [[SOURCE_DATE_EPOCH Specification]] |
| constrains | [[재현 가능한 빌드는 무엇을 같게 만드는가]] | 시간·timestamp를 환경 변동과 산출물 동일성 사이에 배치한다. | [[SOURCE_DATE_EPOCH Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Ximin Luo, [SOURCE_DATE_EPOCH specification](https://reproducible-builds.org/specs/source-date-epoch/)

## 관련 항목

- [[재현 가능한 빌드]] — 결정적인 산출물 계약에서 timestamp를 다룬다.
- [[재현 가능한 빌드는 무엇을 같게 만드는가]] — 시간 변동을 비교 경계로 분석한다.
