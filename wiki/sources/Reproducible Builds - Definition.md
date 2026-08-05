---
schema_version: 2
id: ref-123
kind: reference
title: Reproducible Builds - Definition
aliases:
  - Reproducible Builds definition
  - 재현 가능한 빌드 정의
summary: 같은 소스 코드·빌드 환경·빌드 지침으로 지정 산출물을 bit-by-bit 동일하게 다시 만들 수 있다는 Reproducible Builds 프로젝트의 정의와 경계를 정리한 공식 문서.
domains:
  - software-engineering
  - systems
  - security
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:5ae3902c25e489f56eb52bca3694479510f938f0f55f66dae915d4fb33efea03
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: Reproducible Builds project, Definitions
      genre: web
      identifiers: []
      edition: current definition page, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://reproducible-builds.org/docs/definition/
    retrieved: 2026-08-05
    version: current page at access time
---

## 개요

Reproducible Builds 프로젝트는 같은 소스 코드, 빌드 환경, 빌드 지침이 주어졌을 때 누구나 지정된 산출물의 bit-by-bit 동일한 복사본을 다시 만들 수 있으면 빌드가 재현 가능하다고 정의한다. 환경에는 의존성 버전·빌드 플래그·환경 변수·locale처럼 실제 빌드에 사용된 요소가 포함될 수 있다.

이 정의는 “매번 아무 조건에서나 같은 결과”를 뜻하지 않는다. 무엇을 소스·환경·지침·지정 산출물로 간주하는지는 작성자나 배포자가 명시해야 한다. 로그 같은 부수 산출물은 일반적으로 주 산출물 비교 범위에 포함하지 않는다.

## 위키 반영

이 문서는 [[재현 가능한 빌드]]의 동일성 계약을 정의하는 근거다. [[재현 가능한 빌드는 무엇을 같게 만드는가]]에서는 이 정의를 사용해 소스, 도구 체인, 환경, 변동 입력, 산출물 비교를 분리한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[재현 가능한 빌드]] | 소스·환경·지침과 bit-by-bit 산출물 동일성의 기준을 제공한다. | [[Reproducible Builds - Definition]] |
| constrains | [[재현 가능한 빌드는 무엇을 같게 만드는가]] | 비교 시 무엇을 고정하고 무엇을 산출물로 볼지 결정하게 한다. | [[Reproducible Builds - Definition]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Reproducible Builds project, [Definitions](https://reproducible-builds.org/docs/definition/)

## 관련 항목

- [[재현 가능한 빌드]] — 정의를 시스템 개념으로 확장한다.
- [[재현 가능한 빌드는 무엇을 같게 만드는가]] — 동일성의 비교 경계를 분석한다.
- [[컴파일러]] — 빌드 환경을 구성하는 도구 체인을 다룬다.
