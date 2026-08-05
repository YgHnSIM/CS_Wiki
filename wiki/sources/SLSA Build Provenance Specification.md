---
schema_version: 2
id: ref-125
kind: reference
title: SLSA Build Provenance Specification
aliases:
  - SLSA Build Provenance
  - SLSA provenance
  - 빌드 provenance
summary: buildDefinition, runDetails, builder, externalParameters, internalParameters와 resolvedDependencies를 사용해 산출물이 어디서·언제·어떻게 만들어졌는지 기록하는 SLSA v1.2 공식 명세.
domains:
  - software-engineering
  - security
  - systems
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:d3d84eb3bc2375b5f4a71f40e7bd34aec760227910ebba67a1f1ad8961bdf680
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: "SLSA, Build: Provenance"
      genre: standard
      identifiers: []
      edition: v1.2, approved, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://slsa.dev/spec/v1.2/build-provenance
    retrieved: 2026-08-05
    version: v1.2 at access time
---

## 개요

SLSA v1.2의 Build Provenance는 소프트웨어 산출물이 어디서, 언제, 어떻게 만들어졌는지를 설명하는 검증 가능한 정보다. `buildDefinition`은 build type과 외부 입력, 내부 입력, resolved dependencies를 표현하고 `runDetails`는 builder와 실행 메타데이터를 표현한다.

이 명세는 provenance가 다른 사람이 산출물을 다시 빌드할 수 있도록 돕는다고 설명하지만, provenance attestation이 곧 bit-by-bit 재현성의 증명이라는 뜻은 아니다. 산출물 동일성은 별도의 재빌드와 비교 절차가 필요하다.

## 위키 반영

이 문서는 [[재현 가능한 빌드]]와 다음 조사 축인 dependency provenance/registry를 구분하는 기준이다. 특히 `externalParameters`는 downstream에서 검증해야 하고, `resolvedDependencies`는 빌드에 사용된 의존성의 URI와 digest를 기록하는 자리라는 점을 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[재현 가능한 빌드]] | 생성 경로 attestation과 산출물 bit-by-bit 동일성 검사를 분리한다. | [[SLSA Build Provenance Specification]] |
| constrains | [[재현 가능한 빌드는 무엇을 같게 만드는가]] | buildDefinition과 runDetails를 동일성 비교가 아닌 provenance 층으로 배치한다. | [[SLSA Build Provenance Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- SLSA, [Build: Provenance v1.2](https://slsa.dev/spec/v1.2/build-provenance)

## 관련 항목

- [[재현 가능한 빌드]] — 산출물 동일성 계약과 provenance의 경계를 설명한다.
- [[재현 가능한 빌드는 무엇을 같게 만드는가]] — attestation과 rebuild comparison을 비교한다.
- dependency provenance/registry — 다음 작성 순서에서 resolved dependencies를 확장할 후보다.
