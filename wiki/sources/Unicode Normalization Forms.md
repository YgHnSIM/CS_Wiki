---
schema_version: 2
id: ref-024
kind: reference
title: Unicode Normalization Forms
aliases:
  - "UAX #15"
  - "Unicode Standard Annex #15"
  - 유니코드 정규화 형식
summary: "UAX #15를 바탕으로 NFC, NFD, NFKC, NFKD와 문자열 동등성 문제를 정리한 참고 자료."
domains:
  - computer-science
  - text-processing
  - security
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-10
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:b19fa6954d0f0b3b139bbd94b78b12b56954e00ceaabd39f67a7e2f19a1c4ea6
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers: []
history:
  publication_year: 2025
  note: "Unicode 17.0.0에 맞춘 UAX #15 Revision 57의 발행 연도다."
redirect_from:
  - /references/unicode-normalization-forms/
  - /sources/unicode-normalization-forms/
origin: external
works:
  primary:
    - citation: "Unicode Standard Annex #15, Unicode 17.0.0, Revision 57"
      genre: standard
      identifiers: []
      edition: Unicode 17.0.0 / Revision 57
  supporting:
    - citation: "Unicode Standard Annex #15 latest-version pointer"
      genre: standard
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://www.unicode.org/reports/tr15/tr15-57.html
    retrieved: 2026-07-10
    version: Unicode 17.0.0 / Revision 57
  - kind: url
    role: mirror
    url: https://www.unicode.org/reports/tr15/
    retrieved: 2026-07-10
    version: Unicode 17.0.0 / Revision 57
---

## 개요

[[Unicode Normalization Forms]]는 Unicode Standard Annex #15로, Unicode 텍스트의 정규화 형식을 설명한다. 같은 사용자 지각 문자나 의미상 같은 문자열이 여러 코드 포인트 시퀀스로 표현될 수 있으므로 비교·검색·식별자 처리·파일 이름 처리에서는 [[유니코드 정규화]]가 중요하다.

이 문헌은 canonical equivalence와 compatibility equivalence를 바탕으로 NFC, NFD, NFKC, NFKD 네 가지 정규화 형식을 다룬다. 정규화는 텍스트를 단일한 "정답 표현"으로 단순화하는 일이라기보다 특정 목적에 맞는 동등성 기준을 명시적으로 적용하는 절차다.

## 주요 인사이트

- 정규화는 동등한 Unicode 문자열이 동일한 이진 표현을 갖도록 돕는다.
- NFC와 NFD는 canonical equivalence를, NFKC와 NFKD는 compatibility equivalence까지 반영한다.
- ASCII만 포함한 문자열은 모든 정규화 형식에서 영향을 받지 않는다.
- 정규화된 두 문자열을 이어 붙인 결과가 항상 정규화되어 있다고 보장되지는 않는다.
- 보안 검증과 식별자 비교에서는 정규화 시점과 비교 기준을 명확히 해야 한다.

## 위키 반영

이 자료는 [[유니코드 정규화]], [[그래핌 클러스터]], [[유니코드]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 "같아 보이는 문자열"과 "바이트가 같은 문자열"이 다를 수 있다는 점을 설명하는 핵심 근거로 사용된다.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Unicode Consortium, [UAX #15 Revision 57 — Unicode 17.0.0](https://www.unicode.org/reports/tr15/tr15-57.html)
- Unicode Consortium, [UAX #15 최신 판본 포인터](https://www.unicode.org/reports/tr15/)

## 관련 항목

- [[유니코드 정규화]]
- [[유니코드]]
- [[코드 포인트]]
- [[그래핌 클러스터]]
- [[인코딩 오류]]
- [[동형이의 문자]]
- [[인코딩 심화]]
