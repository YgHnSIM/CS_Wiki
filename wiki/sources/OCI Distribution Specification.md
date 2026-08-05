---
schema_version: 2
id: ref-129
kind: reference
title: OCI Distribution Specification
aliases:
  - OCI Distribution Spec
  - OCI registry distribution
  - OCI 배포 명세
summary: registry가 content-addressable blob을 digest로 저장·조회하고 배포 API를 표준화하는 Open Container Initiative 공식 명세.
domains:
  - software-engineering
  - systems
  - security
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:823b565d96c8dd87ce49be2ee3a2bb0390081604e390bca0c15377a0eacb35c5
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: Open Container Initiative, Distribution Specification
      genre: standard
      identifiers: []
      edition: current main specification, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://github.com/opencontainers/distribution-spec/blob/main/spec.md
    retrieved: 2026-08-05
    version: main specification at access time
---

## 개요

OCI Distribution Specification은 registry와 client 사이의 content distribution API를 표준화한다. blob은 digest로 주소를 지정할 수 있고, 업로드·조회 응답에서 digest를 사용해 위치 이름과 내용 identity를 분리한다.

## 위키 반영

이 자료는 [[dependency provenance와 registry identity]]에서 registry의 위치·tag·manifest와 content digest를 다른 계약 층으로 나누는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[dependency provenance와 registry identity]] | registry 위치와 content-addressable digest의 의미를 분리한다. | [[OCI Distribution Specification]] |
| constrains | [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] | tag만으로 dependency identity를 고정하지 않고 digest를 검증 대상으로 둔다. | [[OCI Distribution Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Open Container Initiative, [Distribution Specification](https://github.com/opencontainers/distribution-spec/blob/main/spec.md)

## 관련 항목

- [[dependency provenance와 registry identity]] — registry와 digest의 층위를 설명한다.
- [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] — 소비자 관점의 identity 판정을 분석한다.
