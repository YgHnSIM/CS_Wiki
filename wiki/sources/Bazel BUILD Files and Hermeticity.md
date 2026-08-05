---
schema_version: 2
id: ref-126
kind: reference
title: Bazel BUILD Files and Hermeticity
aliases:
  - Bazel BUILD files
  - Bazel hermeticity
  - Bazel hermetic build
summary: Bazel BUILD 파일의 알려진 입력 의존성과 임의 I/O 제한이 해석을 hermetic하게 만들어 재현 가능한 빌드에 기여한다는 공식 문서.
domains:
  - software-engineering
  - systems
  - programming-languages
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:d96c3016ee696c6f6fedecff5a41c9cc8fd3762b63d40e085e9760a742815ad0
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: Bazel documentation, BUILD files
      genre: web
      identifiers: []
      edition: nightly documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://bazel.build/concepts/build-files
    retrieved: 2026-08-05
    version: nightly documentation at access time
---

## 개요

Bazel의 BUILD 파일 문서는 BUILD 파일 해석이 알려진 입력에만 의존하도록 하고 임의의 I/O를 허용하지 않는 성질을 hermeticity의 근거로 설명한다. 입력 집합이 명시되면 빌드 그래프의 해석과 실행이 외부 작업 디렉터리나 임의 환경 변수에 덜 의존하게 된다.

이 자료는 “Bazel 빌드는 항상 재현 가능하다”는 보증이 아니다. 실제 규칙, toolchain, 외부 저장소, 실행 환경과 산출물 비교 절차까지 포함해 별도로 검증해야 한다. 여기서 인용하는 것은 hermetic한 입력 경계를 설계하는 구현 사례다.

## 위키 반영

이 문서는 [[재현 가능한 빌드]]의 개념을 빌드 시스템의 입력 경계와 연결하는 구현 근거다. 같은 개념을 다른 빌드 도구 전체에 일반화하지 않고, Bazel의 BUILD 파일 해석 계약으로 한정한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[재현 가능한 빌드]] | 알려진 입력과 제한된 I/O로 빌드 환경을 좁히는 구현 사례를 제공한다. | [[Bazel BUILD Files and Hermeticity]] |
| constrains | [[재현 가능한 빌드는 무엇을 같게 만드는가]] | hermetic 입력 경계와 bit-by-bit 결과 비교를 별도 검증 단계로 나눈다. | [[Bazel BUILD Files and Hermeticity]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Bazel, [BUILD files](https://bazel.build/concepts/build-files)

## 관련 항목

- [[재현 가능한 빌드]] — 입력 경계와 결과 동일성의 관계를 설명한다.
- [[재현 가능한 빌드는 무엇을 같게 만드는가]] — hermeticity와 reproducibility를 비교한다.
- [[컴파일러]] — toolchain이 환경의 일부가 되는 조건을 다룬다.
