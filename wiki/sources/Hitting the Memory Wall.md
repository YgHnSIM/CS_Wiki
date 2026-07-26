---
schema_version: 2
id: ref-039
kind: reference
title: Hitting the Memory Wall
aliases:
  - Wulf-McKee 1995
  - 메모리 장벽 논문
  - Memory wall paper
summary: 프로세서 속도와 DRAM 속도의 격차가 커지면 전체 실행 시간이 메모리 접근에 지배될 수 있다고 경고하며 메모리 장벽이라는 문제를 제기한 논문.
domains:
  - computer-architecture
  - computer-history
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-16
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:0add371f058eef8fbc7be64f54c06dfa3b6b8dcd9bb9cb8aeeac6192968527a0
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - realized-performance
  - scalability
history:
  publication_year: 1995
  layer: architecture
redirect_from:
  - /references/hitting-the-memory-wall/
  - /sources/hitting-the-memory-wall/
origin: external
works:
  primary:
    - citation: ACM SIGARCH Computer Architecture News 23(1), 1995
      genre: other
      identifiers: []
      edition: Computer Architecture News 23(1), March 1995
  supporting:
    - citation: University of Virginia repository record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: doi
    url: https://doi.org/10.1145/216585.216588
    retrieved: 2026-07-16
    version: Computer Architecture News 23(1), March 1995
  - kind: url
    role: mirror
    url: https://libraopen.library.virginia.edu/entities/publication/a6907010-027d-405e-8f0b-4707e1263ad9
    retrieved: 2026-07-16
    version: Computer Architecture News 23(1), March 1995
---

## 개요

[[Hitting the Memory Wall]]은 Wm. A. Wulf와 Sally A. McKee가 1995년에 발표한 짧은 논문이다. 저자들은 마이크로프로세서 속도가 DRAM 속도보다 훨씬 빠르게 향상되는 추세가 계속되면 프로그램 실행 시간이 연산보다 메모리 접근에 지배되는 [[메모리 장벽]]에 이른다고 주장했다.

핵심은 메모리 지연 시간이 절대적으로 변하지 않는다는 말이 아니라 **프로세서 사이클로 환산한 메모리 접근 비용**이 커진다는 점이다. 프로세서가 더 많은 명령을 짧은 시간에 처리하더라도 필요한 데이터가 도착할 때까지 기다린다면 최고 연산 성능은 실제 실행 시간으로 전환되지 않는다.

캐시는 평균 접근 시간을 낮추지만 문제를 없애지는 않는다. 작업 집합이 캐시에 맞지 않거나 지역성이 낮은 경우, 불규칙한 접근과 캐시 미스가 성능을 지배한다. 저자들은 기존의 캐시 개선만으로 장기적인 속도 격차를 흡수하기 어렵다고 보고 구조와 알고리즘을 함께 재검토해야 한다고 제안했다.

이 문제 제기는 이후 대역폭, 지연 시간, 데이터 지역성, 프리페칭, 메모리 수준 병렬성, 연산 집약도를 성능 분석의 중심에 놓는 흐름으로 이어졌다. [[Roofline An Insightful Visual Performance Model]]은 이 문제를 메모리 대역폭과 연산 집약도의 상한으로 정량화한다.

## 주요 인사이트

- 프로세서와 DRAM의 개선 속도 차이가 실제 응용 성능의 병목을 만든다.
- 메모리 비용은 나노초뿐 아니라 프로세서가 기다리는 사이클 수로 해석해야 한다.
- 최고 연산률 증가는 데이터 공급이 따라오지 않으면 달성 성능으로 이어지지 않는다.
- 캐시는 중요한 완화책이지만 모든 작업의 지역성을 보장하지 않는다.
- 성능 향상은 연산 장치와 메모리 계층을 함께 설계해야 한다.

## 인용할 만한 구절

> 실행 시간이 거의 전적으로 메모리 접근에 의해 결정되는 지점이 메모리 장벽이다.
<!-- wiki-v2:quote-locator evidence="ref-039" locator="wiki/sources/Hitting the Memory Wall.md:line-21#인용할-만한-구절" status="recorded" -->

논문의 문제 정의를 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[메모리 장벽]]의 역사적 문제 제기를 제공한다. [[컴퓨팅 능력의 발달사]]에서는 클럭과 명령 처리량 중심의 향상이 데이터 이동 비용과 충돌하면서 성능의 중심이 메모리 계층·병렬성·지역성으로 이동한 전환점으로 사용한다.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- ACM, [DOI record](https://doi.org/10.1145/216585.216588)
- University of Virginia, [repository record](https://libraopen.library.virginia.edu/entities/publication/a6907010-027d-405e-8f0b-4707e1263ad9)

## 관련 항목

- [[메모리 장벽]]
- [[Roofline An Insightful Visual Performance Model]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
