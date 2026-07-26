---
schema_version: 2
id: ref-025
kind: reference
title: Unicode Text Segmentation
aliases:
  - "UAX #29"
  - "Unicode Standard Annex #29"
  - Unicode text boundaries
summary: "UAX #29를 바탕으로 그래핌 클러스터, 단어·문장 경계, 사용자 지각 문자 단위를 정리한 참고 자료."
domains:
  - computer-science
  - text-processing
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-10
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:be2835425d4e729268a3368ea53143b730d8535e27df0bde29f218f76be4d3bc
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers: []
history:
  publication_year: 2025
  note: "Unicode 17.0.0에 맞춘 UAX #29 Revision 47의 발행 연도다."
redirect_from:
  - /references/unicode-text-segmentation/
  - /sources/unicode-text-segmentation/
origin: external
works:
  primary:
    - citation: "Unicode Standard Annex #29, Unicode 17.0.0, Revision 47"
      genre: standard
      identifiers: []
      edition: Unicode 17.0.0 / Revision 47
  supporting:
    - citation: "Unicode Standard Annex #29 latest-version pointer"
      genre: standard
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://www.unicode.org/reports/tr29/tr29-47.html
    retrieved: 2026-07-10
    version: Unicode 17.0.0 / Revision 47
  - kind: url
    role: mirror
    url: https://www.unicode.org/reports/tr29/
    retrieved: 2026-07-10
    version: Unicode 17.0.0 / Revision 47
---

## 개요

[[Unicode Text Segmentation]]은 Unicode Standard Annex #29로, 텍스트를 사용자 지각 문자·단어·문장과 같은 의미 있는 단위로 나누는 기본 경계를 설명한다. 이 문헌은 [[그래핌 클러스터]]를 "사용자가 문자 하나로 인식하는 단위"를 프로그램으로 다루기 위한 근사로 설명한다.

핵심은 코드 포인트 하나가 항상 사용자가 생각하는 문자 하나와 일치하지 않는다는 점이다. 예를 들어 기본 문자와 결합 부호가 합쳐진 글자, 한글 자모 시퀀스, 일부 인도계 문자, 이모지 ZWJ sequence는 여러 코드 포인트가 하나의 사용자 인식 단위처럼 동작할 수 있다.

## 주요 인사이트

- 텍스트 경계는 사용자 지각 문자, 단어, 문장 단위로 다르게 정의된다.
- extended grapheme cluster는 기본 그래핌 클러스터 모델이며, 편집기 이동, 삭제, 선택, 문자 수 계산에 중요하다.
- 기본 알고리즘은 언어별 맞춤 처리가 필요할 수 있다.
- 단어 경계와 문장 경계는 그래핌 클러스터 내부에서 생기지 않아야 한다.

## 위키 반영

이 자료는 [[그래핌 클러스터]], [[유니코드]], [[유니코드 정규화]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 "문자열 길이"를 어떤 단위로 세는지 명확히 해야 한다는 소프트웨어 설계 문제와 연결된다.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Unicode Consortium, [UAX #29 Revision 47 — Unicode 17.0.0](https://www.unicode.org/reports/tr29/tr29-47.html)
- Unicode Consortium, [UAX #29 최신 판본 포인터](https://www.unicode.org/reports/tr29/)

## 관련 항목

- [[그래핌 클러스터]]
- [[유니코드]]
- [[코드 포인트]]
- [[코드 유닛]]
- [[유니코드 정규화]]
- [[인코딩 심화]]
