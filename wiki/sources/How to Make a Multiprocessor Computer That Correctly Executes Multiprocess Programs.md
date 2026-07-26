---
schema_version: 2
id: ref-094
kind: reference
title: How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs
aliases:
  - Lamport 1979
  - Lamport sequential consistency paper
  - 다중 프로세서 순차 일관성
summary: 각 프로세서의 프로그램 순서와 하나의 전역 순서를 함께 보존하는 순차 일관성을 다중 프로세서의 정확성 조건으로 정의한 Lamport의 1979년 논문.
domains:
  - computer-architecture
  - computer-science
  - operating-systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:3b225c47bacc29c1bef2bf20aa57f20be8ce3e294a53525fac857c280d775047
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - reliable-results
history:
  publication_year: 1979
  layer: architecture
redirect_from:
  - /references/how-to-make-a-multiprocessor-computer-that-correctly-executes-multiprocess-programs/
  - /sources/how-to-make-a-multiprocessor-computer-that-correctly-executes-multiprocess-programs/
origin: external
works:
  primary:
    - citation: Leslie Lamport, How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs, IEEE Transactions on Computers C-28(9), 1979, pp. 690–691
      genre: other
      identifiers: []
      edition: IEEE Transactions on Computers C-28(9), September 1979, pp. 690–691
  supporting:
    - citation: Microsoft Research publication record
      genre: official-record
      identifiers: []
      edition: null
    - citation: Microsoft Research author-hosted paper PDF
      genre: primary-literature
      identifiers: []
      edition: null
access:
  - kind: url
    role: publisher
    url: https://www.microsoft.com/en-us/research/publication/make-multiprocessor-computer-correctly-executes-multiprocess-programs/
    retrieved: 2026-07-25
    version: IEEE Transactions on Computers C-28(9), September 1979, pp. 690–691
  - kind: url
    role: publisher
    url: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/How-to-Make-a-Multiprocessor-Computer-That-Correctly-Executes-Multiprocess-Programs.pdf
    retrieved: 2026-07-25
    version: IEEE Transactions on Computers C-28(9), September 1979, pp. 690–691
---

## 개요

[[How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs]]은 Leslie Lamport가 1979년에 발표한 짧은 논문으로, 다중 프로세서의 메모리 실행이 언제 올바르다고 할 수 있는지 순차 일관성(sequential consistency)으로 정의한다. 모든 프로세서의 메모리 연산이 어떤 하나의 순차적 순서로 실행된 것처럼 보이고 각 프로세서의 연산이 자기 프로그램이 지정한 순서로 나타날 때, 그 실행은 순차 일관적이다.

논문은 각 프로세서가 개별적으로 순차 실행한다고 해도, 프로세서와 메모리 모듈의 결합 결과가 자동으로 순차 일관적이지는 않다고 지적한다. 특히 동기화 알고리즘은 한 프로세서 안에서 명령이 어떻게 보이는지뿐 아니라 다른 프로세서가 읽고 쓰는 공유 상태의 관찰 순서에 의존한다.

이 논문은 하나의 구현 비용 모델이나 모든 현대 메모리 모형의 사양을 제공하지 않는다. 대신 공유 메모리 동시성에서 각 프로세서의 프로그램 순서와 시스템 전체의 관찰 순서를 구분해 정확성 조건으로 명시한 기준점이다.

## 주요 인사이트

- 각 프로세서의 프로그램 순서를 지키는 일과 시스템 전체가 하나의 일관된 메모리 순서를 보이는 일은 다른 요구다.
- 개별 프로세서가 순차적으로 보인다는 사실만으로 다중 프로세서 실행의 동기화 알고리즘이 올바르다고 결론낼 수 없다.
- 순차 일관성은 실행 시간, 처리량, 공정성 또는 장애 복구를 직접 보장하는 성능·운영 지표가 아니다.
- 읽기·쓰기의 관찰 순서를 명시하지 않으면 임계 구역 진입 같은 동기화 알고리즘의 안전성 추론이 깨질 수 있다.
- 이 정의는 이후 약한 메모리 모형을 비교할 때 무엇을 완화하는지 밝히는 기준선으로 쓰인다.

## 인용할 만한 구절

> “the result of any execution is the same as if”
<!-- wiki-v2:quote-locator evidence="ref-094" locator="wiki/sources/How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs.md:line-19#인용할-만한-구절" status="recorded" -->

순차 일관성은 실제 내부 실행이 직렬이라는 뜻이 아니라, 관찰 가능한 결과가 가능한 하나의 순차 실행과 같아야 한다는 조건이다.

## 위키 반영

이 자료는 [[순차 일관성]]에서 프로세서별 프로그램 순서와 전역 메모리 순서를 함께 보존해야 한다는 정의의 직접 근거다. [[한 프로그램의 순서는 여러 실행 주체에서 어떻게 보존되는가]]에서는 임계 구역의 배타성, 메모리 연산의 관찰 순서, 객체 연산의 결과 계약이 서로 다른 단위임을 설명하는 중간 고리로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[순차 일관성]] | 각 프로세서의 프로그램 순서를 보존하면서 모든 메모리 연산이 하나의 순차적 순서로 보이는 정확성 조건을 정의한다. | [[How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs]] |
| constrains | [[동시성]] | 공유 메모리에서 겹쳐 진행하는 프로세서의 읽기·쓰기가 관찰될 수 있는 순서에 전역 조건을 부과한다. | [[How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Microsoft Research, [publication record](https://www.microsoft.com/en-us/research/publication/make-multiprocessor-computer-correctly-executes-multiprocess-programs/)
- Microsoft Research, [paper PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/How-to-Make-a-Multiprocessor-Computer-That-Correctly-Executes-Multiprocess-Programs.pdf)

## 관련 항목

- [[순차 일관성]] — 프로세서별 프로그램 순서와 전역 메모리 순서를 구분해 정의한다.
- [[동시성]] — 여러 실행 주체가 공유 상태를 관찰·갱신할 때 생기는 상위 문제를 다룬다.
- [[캐시 메모리]] — 빠른 사본 계층이 성능뿐 아니라 공유 데이터의 관찰 조건과 만나는 위치를 확인한다.
- [[선형화 가능성]] — 메모리 연산보다 큰 객체 연산의 외부 관찰 순서를 다룬다.
