---
schema_version: 2
id: ref-127
kind: reference
title: npm Package Provenance Statements
aliases:
  - npm provenance
  - npm 패키지 provenance
summary: npm 패키지가 어디서 빌드되고 누가 게시했는지를 source·build instruction과 연결해 공개하는 npm 공식 문서.
domains:
  - software-engineering
  - security
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:f373e97a628193f6ea3ae2da2217433113b69b5b992013184706b824829179c5
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: npm Documentation, Generating provenance statements
      genre: web
      identifiers: []
      edition: current documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://docs.npmjs.com/generating-provenance-statements/
    retrieved: 2026-08-05
    version: current page at access time
---

## 개요

npm provenance는 게시된 패키지와 source code·build instructions를 연결하는 공개 attestation을 제공한다. npm 문서도 provenance가 악성 코드가 없다는 보장은 아니며, 소비자가 연결된 소스와 빌드 과정을 감사해 신뢰 여부를 판단해야 한다고 명시한다.

## 위키 반영

이 자료는 [[dependency provenance와 registry identity]]에서 registry의 게시자·빌드 경로와 패키지 내용의 동일성을 분리하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[dependency provenance와 registry identity]] | 패키지 registry가 source·build instructions·publisher를 연결하는 실제 사례다. | [[npm Package Provenance Statements]] |
| constrains | [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] | provenance가 악성 코드 부재 보장이 아님을 소비자 검증 경계로 둔다. | [[npm Package Provenance Statements]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- npm, [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements/)

## 관련 항목

- [[dependency provenance와 registry identity]] — registry 신원·digest·attestation을 분석한다.
- [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] — 소비자 검증 정책을 비교한다.
